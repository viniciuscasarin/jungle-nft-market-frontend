import { describe, it, expect } from 'vitest';
import { handlers, authHandlers, catalogHandlers, cartHandlers, checkoutHandlers } from './index';

describe('mocks-handlers public exports', () => {
  it('exports MSW handlers arrays', () => {
    expect(Array.isArray(handlers)).toBe(true);
    expect(handlers.length).toBeGreaterThan(0);
    expect(authHandlers.length).toBeGreaterThan(0);
    expect(catalogHandlers.length).toBeGreaterThan(0);
    expect(cartHandlers.length).toBeGreaterThan(0);
    expect(checkoutHandlers.length).toBeGreaterThan(0);
  });
});
