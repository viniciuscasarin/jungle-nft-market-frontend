export const SESSION_TOKEN_KEY = 'nft.session.token';
export const GUEST_ID_KEY = 'nft.guest.id';

export interface TokenStore {
  getToken(): string | null;
  setToken(token: string): void;
  clearToken(): void;
}

export function createTokenStore(storage?: Storage): TokenStore {
  const getStorage = (): Storage | undefined => {
    if (storage) return storage;
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    return undefined;
  };

  return {
    getToken(): string | null {
      try {
        return getStorage()?.getItem(SESSION_TOKEN_KEY) ?? null;
      } catch {
        return null;
      }
    },
    setToken(token: string): void {
      try {
        getStorage()?.setItem(SESSION_TOKEN_KEY, token);
      } catch {
        // Fallback gracefully if storage is disabled or quota exceeded
      }
    },
    clearToken(): void {
      try {
        getStorage()?.removeItem(SESSION_TOKEN_KEY);
      } catch {
        // Fallback gracefully
      }
    },
  };
}

export const tokenStore: TokenStore = createTokenStore();

export function getOrCreateGuestId(storage?: Storage): string {
  const getStorage = (): Storage | undefined => {
    if (storage) return storage;
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    return undefined;
  };

  try {
    const existing = getStorage()?.getItem(GUEST_ID_KEY);
    if (existing) {
      return existing;
    }
    const newGuestId = `guest_${globalThis.crypto.randomUUID().replace(/-/g, '')}`;
    getStorage()?.setItem(GUEST_ID_KEY, newGuestId);
    return newGuestId;
  } catch {
    return `guest_${globalThis.crypto.randomUUID().replace(/-/g, '')}`;
  }
}

export function clearGuestId(storage?: Storage): void {
  try {
    const targetStorage = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
    targetStorage?.removeItem(GUEST_ID_KEY);
  } catch {
    // Fallback gracefully
  }
}
