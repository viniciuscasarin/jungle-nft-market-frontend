import { describe, it, expect } from 'vitest';
import PdpPage, { PdpPage as NamedPdpPage } from './PdpPage';
import { PdpFeaturePage } from '@nft/catalog-feature';

describe('apps/storefront PdpPage export', () => {
  it('exposes the connected PdpFeaturePage component', () => {
    expect(PdpPage).toBe(PdpFeaturePage);
    expect(NamedPdpPage).toBe(PdpFeaturePage);
  });
});
