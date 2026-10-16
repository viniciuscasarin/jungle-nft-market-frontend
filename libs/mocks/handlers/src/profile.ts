import { HttpResponse } from 'msw';
import {
  UpdateProfileInputSchema,
  UploadAvatarInputSchema,
  ChangePasswordInputSchema,
  ApiErrorCode,
  type Profile,
} from '@nft/shared-contracts';
import {
  defineHandler,
  apiError,
  parseBody,
  requireSession,
  getMockDatabase,
  transaction,
  verifyPassword,
  hashPassword,
} from '@nft/mocks-core';

function getOrInitProfile(userId: string): Profile {
  const db = getMockDatabase();
  let profile = db.profiles.find((p) => p.id === userId);
  if (!profile) {
    const user = db.users.find((u) => u.id === userId);
    profile = {
      id: userId,
      displayName: user?.displayName ?? 'Collector',
      username: user?.username ?? userId,
      email: user?.email ?? `${userId}@jungle.market`,
      avatarUrl: user?.avatarUrl ?? null,
      bio: user?.bio ?? null,
      ensName: null,
      walletNickname: null,
      createdAt: user?.createdAt ?? new Date().toISOString(),
    };
    db.profiles.push(profile);
  }
  return profile;
}

export const profileHandlers = [
  defineHandler('GET', '/profile', ({ request }) => {
    const { session, response } = requireSession(request);
    if (response || !session) {
      return response!;
    }

    const profile = getOrInitProfile(session.user.id);
    return HttpResponse.json(profile, { status: 200 });
  }),

  defineHandler('PUT', '/profile', async ({ request }) => {
    return handleUpdateProfile(request);
  }),

  defineHandler('PATCH', '/profile', async ({ request }) => {
    return handleUpdateProfile(request);
  }),

  defineHandler('POST', '/profile/avatar', async ({ request }) => {
    const { session, response } = requireSession(request);
    if (response || !session) {
      return response!;
    }

    const parseResult = await parseBody(request, UploadAvatarInputSchema);
    if (!parseResult.success) {
      return parseResult.response;
    }

    const { avatarUrl } = parseResult.data;
    const userId = session.user.id;

    const updatedProfile = transaction((db) => {
      const profile = getOrInitProfile(userId);
      profile.avatarUrl = avatarUrl;

      const user = db.users.find((u) => u.id === userId);
      if (user) {
        user.avatarUrl = avatarUrl;
      }

      for (const s of db.sessions) {
        if (s.user.id === userId) {
          s.user.avatarUrl = avatarUrl;
        }
      }

      return profile;
    });

    return HttpResponse.json(updatedProfile, { status: 200 });
  }),

  defineHandler('DELETE', '/profile/avatar', ({ request }) => {
    const { session, response } = requireSession(request);
    if (response || !session) {
      return response!;
    }

    const userId = session.user.id;

    const updatedProfile = transaction((db) => {
      const profile = getOrInitProfile(userId);
      profile.avatarUrl = null;

      const user = db.users.find((u) => u.id === userId);
      if (user) {
        user.avatarUrl = null;
      }

      for (const s of db.sessions) {
        if (s.user.id === userId) {
          s.user.avatarUrl = null;
        }
      }

      return profile;
    });

    return HttpResponse.json(updatedProfile, { status: 200 });
  }),

  defineHandler('POST', '/profile/password', async ({ request }) => {
    return handleChangePassword(request);
  }),

  defineHandler('POST', '/profile/change-password', async ({ request }) => {
    return handleChangePassword(request);
  }),
];

async function handleUpdateProfile(request: Request) {
  const { session, response } = requireSession(request);
  if (response || !session) {
    return response!;
  }

  const parseResult = await parseBody(request, UpdateProfileInputSchema);
  if (!parseResult.success) {
    return parseResult.response;
  }

  const data = parseResult.data;
  const db = getMockDatabase();
  const userId = session.user.id;

  // Conflict validation: email uniqueness
  if (data.email) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const existing = db.users.find(
      (u) => u.id !== userId && u.email.trim().toLowerCase() === normalizedEmail
    );
    if (existing) {
      return apiError(ApiErrorCode.CONFLICT, {
        status: 409,
        message: 'Conflito ao atualizar perfil.',
        fieldErrors: {
          email: 'Este e-mail já está em uso por outro usuário.',
        },
      });
    }
  }

  // Conflict validation: username uniqueness
  if (data.username) {
    const normalizedUsername = data.username.trim().toLowerCase();
    const existing = db.users.find(
      (u) => u.id !== userId && u.username.trim().toLowerCase() === normalizedUsername
    );
    if (existing) {
      return apiError(ApiErrorCode.CONFLICT, {
        status: 409,
        message: 'Conflito ao atualizar perfil.',
        fieldErrors: {
          username: 'Este nome de usuário já está em uso.',
        },
      });
    }
  }

  const updatedProfile = transaction((currentDb) => {
    const profile = getOrInitProfile(userId);
    const user = currentDb.users.find((u) => u.id === userId);

    if (data.displayName !== undefined) {
      profile.displayName = data.displayName;
      if (user) user.displayName = data.displayName;
    }
    if (data.username !== undefined) {
      profile.username = data.username;
      if (user) user.username = data.username;
    }
    if (data.email !== undefined) {
      profile.email = data.email;
      if (user) user.email = data.email;
    }
    if (data.bio !== undefined) {
      profile.bio = data.bio;
      if (user) user.bio = data.bio;
    }
    if (data.avatarUrl !== undefined) {
      profile.avatarUrl = data.avatarUrl;
      if (user) user.avatarUrl = data.avatarUrl;
    }
    if (data.ensName !== undefined) {
      profile.ensName = data.ensName;
    }
    if (data.walletNickname !== undefined) {
      profile.walletNickname = data.walletNickname;
    }

    // Sync active session user
    for (const s of currentDb.sessions) {
      if (s.user.id === userId) {
        s.user.displayName = profile.displayName;
        s.user.username = profile.username;
        s.user.email = profile.email;
        s.user.avatarUrl = profile.avatarUrl;
        s.user.bio = profile.bio;
      }
    }

    return profile;
  });

  return HttpResponse.json(updatedProfile, { status: 200 });
}

async function handleChangePassword(request: Request) {
  const { session, response } = requireSession(request);
  if (response || !session) {
    return response!;
  }

  const parseResult = await parseBody(request, ChangePasswordInputSchema);
  if (!parseResult.success) {
    return parseResult.response;
  }

  const { currentPassword, newPassword } = parseResult.data;
  const db = getMockDatabase();
  const userId = session.user.id;
  const storedUser = db.users.find((u) => u.id === userId);

  if (!storedUser) {
    return apiError(ApiErrorCode.NOT_FOUND, {
      status: 404,
      message: 'Usuário não encontrado.',
    });
  }

  const isValidCurrent = await verifyPassword(
    currentPassword,
    storedUser.passwordHash,
    storedUser.passwordSalt
  );

  if (!isValidCurrent) {
    return apiError(ApiErrorCode.VALIDATION_ERROR, {
      status: 400,
      message: 'A senha atual informada está incorreta.',
      fieldErrors: {
        currentPassword: 'A senha atual informada está incorreta.',
      },
    });
  }

  const { passwordHash, passwordSalt } = await hashPassword(newPassword);

  transaction(() => {
    storedUser.passwordHash = passwordHash;
    storedUser.passwordSalt = passwordSalt;
  });

  return HttpResponse.json({ success: true }, { status: 200 });
}
