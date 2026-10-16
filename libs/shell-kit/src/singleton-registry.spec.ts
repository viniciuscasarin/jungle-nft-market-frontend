import { describe, it, expect, beforeEach } from 'vitest';
import {
  singletonRegistry,
  SINGLETON_REGISTRY_KEY,
} from './singleton-registry';

describe('singletonRegistry (@nft/shell-kit)', () => {
  beforeEach(() => {
    singletonRegistry.reset();
  });

  it('attaches to globalThis using SINGLETON_REGISTRY_KEY', () => {
    const globalObj = globalThis as typeof globalThis & Record<symbol, unknown>;
    expect(globalObj[SINGLETON_REGISTRY_KEY]).toBe(singletonRegistry);
  });

  it('registers and retrieves a singleton instance', () => {
    const client = { id: 'client-1' };
    singletonRegistry.assertSingleton('queryClient', client);

    expect(singletonRegistry.has('queryClient')).toBe(true);
    expect(singletonRegistry.get('queryClient')).toBe(client);
  });

  it('allows registering the exact same instance repeatedly', () => {
    const client = { id: 'client-1' };
    expect(() => {
      singletonRegistry.assertSingleton('httpClient', client);
      singletonRegistry.assertSingleton('httpClient', client);
      singletonRegistry.register('httpClient', client);
    }).not.toThrow();

    expect(singletonRegistry.get('httpClient')).toBe(client);
  });

  it('throws an error when a duplicate different instance is registered', () => {
    const instanceA = { name: 'QueryClientA' };
    const instanceB = { name: 'QueryClientB' };

    singletonRegistry.assertSingleton('queryClient', instanceA);

    expect(() => {
      singletonRegistry.assertSingleton('queryClient', instanceB);
    }).toThrow(
      'Duplicate singleton detected for "queryClient". Exactly one instance is allowed in the runtime.',
    );
  });

  it('verifies registered keys correctly and resets cleanly', () => {
    singletonRegistry.register('realtimeClient', { socket: true });
    singletonRegistry.register('serviceWorker', { sw: true });

    const verification = singletonRegistry.verify();
    expect(verification.valid).toBe(true);
    expect(verification.keys).toContain('realtimeClient');
    expect(verification.keys).toContain('serviceWorker');

    singletonRegistry.reset();
    expect(singletonRegistry.has('realtimeClient')).toBe(false);
    expect(singletonRegistry.getAll().size).toBe(0);
  });

  it('validates that only one global live region exists in the runtime', () => {
    const liveRegion1 = { id: 'live-region-1' };
    const liveRegion2 = { id: 'live-region-2' };

    singletonRegistry.assertSingleton('liveRegion', liveRegion1);
    expect(singletonRegistry.get('liveRegion')).toBe(liveRegion1);

    expect(() => {
      singletonRegistry.assertSingleton('liveRegion', liveRegion2);
    }).toThrow(
      'Duplicate singleton detected for "liveRegion". Exactly one instance is allowed in the runtime.'
    );
  });
});
