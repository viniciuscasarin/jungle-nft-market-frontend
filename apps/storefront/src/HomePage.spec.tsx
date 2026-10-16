import { describe, it, expect } from 'vitest';
import HomePage from './HomePage';
import { CatalogHomePage } from '@nft/catalog-feature';

describe('apps/storefront HomePage export', () => {
  it('exposes CatalogHomePage component', () => {
    expect(HomePage).toBe(CatalogHomePage);
  });
});
