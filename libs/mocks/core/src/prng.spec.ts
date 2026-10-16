import { describe, it, expect } from 'vitest';
import { createMulberry32, DEFAULT_PRNG_SEED } from './prng';

describe('Mulberry32 PRNG engine', () => {
  it('generates exact identical sequence for the same seed', () => {
    const prng1 = createMulberry32(12345);
    const prng2 = createMulberry32(12345);

    const seq1 = Array.from({ length: 10 }, () => prng1.next());
    const seq2 = Array.from({ length: 10 }, () => prng2.next());

    expect(seq1).toEqual(seq2);
    expect(prng1.uuid()).toBe(prng2.uuid());
    expect(prng1.token(16)).toBe(prng2.token(16));
    expect(prng1.txHash()).toBe(prng2.txHash());
    expect(prng1.address()).toBe(prng2.address());
  });

  it('generates different sequences for different seeds', () => {
    const prng1 = createMulberry32(100);
    const prng2 = createMulberry32(200);

    expect(prng1.next()).not.toBe(prng2.next());
  });

  it('generates numbers within bounds with int(min, max)', () => {
    const prng = createMulberry32(42);
    for (let i = 0; i < 100; i++) {
      const val = prng.int(5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(10);
      expect(Number.isInteger(val)).toBe(true);
    }
  });

  it('picks elements from array deterministically and throws on empty array', () => {
    const prng = createMulberry32(99);
    const items = ['apple', 'banana', 'cherry'] as const;
    const picked = prng.pick(items);
    expect(items).toContain(picked);

    expect(() => prng.pick([])).toThrow('Cannot pick an element from an empty array');
  });

  it('generates valid UUID v4 format', () => {
    const prng = createMulberry32(DEFAULT_PRNG_SEED);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    for (let i = 0; i < 20; i++) {
      const id = prng.uuid();
      expect(id).toMatch(uuidRegex);
    }
  });

  it('generates valid txHash and address formats', () => {
    const prng = createMulberry32(DEFAULT_PRNG_SEED);
    expect(prng.txHash()).toMatch(/^0x[0-9a-f]{64}$/);
    expect(prng.address()).toMatch(/^0x[0-9a-f]{40}$/);
  });

  it('reseeds properly to restart sequence', () => {
    const prng = createMulberry32(777);
    const firstNum = prng.next();
    prng.reseed(777);
    expect(prng.next()).toBe(firstNum);
  });
});
