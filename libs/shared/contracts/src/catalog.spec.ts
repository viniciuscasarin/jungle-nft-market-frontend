import { describe, it, expect } from 'vitest';
import {
  ReviewSchema,
  NftItemSchema,
  NftEditionSchema,
  NftRatingSchema,
  NftListQuerySchema,
} from './index';

describe('Catalog, NFTs and Reviews Contracts (@nft/shared-contracts)', () => {
  describe('ReviewSchema', () => {
    it('accepts valid review with integer rating between 1 and 5', () => {
      const validReview = {
        id: 'rev-1',
        author: 'Alice',
        rating: 5,
        comment: 'Great piece',
        createdAt: '2026-02-01T12:00:00Z',
      };
      const parsed = ReviewSchema.parse(validReview);
      expect(parsed.rating).toBe(5);
      expect(parsed.comment).toBe('Great piece');
    });

    it('accepts author as structured object', () => {
      const validReview = {
        id: 'rev-2',
        author: {
          id: 'usr-1',
          name: 'Bob',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
        rating: 4,
        comment: 'Very impressive artwork',
        createdAt: '2026-02-01T12:00:00Z',
      };
      const parsed = ReviewSchema.parse(validReview);
      expect(typeof parsed.author).toBe('object');
    });

    it('rejects review with rating 0', () => {
      const invalid = {
        id: 'rev-0',
        author: 'Alice',
        rating: 0,
        comment: 'Bad',
        createdAt: '2026-02-01T12:00:00Z',
      };
      expect(() => ReviewSchema.parse(invalid)).toThrow(/Nota deve ser no mínimo 1/);
    });

    it('rejects review with rating 6', () => {
      const invalid = {
        id: 'rev-6',
        author: 'Alice',
        rating: 6,
        comment: 'Too good',
        createdAt: '2026-02-01T12:00:00Z',
      };
      expect(() => ReviewSchema.parse(invalid)).toThrow(/Nota deve ser no máximo 5/);
    });

    it('rejects review with fractional rating (e.g. 4.5)', () => {
      const invalid = {
        id: 'rev-4-5',
        author: 'Alice',
        rating: 4.5,
        comment: 'Almost perfect',
        createdAt: '2026-02-01T12:00:00Z',
      };
      expect(() => ReviewSchema.parse(invalid)).toThrow(/Nota deve ser um número inteiro/);
    });
  });

  describe('NftItemSchema & NftEditionSchema', () => {
    it('rejects numeric price in NFT item schema', () => {
      const invalidNft = {
        id: 'nft-1',
        title: 'Cyber Panther',
        imageUrl: 'https://example.com/panther.jpg',
        creator: { id: 'c-1', name: 'CryptoArtist' },
        price: 1.5, // Numeric price must fail!
        rating: { average: 4.5, count: 10 },
      };
      expect(() => NftItemSchema.parse(invalidNft)).toThrow(
        /Valor em ETH deve ser uma string decimal, não number/
      );
    });

    it('rejects numeric price in edition schema', () => {
      const invalidEdition = {
        id: 'ed-1',
        editionNumber: 1,
        maxSupply: 10,
        availableSupply: 5,
        price: 0.5, // Numeric price must fail!
        version: 1,
      };
      expect(() => NftEditionSchema.parse(invalidEdition)).toThrow(
        /Valor em ETH deve ser uma string decimal, não number/
      );
    });

    it('validates legitimate NFT item with editions and monotonic integer version', () => {
      const validNft = {
        id: 'nft-100',
        title: 'Jungle Apex #1',
        description: 'Rare cyber predator',
        imageUrl: 'https://example.com/nft.png',
        creator: {
          id: 'creator-1',
          name: 'Jane Doe',
          verified: true,
        },
        category: 'Art',
        tags: ['cyber', 'jungle', 'rare'],
        price: '2.5000',
        rating: { average: 4.8, count: 120 },
        editions: [
          {
            id: 'ed-1',
            editionNumber: 1,
            name: 'Gold Edition',
            maxSupply: 50,
            availableSupply: 12,
            price: '2.5000',
            version: 1,
          },
          {
            id: 'ed-2',
            editionNumber: 2,
            name: 'Silver Edition',
            maxSupply: 100,
            availableSupply: 80,
            price: '1.2000',
            version: 2,
          },
        ],
        featured: true,
        version: 1,
      };

      const parsed = NftItemSchema.parse(validNft);
      expect(parsed.price).toBe('2.5000');
      expect(parsed.editions).toHaveLength(2);
      expect(Number.isInteger(parsed.version)).toBe(true);
      expect(Number.isInteger(parsed.editions[0]?.version)).toBe(true);
    });
  });

  describe('NftRatingSchema', () => {
    it('validates rating constraints (average 0 to 5, integer count)', () => {
      const parsed = NftRatingSchema.parse({ average: 4.8, count: 120 });
      expect(parsed.average).toBe(4.8);
      expect(parsed.count).toBe(120);
    });

    it('rejects rating average above 5 or negative', () => {
      expect(() => NftRatingSchema.parse({ average: 5.5, count: 10 })).toThrow();
      expect(() => NftRatingSchema.parse({ average: -0.5, count: 10 })).toThrow();
    });

    it('rejects fractional review count', () => {
      expect(() => NftRatingSchema.parse({ average: 4.0, count: 2.5 })).toThrow();
    });
  });

  describe('NftListQuerySchema', () => {
    it('applies defaults for sort, page and pageSize', () => {
      const parsed = NftListQuerySchema.parse({});
      expect(parsed.sort).toBe('popular-desc');
      expect(parsed.page).toBe(1);
      expect(parsed.pageSize).toBe(12);
    });

    it('accepts valid search filters', () => {
      const parsed = NftListQuerySchema.parse({
        search: 'jungle',
        category: 'Collectibles',
        minPrice: '0.5',
        maxPrice: '10.0',
        sort: 'price-asc',
        page: '2',
        pageSize: '24',
      });
      expect(parsed.search).toBe('jungle');
      expect(parsed.minPrice).toBe('0.5');
      expect(parsed.page).toBe(2);
      expect(parsed.pageSize).toBe(24);
    });
  });
});
