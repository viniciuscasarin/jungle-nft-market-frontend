import type {
  Session,
  NftItem,
  Review,
  Cart,
  Order,
  Profile,
  Wallet,
} from '@nft/shared-contracts';
import {
  mockCatalogNfts,
  mockReviews,
  mockUsers,
  mockWallets,
  mockCoupons,
  mockCarts,
  mockFavorites,
  type MockStoredUser,
  type MockCoupon,
  type MockFavorite,
} from '@nft/mocks-fixtures';
import {
  type StorageAdapter,
  LocalStorageAdapter,
  MOCK_STORAGE_KEY,
} from './storage';

export interface MockDatabaseMetadata {
  persistenceDegraded: boolean;
  lastResetAt: string;
}

export interface MockDatabaseState {
  version: number;
  clockOffsetMs: number;
  scenarioId: string;
  users: MockStoredUser[];
  sessions: Session[];
  nfts: NftItem[];
  reviews: Review[];
  favorites: MockFavorite[];
  carts: Cart[];
  coupons: MockCoupon[];
  orders: Order[];
  profiles: Profile[];
  wallets: Wallet[];
  metadata: MockDatabaseMetadata;
}

export function createPristineDatabaseState(scenarioId = 'default'): MockDatabaseState {
  const users: MockStoredUser[] = structuredClone(mockUsers);
  const profiles: Profile[] = users.map((u) => ({
    id: u.id,
    displayName: u.displayName,
    username: u.username,
    email: u.email,
    avatarUrl: u.avatarUrl,
    bio: u.bio,
    createdAt: u.createdAt,
  }));

  return {
    version: 1,
    clockOffsetMs: 0,
    scenarioId,
    users,
    sessions: [],
    nfts: structuredClone(mockCatalogNfts),
    reviews: structuredClone(mockReviews),
    favorites: structuredClone(mockFavorites),
    carts: structuredClone(mockCarts),
    coupons: structuredClone(mockCoupons),
    orders: [],
    profiles,
    wallets: structuredClone(mockWallets),
    metadata: {
      persistenceDegraded: false,
      lastResetAt: '2026-01-01T00:00:00.000Z',
    },
  };
}

let activeStorage: StorageAdapter = new LocalStorageAdapter();
let pristineSnapshot: MockDatabaseState = createPristineDatabaseState('default');
let activeDatabaseState: MockDatabaseState = structuredClone(pristineSnapshot);

export function getStorageAdapter(): StorageAdapter {
  return activeStorage;
}

export function setStorageAdapter(storage: StorageAdapter): void {
  activeStorage = storage;
}

export function getMockDatabase(): MockDatabaseState {
  return activeDatabaseState;
}

export function bumpVersion<T extends { version?: number }>(entity?: T): number {
  activeDatabaseState.version += 1;
  if (entity) {
    entity.version = (entity.version ?? 0) + 1;
  }
  return activeDatabaseState.version;
}

export function persistState(): void {
  try {
    activeStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(activeDatabaseState));
    if (activeStorage.isDegraded) {
      activeDatabaseState.metadata.persistenceDegraded = true;
    }
  } catch {
    activeDatabaseState.metadata.persistenceDegraded = true;
  }
}

export function restorePersistedState(): boolean {
  try {
    const raw = activeStorage.getItem(MOCK_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as MockDatabaseState;
    if (parsed && typeof parsed.version === 'number' && Array.isArray(parsed.nfts)) {
      activeDatabaseState = parsed;
      return true;
    }
  } catch {
    activeDatabaseState.metadata.persistenceDegraded = true;
  }
  return false;
}

export function transaction<R>(fn: (db: MockDatabaseState) => R): R {
  const snapshot = structuredClone(activeDatabaseState);
  try {
    const result = fn(activeDatabaseState);
    bumpVersion();
    persistState();
    return result;
  } catch (err) {
    // Complete rollback to snapshot
    activeDatabaseState = snapshot;
    throw err;
  }
}

export function mergeGuestCart(guestId: string, userId: string): Cart {
  return transaction((db) => {
    const guestCartIndex = db.carts.findIndex(
      (c) => c.id === guestId || c.sessionId === guestId
    );
    const guestCart = guestCartIndex !== -1 ? db.carts[guestCartIndex] : undefined;

    let userCart = db.carts.find((c) => c.userId === userId);
    if (!userCart) {
      userCart = {
        id: `cart_${userId}`,
        userId,
        sessionId: null,
        items: [],
        couponCode: null,
        updatedAt: new Date().toISOString(),
      };
      db.carts.push(userCart);
    }

    if (!guestCart || guestCart.items.length === 0) {
      return userCart;
    }

    for (const guestItem of guestCart.items) {
      // Find matching NFT and edition to verify availableSupply cap
      const nft = db.nfts.find((n) => n.id === guestItem.nftId);
      const edition = nft?.editions.find((e) => e.id === guestItem.editionId);
      const availableSupply = edition ? edition.availableSupply : (guestItem.maxAvailable ?? 99);

      const existingItemIndex = userCart.items.findIndex(
        (i) => i.nftId === guestItem.nftId && i.editionId === guestItem.editionId
      );

      if (existingItemIndex !== -1) {
        const existingItem = userCart.items[existingItemIndex]!;
        const mergedQty = Math.min(existingItem.quantity + guestItem.quantity, availableSupply);
        existingItem.quantity = Math.max(1, mergedQty);
        existingItem.maxAvailable = availableSupply;
      } else {
        const addedQty = Math.min(guestItem.quantity, availableSupply);
        if (addedQty > 0) {
          userCart.items.push({
            ...guestItem,
            id: `item_${userId}_${guestItem.nftId}_${guestItem.editionId}`,
            quantity: addedQty,
            maxAvailable: availableSupply,
          });
        }
      }
    }

    if (guestCart.couponCode && !userCart.couponCode) {
      userCart.couponCode = guestCart.couponCode;
    }
    userCart.updatedAt = new Date().toISOString();

    // Clean up guest cart
    if (guestCartIndex !== -1) {
      db.carts.splice(guestCartIndex, 1);
    }

    return userCart;
  });
}

export function setPristineSnapshot(snapshot: MockDatabaseState): void {
  pristineSnapshot = structuredClone(snapshot);
}

export function resetMockDatabase(customInitialState?: MockDatabaseState): MockDatabaseState {
  if (customInitialState) {
    pristineSnapshot = structuredClone(customInitialState);
  }
  activeStorage.removeItem(MOCK_STORAGE_KEY);
  activeDatabaseState = structuredClone(pristineSnapshot);
  activeDatabaseState.metadata.lastResetAt = new Date().toISOString();
  persistState();
  return activeDatabaseState;
}
