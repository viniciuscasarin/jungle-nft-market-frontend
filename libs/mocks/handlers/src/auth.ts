import { HttpResponse } from 'msw';
import {
  SignUpInputSchema,
  SignInInputSchema,
  ApiErrorCode,
  type User,
  type Session,
} from '@nft/shared-contracts';
import {
  defineHandler,
  apiError,
  parseBody,
  requireSession,
  getMockDatabase,
  getClock,
  hashPassword,
  verifyPassword,
  mergeGuestCart,
} from '@nft/mocks-core';
import type { MockStoredUser } from '@nft/mocks-fixtures';

function sanitizeUser(stored: MockStoredUser): User {
  return {
    id: stored.id,
    displayName: stored.displayName,
    username: stored.username,
    email: stored.email,
    avatarUrl: stored.avatarUrl ?? null,
    bio: stored.bio ?? null,
    createdAt: stored.createdAt,
  };
}

export const authHandlers = [
  defineHandler('POST', '/auth/signup', async ({ request }) => {
    const parseResult = await parseBody(request, SignUpInputSchema);
    if (!parseResult.success) {
      return parseResult.response;
    }

    const { displayName, username, email, password } = parseResult.data;
    const db = getMockDatabase();
    const clock = getClock();

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    // Check for existing email conflict (409 CONFLICT)
    const existingEmail = db.users.find(
      (u) => u.email.trim().toLowerCase() === normalizedEmail
    );
    if (existingEmail) {
      return apiError(ApiErrorCode.CONFLICT, {
        message: 'Conflito ao criar conta.',
        status: 409,
        retryable: false,
        fieldErrors: {
          email: 'Este e-mail já está em uso.',
        },
      });
    }

    // Check for existing username conflict (409 CONFLICT)
    const existingUsername = db.users.find(
      (u) => u.username.trim().toLowerCase() === normalizedUsername
    );
    if (existingUsername) {
      return apiError(ApiErrorCode.CONFLICT, {
        message: 'Conflito ao criar conta.',
        status: 409,
        retryable: false,
        fieldErrors: {
          username: 'Este nome de usuário já está em uso.',
        },
      });
    }

    const { passwordHash, passwordSalt } = await hashPassword(password);
    const userId = `usr_${globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
    const createdAt = clock.toISOString();

    const storedUser: MockStoredUser = {
      id: userId,
      displayName: displayName.trim(),
      username: username.trim(),
      email: normalizedEmail,
      avatarUrl: null,
      bio: null,
      createdAt,
      passwordHash,
      passwordSalt,
    };

    db.users.push(storedUser);
    db.profiles.push({
      id: storedUser.id,
      displayName: storedUser.displayName,
      username: storedUser.username,
      email: storedUser.email,
      avatarUrl: null,
      bio: null,
      createdAt,
    });

    const publicUser = sanitizeUser(storedUser);
    const token = `tok_${globalThis.crypto.randomUUID().replace(/-/g, '')}`;
    const expiresAt = new Date(clock.nowMs() + 30 * 60 * 1000).toISOString();

    const session: Session = {
      token,
      user: publicUser,
      expiresAt,
    };
    db.sessions.push(session);

    // Merge guest cart if guest session header present
    const guestId = request.headers.get('x-session-id') ?? request.headers.get('X-Session-Id');
    if (guestId) {
      mergeGuestCart(guestId, storedUser.id);
    }

    return HttpResponse.json(session, { status: 201 });
  }),

  defineHandler('POST', '/auth/login', async ({ request }) => {
    const parseResult = await parseBody(request, SignInInputSchema);
    if (!parseResult.success) {
      return parseResult.response;
    }

    const { identifier, password } = parseResult.data;
    const db = getMockDatabase();
    const clock = getClock();

    const cleanIdentifier = identifier.trim().toLowerCase();
    const user = db.users.find(
      (u) =>
        u.email.trim().toLowerCase() === cleanIdentifier ||
        u.username.trim().toLowerCase() === cleanIdentifier
    );

    if (!user) {
      return apiError(ApiErrorCode.UNAUTHENTICATED, {
        message: 'E-mail, username ou senha incorretos.',
        status: 401,
        retryable: false,
      });
    }

    const isMatch = await verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!isMatch) {
      return apiError(ApiErrorCode.UNAUTHENTICATED, {
        message: 'E-mail, username ou senha incorretos.',
        status: 401,
        retryable: false,
      });
    }

    const publicUser = sanitizeUser(user);
    const token = `tok_${globalThis.crypto.randomUUID().replace(/-/g, '')}`;
    const expiresAt = new Date(clock.nowMs() + 30 * 60 * 1000).toISOString();

    const session: Session = {
      token,
      user: publicUser,
      expiresAt,
    };
    db.sessions.push(session);

    // Merge guest cart if guest session header present
    const guestId = request.headers.get('x-session-id') ?? request.headers.get('X-Session-Id');
    if (guestId) {
      mergeGuestCart(guestId, user.id);
    }

    return HttpResponse.json(session, { status: 200 });
  }),

  defineHandler('GET', '/auth/session', ({ request }) => {
    const { session, response } = requireSession(request);
    if (response) {
      return response;
    }
    return HttpResponse.json(session, { status: 200 });
  }),

  defineHandler('GET', '/session', ({ request }) => {
    const { session, response } = requireSession(request);
    if (response) {
      return response;
    }
    return HttpResponse.json(session, { status: 200 });
  }),

  defineHandler('POST', '/auth/logout', ({ request }) => {
    const authHeader = request.headers.get('authorization') ?? request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace(/^Bearer\s+/, '').trim();
      const db = getMockDatabase();
      const sessionIndex = db.sessions.findIndex((s) => s.token === token);
      if (sessionIndex !== -1) {
        db.sessions.splice(sessionIndex, 1);
      }
    }

    return HttpResponse.json({ success: true }, { status: 200 });
  }),
];
