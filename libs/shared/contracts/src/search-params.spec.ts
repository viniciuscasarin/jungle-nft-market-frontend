import { describe, it, expect } from 'vitest';
import {
  parseCatalogSearchParams,
  parseCartSearchParams,
  parseCheckoutSearchParams,
} from './index';

describe('Tolerant Search Params Schemas (@nft/shared-contracts)', () => {
  describe('parseCatalogSearchParams', () => {
    it('falls back to deterministic defaults when invalid parameters are supplied', () => {
      const invalidInput = {
        page: 'invalid',
        pageSize: '-10',
        tab: 'invalid',
        sort: 'unknown',
        minPrice: 'not-a-number',
      };

      const result = parseCatalogSearchParams(invalidInput);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(9);
      expect(result.tab).toBe('all');
      expect(result.sort).toBe('popular-desc');
      expect(result.minPrice).toBeUndefined();
    });

    it('returns defaults when input is null, undefined, or empty object', () => {
      expect(parseCatalogSearchParams(null)).toEqual({
        tab: 'all',
        sort: 'popular-desc',
        page: 1,
        pageSize: 9,
      });

      expect(parseCatalogSearchParams(undefined)).toEqual({
        tab: 'all',
        sort: 'popular-desc',
        page: 1,
        pageSize: 9,
      });

      expect(parseCatalogSearchParams({})).toEqual({
        tab: 'all',
        sort: 'popular-desc',
        page: 1,
        pageSize: 9,
      });
    });

    it('accepts and coerces valid parameters including combinable filter arrays', () => {
      const valid = {
        q: 'ape',
        search: 'panther',
        category: 'Art',
        collections: ['col_cyber_jungle', 'col_neon_predators'],
        networks: 'ethereum,polygon',
        minPrice: '0.5000',
        maxPrice: '10.0000',
        tab: 'new',
        sort: 'price-asc',
        page: '3',
        pageSize: '24',
      };

      const result = parseCatalogSearchParams(valid);
      expect(result.q).toBe('ape');
      expect(result.search).toBe('panther');
      expect(result.category).toBe('Art');
      expect(result.collections).toEqual(['col_cyber_jungle', 'col_neon_predators']);
      expect(result.networks).toEqual(['ethereum', 'polygon']);
      expect(result.minPrice).toBe('0.5000');
      expect(result.maxPrice).toBe('10.0000');
      expect(result.tab).toBe('new');
      expect(result.sort).toBe('price-asc');
      expect(result.page).toBe(3);
      expect(result.pageSize).toBe(24);
    });
  });

  describe('parseCartSearchParams', () => {
    it('handles valid and invalid cart parameters with fallback', () => {
      expect(parseCartSearchParams({ coupon: 'DISCOUNT10', highlight: 'ed-1' })).toEqual({
        coupon: 'DISCOUNT10',
        highlight: 'ed-1',
      });

      expect(parseCartSearchParams(null)).toEqual({});
    });
  });

  describe('parseCheckoutSearchParams', () => {
    it('falls back to review step on invalid step parameter', () => {
      const result = parseCheckoutSearchParams({ step: 'invalid_step' });
      expect(result.step).toBe('review');
    });

    it('accepts valid step parameters', () => {
      expect(parseCheckoutSearchParams({ step: 'payment' }).step).toBe('payment');
      expect(parseCheckoutSearchParams({ step: 'confirm' }).step).toBe('confirm');
    });

    it('parses quoteId and orderId when provided', () => {
      const result = parseCheckoutSearchParams({
        step: 'payment',
        quoteId: 'quote-123',
        orderId: 'ord-456',
      });
      expect(result.quoteId).toBe('quote-123');
      expect(result.orderId).toBe('ord-456');
    });
  });
});
