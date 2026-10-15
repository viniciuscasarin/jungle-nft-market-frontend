import { describe, it, expect } from 'vitest';
import { mockUsers, mockNfts, mockWallets } from './index';

describe('mocks-fixtures public exports', () => {
  it('exports mockUsers, mockNfts and mockWallets arrays', () => {
    expect(mockUsers.length).toBeGreaterThan(0);
    expect(mockNfts.length).toBeGreaterThan(0);
    expect(mockWallets.length).toBeGreaterThan(0);
  });
});
