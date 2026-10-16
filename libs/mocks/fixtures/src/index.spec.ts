import { describe, it, expect, beforeAll } from 'vitest';
import type { ZodSchema } from 'zod';
import {
  mockCollections,
  mockCatalogNfts,
  mockReviews,
  mockUsers,
  mockWallets,
  mockCoupons,
  mockCarts,
  mockFavorites,
} from './index';

let NftItemSchema: ZodSchema;
let ReviewSchema: ZodSchema;
let UserSchema: ZodSchema;
let WalletSchema: ZodSchema;
let CartSchema: ZodSchema;

describe('Domain Fixtures Compliance and Minimums', () => {
  beforeAll(async () => {
    const contracts = await import('@nft/shared-contracts');
    NftItemSchema = contracts.NftItemSchema;
    ReviewSchema = contracts.ReviewSchema;
    UserSchema = contracts.UserSchema;
    WalletSchema = contracts.WalletSchema;
    CartSchema = contracts.CartSchema;
  });
  describe('Catalog & Collections', () => {
    it('contains at least 5 collections spanning 3 networks', () => {
      expect(mockCollections.length).toBeGreaterThanOrEqual(5);
      const networks = new Set(mockCollections.map((c) => c.network));
      expect(networks.has('ethereum')).toBe(true);
      expect(networks.has('polygon')).toBe(true);
      expect(networks.has('solana')).toBe(true);
    });

    it('contains at least 48 NFTs adhering strictly to NftItemSchema', () => {
      expect(mockCatalogNfts.length).toBeGreaterThanOrEqual(48);

      for (const nft of mockCatalogNfts) {
        expect(() => NftItemSchema.parse(nft)).not.toThrow();
        expect(typeof nft.price).toBe('string');
        expect(nft.price).toMatch(/^\d+(\.\d+)?$/);
        expect(nft.editions.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('includes an NFT with >= 25 reviews count and an NFT with 0 reviews', () => {
      const nftWithManyReviews = mockCatalogNfts.find((n) => n.id === 'nft-01');
      expect(nftWithManyReviews).toBeDefined();
      expect(nftWithManyReviews?.rating.count).toBeGreaterThanOrEqual(25);

      const nftWithZeroReviews = mockCatalogNfts.find((n) => n.id === 'nft-48');
      expect(nftWithZeroReviews).toBeDefined();
      expect(nftWithZeroReviews?.rating.count).toBe(0);
      expect(nftWithZeroReviews?.rating.average).toBe(0);
    });
  });

  describe('Reviews', () => {
    it('validates all reviews against ReviewSchema with integer ratings in [1, 5]', () => {
      expect(mockReviews.length).toBeGreaterThan(0);

      for (const review of mockReviews) {
        expect(() => ReviewSchema.parse(review)).not.toThrow();
        expect(Number.isInteger(review.rating)).toBe(true);
        expect(review.rating).toBeGreaterThanOrEqual(1);
        expect(review.rating).toBeLessThanOrEqual(5);
      }
    });

    it('contains at least 25 paginated reviews for nft-01 and 0 for nft-48', () => {
      const reviewsForNft01 = mockReviews.filter((r) => r.nftId === 'nft-01');
      expect(reviewsForNft01.length).toBeGreaterThanOrEqual(25);

      const reviewsForNft48 = mockReviews.filter((r) => r.nftId === 'nft-48');
      expect(reviewsForNft48.length).toBe(0);
    });
  });

  describe('Users & Profiles', () => {
    it('contains 2 distinct users matching UserSchema and storing only hashes/salts', () => {
      expect(mockUsers.length).toBe(2);

      const userIds = mockUsers.map((u) => u.id);
      expect(userIds).toContain('user_alice');
      expect(userIds).toContain('user_bob');

      for (const user of mockUsers) {
        expect(() => UserSchema.parse(user)).not.toThrow();
        expect(user.passwordHash).toMatch(/^[0-9a-f]{64}$/);
        expect(user.passwordSalt).toMatch(/^[0-9a-f]{32}$/);
        expect((user as unknown as Record<string, unknown>).password).toBeUndefined();
      }
    });
  });

  describe('Wallets', () => {
    it('validates all wallets against WalletSchema with valid hexadecimal addresses', () => {
      expect(mockWallets.length).toBeGreaterThanOrEqual(4);

      for (const wallet of mockWallets) {
        expect(() => WalletSchema.parse(wallet)).not.toThrow();
        expect(wallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      }

      const aliceWallets = mockWallets.filter((w) => w.userId === 'user_alice');
      expect(aliceWallets.some((w) => w.isPrimary)).toBe(true);
      expect(aliceWallets.some((w) => !w.isPrimary)).toBe(true);

      const bobWallets = mockWallets.filter((w) => w.userId === 'user_bob');
      expect(bobWallets.some((w) => w.isPrimary)).toBe(true);
      expect(bobWallets.some((w) => !w.isPrimary)).toBe(true);
    });
  });

  describe('Coupons', () => {
    it('contains valid percent, valid fixed, expired and invalid coupon fixtures', () => {
      const percentCoupon = mockCoupons.find((c) => c.code === 'JUNGLE10');
      expect(percentCoupon?.isValid).toBe(true);
      expect(percentCoupon?.type).toBe('percentage');
      expect(percentCoupon?.discountPercent).toBe(10);

      const fixedCoupon = mockCoupons.find((c) => c.code === 'SAVE50');
      expect(fixedCoupon?.isValid).toBe(true);
      expect(fixedCoupon?.type).toBe('fixed');
      expect(fixedCoupon?.discountAmount).toBe('0.05');

      const expiredCoupon = mockCoupons.find((c) => c.code === 'EXPIRED20');
      expect(expiredCoupon?.isValid).toBe(false);

      const inactiveCoupon = mockCoupons.find((c) => c.code === 'INACTIVE');
      expect(inactiveCoupon?.isValid).toBe(false);
    });
  });

  describe('Carts and Favorites', () => {
    it('validates all carts against CartSchema', () => {
      expect(mockCarts.length).toBe(2);
      for (const cart of mockCarts) {
        expect(() => CartSchema.parse(cart)).not.toThrow();
      }
    });

    it('contains favorites for both users', () => {
      const aliceFavs = mockFavorites.filter((f) => f.userId === 'user_alice');
      const bobFavs = mockFavorites.filter((f) => f.userId === 'user_bob');
      expect(aliceFavs.length).toBeGreaterThan(0);
      expect(bobFavs.length).toBeGreaterThan(0);
    });
  });

  describe('Orders Fixtures', () => {
    it('validates all mockOrders strictly against OrderSchema and OrderReceiptSnapshotSchema', async () => {
      const { OrderSchema, OrderReceiptSnapshotSchema } = await import('@nft/shared-contracts');
      const { mockOrders, mockConfirmedReceipt } = await import('./orders');

      expect(mockOrders.length).toBeGreaterThanOrEqual(3);
      for (const order of mockOrders) {
        expect(() => OrderSchema.parse(order)).not.toThrow();
      }

      expect(() => OrderReceiptSnapshotSchema.parse(mockConfirmedReceipt)).not.toThrow();

      const confirmed = mockOrders.find((o) => o.status === 'confirmed');
      const rejected = mockOrders.find((o) => o.status === 'rejected');
      const pending = mockOrders.find((o) => o.status === 'pending');

      expect(confirmed).toBeDefined();
      expect(confirmed?.receipt).not.toBeNull();
      expect(rejected).toBeDefined();
      expect(rejected?.receipt).toBeNull();
      expect(rejected?.rejectionReason).toBeTruthy();
      expect(pending).toBeDefined();
      expect(pending?.receipt).toBeNull();
    });
  });
});
