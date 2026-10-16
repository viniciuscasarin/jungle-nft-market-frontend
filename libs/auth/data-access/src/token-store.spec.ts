import { describe, it, expect, beforeEach } from 'vitest';
import {
  createTokenStore,
  getOrCreateGuestId,
  clearGuestId,
  SESSION_TOKEN_KEY,
  GUEST_ID_KEY,
} from './token-store';

describe('TokenStore & GuestId Persistence (@nft/auth-data-access)', () => {
  let mockStorage: Storage;
  let storeMap: Map<string, string>;

  beforeEach(() => {
    storeMap = new Map();
    mockStorage = {
      getItem: (key: string) => storeMap.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storeMap.set(key, value);
      },
      removeItem: (key: string) => {
        storeMap.delete(key);
      },
      clear: () => storeMap.clear(),
      key: (index: number) => Array.from(storeMap.keys())[index] ?? null,
      get length() {
        return storeMap.size;
      },
    };
  });

  describe('TokenStore', () => {
    it('sets, retrieves, and clears token in storage with key nft.session.token', () => {
      const store = createTokenStore(mockStorage);

      expect(store.getToken()).toBeNull();

      store.setToken('tok_abcdef123456');
      expect(store.getToken()).toBe('tok_abcdef123456');
      expect(mockStorage.getItem(SESSION_TOKEN_KEY)).toBe('tok_abcdef123456');

      store.clearToken();
      expect(store.getToken()).toBeNull();
      expect(mockStorage.getItem(SESSION_TOKEN_KEY)).toBeNull();
    });

    it('handles storage errors without crashing', () => {
      const faultyStorage = {
        getItem: () => {
          throw new Error('Access denied');
        },
        setItem: () => {
          throw new Error('Quota exceeded');
        },
        removeItem: () => {
          throw new Error('Access denied');
        },
        clear: () => {},
        key: () => null,
        length: 0,
      };

      const store = createTokenStore(faultyStorage);
      expect(store.getToken()).toBeNull();
      expect(() => store.setToken('test')).not.toThrow();
      expect(() => store.clearToken()).not.toThrow();
    });
  });

  describe('getOrCreateGuestId', () => {
    it('creates and persists a new guest ID on first call', () => {
      expect(mockStorage.getItem(GUEST_ID_KEY)).toBeNull();

      const guestId = getOrCreateGuestId(mockStorage);
      expect(guestId).toMatch(/^guest_/);
      expect(mockStorage.getItem(GUEST_ID_KEY)).toBe(guestId);
    });

    it('returns existing guest ID on subsequent calls without generating a new one', () => {
      mockStorage.setItem(GUEST_ID_KEY, 'guest_existing_123');

      const guestId = getOrCreateGuestId(mockStorage);
      expect(guestId).toBe('guest_existing_123');
    });

    it('clears guest ID using clearGuestId', () => {
      mockStorage.setItem(GUEST_ID_KEY, 'guest_to_clear');
      clearGuestId(mockStorage);
      expect(mockStorage.getItem(GUEST_ID_KEY)).toBeNull();
    });
  });
});
