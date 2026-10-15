import { describe, it, expect, beforeEach } from 'vitest';
import {
  singletonProbe,
  SINGLETON_PROBE_KEY,
} from './singleton-probe';

describe('singletonProbe (@nft/shell-kit)', () => {
  beforeEach(() => {
    singletonProbe.reset();
  });

  it('starts with a count of 0 after reset', () => {
    expect(singletonProbe.getCount()).toBe(0);
    expect(singletonProbe.getEvents()).toEqual([]);
  });

  it('increments the count sequentially and records callers', () => {
    const first = singletonProbe.increment('apps/shell');
    expect(first).toBe(1);
    expect(singletonProbe.getCount()).toBe(1);

    const second = singletonProbe.increment('apps/storefront');
    expect(second).toBe(2);
    expect(singletonProbe.getCount()).toBe(2);

    const events = singletonProbe.getEvents();
    expect(events).toHaveLength(2);
    expect(events[0]).toEqual({ caller: 'apps/shell', count: 1 });
    expect(events[1]).toEqual({ caller: 'apps/storefront', count: 2 });
  });

  it('uses "anonymous" as default caller name', () => {
    singletonProbe.increment();
    expect(singletonProbe.getEvents()[0]?.caller).toBe('anonymous');
  });

  it('is bound to the expected Symbol key on globalThis', () => {
    expect(singletonProbe.id).toBe(Symbol.for('nft.singleton.probe'));
    const globalRef = globalThis as typeof globalThis & Record<symbol, unknown>;
    expect(globalRef[SINGLETON_PROBE_KEY]).toBe(singletonProbe);
  });
});
