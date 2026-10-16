import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createQueryClient, type QueryClient } from '@nft/shared-query';
import type { RealtimeClient } from '@nft/shared-realtime';
import type { Session } from '@nft/shared-contracts';
import { createTokenStore, createResumeStore } from '@nft/auth-data-access';
import { SessionController } from './session-controller';

const mockUserA: Session = {
  token: 'token_user_a',
  user: {
    id: 'user_a',
    displayName: 'User A',
    username: 'user_a',
    email: 'usera@example.com',
    avatarUrl: null,
    bio: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  expiresAt: '2026-01-02T00:00:00.000Z',
};

const mockUserB: Session = {
  token: 'token_user_b',
  user: {
    id: 'user_b',
    displayName: 'User B',
    username: 'user_b',
    email: 'userb@example.com',
    avatarUrl: null,
    bio: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  expiresAt: '2026-01-02T00:00:00.000Z',
};

function createMockRealtimeClient(): RealtimeClient {
  const client = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    auth: {} as Record<string, unknown>,
    setAuthToken: vi.fn((token: string | null) => {
      client.auth['token'] = token;
    }),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  };
  return client as unknown as RealtimeClient;
}

function createInMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
    clear: () => map.clear(),
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    get length() {
      return map.size;
    },
  };
}

describe('SessionController (@nft/auth-feature)', () => {
  let queryClient: QueryClient;
  let realtimeClient: RealtimeClient;
  let tokenStore: ReturnType<typeof createTokenStore>;
  let resumeStore: ReturnType<typeof createResumeStore>;
  let navigateMock: ReturnType<typeof vi.fn>;
  let announceMock: ReturnType<typeof vi.fn>;
  let controller: SessionController;

  beforeEach(() => {
    queryClient = createQueryClient();
    realtimeClient = createMockRealtimeClient();
    tokenStore = createTokenStore(createInMemoryStorage());
    resumeStore = createResumeStore(createInMemoryStorage());
    navigateMock = vi.fn();
    announceMock = vi.fn();

    controller = new SessionController({
      queryClient,
      realtimeClient,
      tokenStore,
      resumeStore,
      navigate: navigateMock,
      onAnnounce: announceMock,
      getCurrentLocation: () => ({ pathname: '/checkout', search: '?step=review' }),
    });
  });

  it('starts in loading status and updates to unauthenticated', () => {
    expect(controller.getState()).toEqual({ status: 'loading', session: null });

    controller.setUnauthenticated();
    expect(controller.getState()).toEqual({ status: 'unauthenticated', session: null });
  });

  describe('User Switching & Cache Purging (A -> B)', () => {
    it('sets initial session, sets socket token without connecting, and stores token', async () => {
      await controller.setSession(mockUserA);

      expect(controller.getState()).toEqual({
        status: 'authenticated',
        session: mockUserA,
      });
      expect(tokenStore.getToken()).toBe('token_user_a');
      expect(realtimeClient.connect).not.toHaveBeenCalled();
      expect(realtimeClient.auth['token']).toBe('token_user_a');
    });

    it('cancels queries, clears private cache for user A and reconnects socket when user B authenticates', async () => {
      await controller.setSession(mockUserA);

      // Populate private and public queries in queryClient
      queryClient.setQueryData(['user', 'user_a', 'profile'], { secret: 'alice_secret' });
      queryClient.setQueryData(['catalog', 'items'], [{ id: 'nft-1' }]);

      const cancelQueriesSpy = vi.spyOn(queryClient, 'cancelQueries');

      // User B authenticates
      await controller.setSession(mockUserB);

      expect(cancelQueriesSpy).toHaveBeenCalled();
      expect(realtimeClient.disconnect).toHaveBeenCalled();
      expect(tokenStore.getToken()).toBe('token_user_b');

      // Verify User A's private cache is completely purged
      expect(queryClient.getQueryData(['user', 'user_a', 'profile'])).toBeUndefined();
      // Public catalog remains untouched
      expect(queryClient.getQueryData(['catalog', 'items'])).toEqual([{ id: 'nft-1' }]);
    });
  });

  describe('Idempotent Concurrent Session Expiration', () => {
    it('executes expiration only once when triggered concurrently', async () => {
      await controller.setSession(mockUserA);

      // Trigger 3 concurrent expiration events (e.g. from 3 parallel 401 API responses)
      await Promise.all([
        controller.handleSessionExpired({ draftCart: 'saved' }),
        controller.handleSessionExpired({ draftCart: 'saved' }),
        controller.handleSessionExpired({ draftCart: 'saved' }),
      ]);

      // Exactly ONE announcement and redirect
      expect(announceMock).toHaveBeenCalledTimes(1);
      expect(announceMock).toHaveBeenCalledWith('Sua sessão expirou');

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith(
        '/login?redirect=%2Fcheckout%3Fstep%3Dreview&reason=expired',
      );

      // State is unauthenticated and token is cleared
      expect(controller.getState()).toEqual({ status: 'unauthenticated', session: null });
      expect(tokenStore.getToken()).toBeNull();

      // ResumeStore saved the context
      const savedContext = resumeStore.getContext();
      expect(savedContext?.userId).toBe('user_a');
      expect(savedContext?.path).toBe('/checkout');
      expect(savedContext?.search).toBe('?step=review');
    });
  });

  describe('Draft Restoration upon Re-authentication', () => {
    it('restores drafts and redirects when same user re-authenticates', async () => {
      await controller.setSession(mockUserA);
      await controller.handleSessionExpired({ itemDraft: 'preview' });

      // Alice logs back in
      navigateMock.mockClear();
      await controller.setSession(mockUserA);

      expect(navigateMock).toHaveBeenCalledWith('/checkout?step=review');
      expect(resumeStore.getContext()).toBeNull();
    });

    it('discards drafts when a different user authenticates after expiration', async () => {
      await controller.setSession(mockUserA);
      await controller.handleSessionExpired({ secretAliceDraft: 'important' });

      // Bob logs in instead of Alice
      navigateMock.mockClear();
      await controller.setSession(mockUserB);

      expect(navigateMock).toHaveBeenCalledWith('/checkout?step=review');
      expect(resumeStore.getContext()).toBeNull();
    });
  });

  describe('Logout & Tab Sync', () => {
    it('clears session, cache, token, and ResumeStore on explicit logout', async () => {
      await controller.setSession(mockUserA);
      resumeStore.saveContext({
        userId: 'user_a',
        path: '/profile',
        search: '',
        drafts: {},
        savedAt: '2026-01-01T00:00:00.000Z',
      });

      await controller.logout();

      expect(controller.getState()).toEqual({ status: 'unauthenticated', session: null });
      expect(tokenStore.getToken()).toBeNull();
      expect(resumeStore.getContext()).toBeNull();
      expect(realtimeClient.disconnect).toHaveBeenCalled();
    });

    it('syncs logout across browser tabs when storage event indicates token removal', async () => {
      await controller.setSession(mockUserA);

      // Simulate another tab clearing the token
      await controller.handleStorageEvent({
        key: 'nft.session.token',
        newValue: null,
      });

      expect(controller.getState()).toEqual({ status: 'unauthenticated', session: null });
    });
  });
});
