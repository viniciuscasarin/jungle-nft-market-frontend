import { describe, it, expect } from 'vitest';
import { socketInterceptor, createMockSocketHandler } from './index';

describe('mocks-socket public exports', () => {
  it('exports socketInterceptor and helper functions', () => {
    expect(socketInterceptor).toBeDefined();
    expect(typeof createMockSocketHandler).toBe('function');
  });
});
