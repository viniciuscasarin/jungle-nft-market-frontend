import { describe, it, expect } from 'vitest';
import App, { App as NamedApp } from './App';
import { HomePage } from './HomePage';

describe('Storefront Standalone Remote (apps/storefront)', () => {
  it('exposes HomePage component as App', () => {
    expect(App).toBe(HomePage);
    expect(NamedApp).toBe(HomePage);
  });
});
