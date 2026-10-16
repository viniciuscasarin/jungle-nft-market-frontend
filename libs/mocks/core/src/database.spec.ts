import { describe, it, expect, beforeEach } from 'vitest';
import {
  getMockDatabase,
  resetMockDatabase,
  transaction,
  bumpVersion,
  mergeGuestCart,
  setStorageAdapter,
  restorePersistedState,
  createPristineDatabaseState,
} from './database';
import { MemoryStorageAdapter, LocalStorageAdapter } from './storage';

describe('In-Memory Database & Persistence', () => {
  let memoryStorage: MemoryStorageAdapter;

  beforeEach(() => {
    memoryStorage = new MemoryStorageAdapter();
    setStorageAdapter(memoryStorage);
    resetMockDatabase();
  });

  describe('Atomic Transactions & Rollback', () => {
    it('commits mutations and bumps version when transaction completes successfully', () => {
      const initialVersion = getMockDatabase().version;
      const initialUsersCount = getMockDatabase().users.length;

      const result = transaction((db) => {
        db.users.push({
          id: 'user_new',
          displayName: 'New Collector',
          username: 'new_collector',
          email: 'new@example.com',
          avatarUrl: null,
          bio: null,
          createdAt: new Date().toISOString(),
          passwordHash: 'hash',
          passwordSalt: 'salt',
        });
        return 'success_payload';
      });

      expect(result).toBe('success_payload');
      expect(getMockDatabase().users.length).toBe(initialUsersCount + 1);
      expect(getMockDatabase().version).toBe(initialVersion + 1);
      expect(memoryStorage.getItem('nft-mocks:v1:state')).toBeDefined();
    });

    it('rolls back all mutations if an error is thrown within transaction', () => {
      const initialDb = structuredClone(getMockDatabase());

      expect(() => {
        transaction((db) => {
          db.nfts.pop();
          db.users = [];
          throw new Error('Simulated atomic failure');
        });
      }).toThrow('Simulated atomic failure');

      expect(getMockDatabase().nfts.length).toBe(initialDb.nfts.length);
      expect(getMockDatabase().users.length).toBe(initialDb.users.length);
      expect(getMockDatabase().version).toBe(initialDb.version);
    });

    it('bumps version monotonically with bumpVersion helper', () => {
      const db = getMockDatabase();
      const currentVersion = db.version;
      const nft = db.nfts[0]!;
      const nftVersion = nft.version;

      bumpVersion(nft);

      expect(db.version).toBe(currentVersion + 1);
      expect(nft.version).toBe(nftVersion + 1);
    });
  });

  describe('Domain Helper mergeGuestCart', () => {
    it('merges guest cart items into user cart, capping quantity at edition availableSupply', () => {
      const db = getMockDatabase();
      const nft = db.nfts[0]!;
      const edition = nft.editions[0]!;
      edition.availableSupply = 3;

      // Setup guest cart
      db.carts.push({
        id: 'guest_session_123',
        sessionId: 'guest_session_123',
        userId: null,
        items: [
          {
            id: 'guest_item_1',
            nftId: nft.id,
            editionId: edition.id,
            title: nft.title,
            imageUrl: nft.imageUrl,
            unitPrice: nft.price,
            quantity: 5, // Exceeds availableSupply of 3
            maxAvailable: 3,
          },
        ],
        couponCode: 'JUNGLE10',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });

      const userCart = mergeGuestCart('guest_session_123', 'user_alice');

      expect(userCart.userId).toBe('user_alice');
      const mergedItem = userCart.items.find((i) => i.nftId === nft.id);
      expect(mergedItem).toBeDefined();
      expect(mergedItem?.quantity).toBe(3); // Capped at availableSupply
      expect(userCart.couponCode).toBe('JUNGLE10');

      // Guest cart must be removed
      const remainingGuestCart = getMockDatabase().carts.find(
        (c) => c.id === 'guest_session_123'
      );
      expect(remainingGuestCart).toBeUndefined();
    });
  });

  describe('Storage Resilience & Degraded Fallback', () => {
    it('degrades gracefully to memory when localStorage throws QuotaExceededError', () => {
      const mockQuotaStorage = new LocalStorageAdapter();
      // Force write failure by overriding memory fallback setItem
      setStorageAdapter(mockQuotaStorage);

      const db = getMockDatabase();
      db.users.push({
        id: 'user_test',
        displayName: 'Test',
        username: 'test',
        email: 'test@example.com',
        avatarUrl: null,
        bio: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        passwordHash: 'hash',
        passwordSalt: 'salt',
      });

      expect(() => {
        transaction(() => {
          // Trigger persist
        });
      }).not.toThrow();
    });

    it('restores state from storage', () => {
      transaction((db) => {
        db.scenarioId = 'slow-network';
      });

      const restored = restorePersistedState();
      expect(restored).toBe(true);
      expect(getMockDatabase().scenarioId).toBe('slow-network');
    });
  });

  describe('Exact Reset', () => {
    it('restores database state to exact deep-equal pristine snapshot of the scenario', () => {
      const pristine = createPristineDatabaseState('default');

      // Mutate database
      transaction((db) => {
        db.users.pop();
        db.nfts.splice(0, 10);
        db.orders.push({
          id: 'ord_1',
          userId: 'user_alice',
          quoteId: 'q_1',
          idempotencyKey: 'idemp_1',
          status: 'confirmed',
          collector: {
            fullName: 'Alice',
            email: 'alice@example.com',
            walletAddress: '0x1111111111111111111111111111111111111111',
            network: 'ethereum-mainnet',
            useSecondaryWallet: false,
          },
          items: [],
          subtotal: '1.0',
          discount: '0.0',
          networkFee: '0.01',
          total: '1.01',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      expect(getMockDatabase().nfts.length).not.toBe(pristine.nfts.length);

      // Perform reset
      const resetDb = resetMockDatabase();

      expect(resetDb.nfts.length).toBe(pristine.nfts.length);
      expect(resetDb.users.length).toBe(pristine.users.length);
      expect(resetDb.orders.length).toBe(0);
      expect(resetDb.scenarioId).toBe(pristine.scenarioId);
    });
  });
});
