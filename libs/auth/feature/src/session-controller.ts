import type { QueryClient } from '@nft/shared-query';
import { clearPrivateCache, queryKeys } from '@nft/shared-query';
import type { RealtimeClient } from '@nft/shared-realtime';
import type { Session } from '@nft/shared-contracts';
import {
  tokenStore as defaultTokenStore,
  resumeStore as defaultResumeStore,
  SESSION_TOKEN_KEY,
  type TokenStore,
  type ResumeStore,
} from '@nft/auth-data-access';
import { sanitizeRedirect } from '@nft/auth-domain';

export type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface SessionState {
  status: SessionStatus;
  session: Session | null;
}

export type SessionListener = (state: SessionState) => void;

export interface SessionControllerDependencies {
  queryClient: QueryClient;
  realtimeClient: RealtimeClient;
  tokenStore?: TokenStore;
  resumeStore?: ResumeStore;
  navigate?: (to: string) => void;
  onAnnounce?: (message: string) => void;
  getCurrentLocation?: () => { pathname: string; search: string };
  windowObject?: Window;
}

/**
 * Pure state machine controller for authentication and session lifecycle.
 * Ensures strict cache purging, socket reconnection, idempotent expiration,
 * draft preservation via ResumeStore, and cross-tab synchronization.
 */
export class SessionController {
  private state: SessionState = { status: 'loading', session: null };
  private readonly listeners = new Set<SessionListener>();
  private isExpiring = false;
  private readonly storageListener: (e: StorageEvent) => void;

  public readonly tokenStore: TokenStore;
  public readonly resumeStore: ResumeStore;

  constructor(private readonly deps: SessionControllerDependencies) {
    this.tokenStore = deps.tokenStore ?? defaultTokenStore;
    this.resumeStore = deps.resumeStore ?? defaultResumeStore;

    this.storageListener = (event: StorageEvent) => {
      this.handleStorageEvent(event);
    };

    const win = deps.windowObject ?? (typeof window !== 'undefined' ? window : undefined);
    win?.addEventListener?.('storage', this.storageListener);
  }

  public getState(): SessionState {
    return this.state;
  }

  public subscribe(listener: SessionListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  private async cleanupPreviousUser(prevUserId?: string): Promise<void> {
    // 1. Cancel running queries immediately
    await this.deps.queryClient.cancelQueries();
    // 2. Clear private query cache for previous user
    clearPrivateCache(this.deps.queryClient, prevUserId);
    // 3. Disconnect socket connection
    this.deps.realtimeClient.disconnect();
  }

  /**
   * Registers a newly authenticated session (login or registration).
   * Purges previous user data if identity changes, restores drafts, and reconnects socket.
   */
  public async setSession(newSession: Session): Promise<void> {
    const prevUserId = this.state.session?.user.id;

    if (prevUserId && prevUserId !== newSession.user.id) {
      await this.cleanupPreviousUser(prevUserId);
    }

    this.tokenStore.setToken(newSession.token);

    // Update socket token (connection is managed on-demand by active subscriptions)
    if (typeof this.deps.realtimeClient.setAuthToken === 'function') {
      this.deps.realtimeClient.setAuthToken(newSession.token);
    } else if (this.deps.realtimeClient.auth && typeof this.deps.realtimeClient.auth === 'object') {
      (this.deps.realtimeClient.auth as Record<string, unknown>)['token'] = newSession.token;
    }

    this.state = { status: 'authenticated', session: newSession };
    await this.deps.queryClient.cancelQueries({ queryKey: queryKeys.cart.all() });
    this.deps.queryClient.removeQueries({ queryKey: queryKeys.cart.lists() });
    this.deps.queryClient.removeQueries({ queryKey: queryKeys.cart.counts() });
    await this.deps.queryClient.invalidateQueries({ queryKey: queryKeys.cart.all() });
    this.notify();

    // Check if ResumeStore has context to restore
    const restored = this.resumeStore.restoreForUser(newSession.user.id);
    if (restored) {
      const destination = sanitizeRedirect(restored.path + restored.search);
      if (destination && destination !== '/') {
        this.deps.navigate?.(destination);
      }
    }
  }

  /**
   * Marks session as unauthenticated without expiration warning (e.g., initial boot when no token exists).
   */
  public setUnauthenticated(): void {
    this.state = { status: 'unauthenticated', session: null };
    this.notify();
  }

  /**
   * Explicit user logout. Purges queries, cache, socket connection, token, and clears ResumeStore context.
   */
  public async logout(): Promise<void> {
    const prevUserId = this.state.session?.user.id;
    await this.cleanupPreviousUser(prevUserId);

    if (typeof this.deps.realtimeClient.setAuthToken === 'function') {
      this.deps.realtimeClient.setAuthToken(null);
    } else if (this.deps.realtimeClient.auth && typeof this.deps.realtimeClient.auth === 'object') {
      delete (this.deps.realtimeClient.auth as Record<string, unknown>)['token'];
    }

    this.tokenStore.clearToken();
    this.resumeStore.clearContext();

    this.state = { status: 'unauthenticated', session: null };
    this.notify();
  }

  /**
   * Handles 401 SESSION_EXPIRED error idempotently.
   * Concurrent invocations are blocked by isExpiring flag.
   */
  public async handleSessionExpired(drafts?: Record<string, unknown>): Promise<void> {
    if (this.isExpiring) {
      return;
    }
    this.isExpiring = true;

    try {
      const prevUserId = this.state.session?.user.id;
      const loc = this.deps.getCurrentLocation?.() ?? {
        pathname: typeof window !== 'undefined' ? window.location.pathname : '/',
        search: typeof window !== 'undefined' ? window.location.search : '',
      };

      if (prevUserId) {
        this.resumeStore.saveContext({
          userId: prevUserId,
          path: loc.pathname,
          search: loc.search,
          drafts: drafts ?? {},
          savedAt: new Date().toISOString(),
        });
      }

      await this.cleanupPreviousUser(prevUserId);
      this.tokenStore.clearToken();

      this.deps.onAnnounce?.('Sua sessão expirou');

      const redirectTarget = loc.pathname + loc.search;
      const encodedRedirect = encodeURIComponent(redirectTarget);
      this.deps.navigate?.(`/login?redirect=${encodedRedirect}&reason=expired`);

      this.state = { status: 'unauthenticated', session: null };
      this.notify();
    } finally {
      this.isExpiring = false;
    }
  }

  /**
   * Synchronizes session state across browser tabs via storage events.
   */
  public async handleStorageEvent(event: { key: string | null; newValue: string | null }): Promise<void> {
    if (event.key === SESSION_TOKEN_KEY) {
      // If token was removed in another tab, log out immediately in this tab
      if (!event.newValue && this.state.status === 'authenticated') {
        await this.logout();
      }
    }
  }

  /**
   * Clean up event listeners.
   */
  public destroy(): void {
    const win = this.deps.windowObject ?? (typeof window !== 'undefined' ? window : undefined);
    win?.removeEventListener?.('storage', this.storageListener);
    this.listeners.clear();
  }
}
