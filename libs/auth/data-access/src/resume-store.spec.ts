import { describe, it, expect, beforeEach } from 'vitest';
import {
  createResumeStore,
  RESUME_CONTEXT_KEY,
  type ResumeContext,
} from './resume-store';

describe('ResumeStore (@nft/auth-data-access)', () => {
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

  it('saves and retrieves resume context with key nft.resume.context', () => {
    const store = createResumeStore(mockStorage);
    const context: ResumeContext = {
      userId: 'user_alice',
      path: '/checkout',
      search: '?step=review',
      drafts: { buyerNote: 'Please wrap as gift' },
      savedAt: '2026-01-01T12:00:00.000Z',
    };

    store.saveContext(context);
    expect(store.getContext()).toEqual(context);
    expect(mockStorage.getItem(RESUME_CONTEXT_KEY)).toBe(JSON.stringify(context));
  });

  it('restores drafts when the same user logs back in and clears context', () => {
    const store = createResumeStore(mockStorage);
    const context: ResumeContext = {
      userId: 'user_alice',
      path: '/checkout',
      search: '?step=review',
      drafts: { buyerNote: 'Please wrap as gift' },
      savedAt: '2026-01-01T12:00:00.000Z',
    };

    store.saveContext(context);

    const restored = store.restoreForUser('user_alice');
    expect(restored).toEqual({
      path: '/checkout',
      search: '?step=review',
      drafts: { buyerNote: 'Please wrap as gift' },
      isSameUser: true,
    });

    // Context is cleared after restore
    expect(store.getContext()).toBeNull();
  });

  it('discards drafts when a different user logs in, preserving only navigation path', () => {
    const store = createResumeStore(mockStorage);
    const context: ResumeContext = {
      userId: 'user_alice',
      path: '/checkout',
      search: '?step=review',
      drafts: { buyerNote: 'Confidential Alice draft' },
      savedAt: '2026-01-01T12:00:00.000Z',
    };

    store.saveContext(context);

    // User Bob logs in instead of Alice
    const restored = store.restoreForUser('user_bob');
    expect(restored).toEqual({
      path: '/checkout',
      search: '?step=review',
      drafts: {},
      isSameUser: false,
    });

    // Context is cleared after restore
    expect(store.getContext()).toBeNull();
  });

  it('returns null when restoring from empty storage', () => {
    const store = createResumeStore(mockStorage);
    expect(store.restoreForUser('user_alice')).toBeNull();
  });

  it('clears context on explicit clearContext', () => {
    const store = createResumeStore(mockStorage);
    store.saveContext({
      userId: 'user_alice',
      path: '/checkout',
      search: '',
      drafts: {},
      savedAt: '2026-01-01T12:00:00.000Z',
    });

    store.clearContext();
    expect(store.getContext()).toBeNull();
  });
});
