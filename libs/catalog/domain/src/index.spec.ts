import { describe, it, expect } from 'vitest';
import {
  validatePriceRangeEth,
  normalizeCatalogSearchParams,
  applyCatalogFilterChange,
} from './index';

describe('Catalog Domain (@nft/catalog-domain)', () => {
  describe('validatePriceRangeEth', () => {
    it('returns undefined bounds when inputs are empty or invalid', () => {
      expect(validatePriceRangeEth()).toEqual({ minPrice: undefined, maxPrice: undefined });
      expect(validatePriceRangeEth(undefined, undefined)).toEqual({
        minPrice: undefined,
        maxPrice: undefined,
      });
      expect(validatePriceRangeEth('invalid', 'abc')).toEqual({
        minPrice: undefined,
        maxPrice: undefined,
      });
    });

    it('preserves valid price bounds with normalized decimal representation', () => {
      const result = validatePriceRangeEth('0.5', '2.5');
      expect(result.minPrice).toBe('0.5');
      expect(result.maxPrice).toBe('2.5');
    });

    it('swaps bounds without floating-point arithmetic when minPrice > maxPrice', () => {
      const result = validatePriceRangeEth('5.0', '1.2');
      expect(result.minPrice).toBe('1.2');
      expect(result.maxPrice).toBe('5.0');
    });
  });

  describe('normalizeCatalogSearchParams', () => {
    it('falls back to safe defaults on invalid raw input', () => {
      const normalized = normalizeCatalogSearchParams({
        page: 'invalid',
        sort: 'invalid-sort',
      });
      expect(normalized.page).toBe(1);
      expect(normalized.pageSize).toBe(9);
      expect(normalized.tab).toBe('all');
      expect(normalized.sort).toBe('popular-desc');
    });

    it('normalizes collections and networks array/string formats', () => {
      const normalized = normalizeCatalogSearchParams({
        collections: 'col_cyber_jungle, col_neon_predators',
        networks: ['ethereum', 'solana'],
        minPrice: '0.1',
      });
      expect(normalized.collections).toEqual(['col_cyber_jungle', 'col_neon_predators']);
      expect(normalized.networks).toEqual(['ethereum', 'solana']);
      expect(normalized.minPrice).toBe('0.1');
    });
  });

  describe('applyCatalogFilterChange', () => {
    const baseParams = normalizeCatalogSearchParams({
      page: 3,
      sort: 'popular-desc',
      tab: 'all',
    });

    it('resets page to 1 whenever any filter, search query, tab, or sort option changes', () => {
      expect(applyCatalogFilterChange(baseParams, { q: 'ape' }).page).toBe(1);
      expect(applyCatalogFilterChange(baseParams, { collections: ['col_cyber_jungle'] }).page).toBe(1);
      expect(applyCatalogFilterChange(baseParams, { networks: ['polygon'] }).page).toBe(1);
      expect(applyCatalogFilterChange(baseParams, { minPrice: '1.0' }).page).toBe(1);
      expect(applyCatalogFilterChange(baseParams, { maxPrice: '5.0' }).page).toBe(1);
      expect(applyCatalogFilterChange(baseParams, { tab: 'trending' }).page).toBe(1);
      expect(applyCatalogFilterChange(baseParams, { sort: 'price-asc' }).page).toBe(1);
    });

    it('preserves the target page when changing only the page parameter', () => {
      const updated = applyCatalogFilterChange(baseParams, { page: 4 });
      expect(updated.page).toBe(4);
      expect(updated.sort).toBe('popular-desc');
      expect(updated.tab).toBe('all');
    });
  });
});
