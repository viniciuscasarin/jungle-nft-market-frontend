import { describe, it, expect } from 'vitest';
import {
  parseEth,
  formatEth,
  addEth,
  subEth,
  mulEth,
  cmpEth,
  isPositiveEth,
  isZeroEth,
  ZERO_ETH,
} from './index';

describe('Shared Money Library (@nft/shared-money)', () => {
  it('correctly parses valid decimal ETH strings', () => {
    const d = parseEth('1.2500');
    expect(d.toString()).toBe('1.25');
  });

  it('throws an error for non-string or empty inputs', () => {
    expect(() => parseEth('')).toThrow();
    // @ts-expect-error testing invalid input at runtime boundary
    expect(() => parseEth(null)).toThrow();
  });

  it('performs exact decimal addition without binary float precision errors', () => {
    // In IEEE 754 float: 0.1 + 0.2 = 0.30000000000000004
    const result = addEth('0.1', '0.2');
    expect(result).toBe('0.3');
  });

  it('performs exact decimal subtraction', () => {
    const result = subEth('1.0000', '0.0001');
    expect(result).toBe('0.9999');
  });

  it('performs multiplication with integer quantity and decimal ETH', () => {
    const result = mulEth('0.05', 3);
    expect(result).toBe('0.15');
  });

  it('formats ETH to specified decimal places', () => {
    expect(formatEth('2.5', 4)).toBe('2.5000');
    expect(formatEth('2.55555', 2)).toBe('2.56');
  });

  it('compares ETH values accurately', () => {
    expect(cmpEth('1.5', '1.2')).toBe(1);
    expect(cmpEth('1.2', '1.5')).toBe(-1);
    expect(cmpEth('1.5000', '1.5')).toBe(0);
  });

  it('detects positive and zero values', () => {
    expect(isPositiveEth('0.001')).toBe(true);
    expect(isPositiveEth('0.0000')).toBe(false);
    expect(isZeroEth(ZERO_ETH)).toBe(true);
  });
});
