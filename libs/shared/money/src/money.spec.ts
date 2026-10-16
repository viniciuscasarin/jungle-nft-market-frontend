import { describe, it, expect } from 'vitest';
import {
  parse,
  add,
  sub,
  mul,
  percent,
  sum,
  compare,
  isZero,
  format,
  toApi,
  ZERO_ETH,
  InvalidEthAmountError,
} from './index';

describe('Monetary Precision and Operations (@nft/shared-money)', () => {
  describe('parse() & validation', () => {
    it('parses valid decimal string into EthAmount', () => {
      const amount = parse('1.2500');
      expect(amount).toBe('1.2500');
    });

    it('parses zero and small decimal amounts', () => {
      expect(parse('0')).toBe('0');
      expect(parse('0.0000')).toBe('0.0000');
      expect(parse('0.000000000000000001')).toBe('0.000000000000000001');
    });

    it('rejects number input and IEEE-754 floats', () => {
      // @ts-expect-error testing runtime validation with numbers
      expect(() => parse(0.1)).toThrow(InvalidEthAmountError);
      // @ts-expect-error testing runtime validation with numbers
      expect(() => parse(15)).toThrow(InvalidEthAmountError);
    });

    it('rejects scientific notation', () => {
      expect(() => parse('1e-18')).toThrow(InvalidEthAmountError);
      expect(() => parse('2.5E4')).toThrow(InvalidEthAmountError);
      expect(() => parse('1E-8')).toThrow(InvalidEthAmountError);
    });

    it('rejects invalid characters, empty strings and malformed text', () => {
      expect(() => parse('')).toThrow(InvalidEthAmountError);
      expect(() => parse('   ')).toThrow(InvalidEthAmountError);
      expect(() => parse('abc')).toThrow(InvalidEthAmountError);
      expect(() => parse('--1.0')).toThrow(InvalidEthAmountError);
      expect(() => parse('1.2.3')).toThrow(InvalidEthAmountError);
      expect(() => parse('.5')).toThrow(InvalidEthAmountError);
      expect(() => parse('1.')).toThrow(InvalidEthAmountError);
      // @ts-expect-error testing runtime validation with null/undefined
      expect(() => parse(null)).toThrow(InvalidEthAmountError);
      // @ts-expect-error testing runtime validation with null/undefined
      expect(() => parse(undefined)).toThrow(InvalidEthAmountError);
    });
  });

  describe('arithmetic operations: add, sub, mul, percent, sum', () => {
    it('performs exact decimal addition without IEEE-754 float drift', () => {
      // In IEEE 754 float: 0.1 + 0.2 = 0.30000000000000004
      const result = add(parse('0.1'), parse('0.2'));
      expect(result).toBe('0.3');
    });

    it('handles 18 decimal places precision in addition', () => {
      const a = parse('0.000000000000000001');
      const b = parse('0.000000000000000002');
      const result = add(a, b);
      expect(result).toBe('0.000000000000000003');
    });

    it('performs exact decimal subtraction', () => {
      const result = sub(parse('1.0000'), parse('0.0001'));
      expect(result).toBe('0.9999');
    });

    it('performs multiplication with integer quantities', () => {
      const result = mul(parse('0.05'), 3);
      expect(result).toBe('0.15');
    });

    it('rejects non-integer multiplication quantities', () => {
      expect(() => mul(parse('0.05'), 3.5)).toThrow(InvalidEthAmountError);
      // @ts-expect-error testing runtime validation
      expect(() => mul(parse('0.05'), '3')).toThrow(InvalidEthAmountError);
    });

    it('calculates percentages correctly preserving format', () => {
      const discount = percent(parse('200.00'), 10);
      expect(discount).toBe('20.00');

      const half = percent(parse('50.0'), 50);
      expect(half).toBe('25.0');
    });

    it('sums across arrays of EthAmounts', () => {
      const total = sum([parse('1.1'), parse('2.2'), parse('3.3')]);
      expect(total).toBe('6.6');
    });

    it('returns 0 when summing empty array', () => {
      expect(sum([])).toBe('0');
    });
  });

  describe('comparison and zero check', () => {
    it('compares distinct values', () => {
      expect(compare(parse('1.5'), parse('1.2'))).toBe(1);
      expect(compare(parse('1.2'), parse('1.5'))).toBe(-1);
    });

    it('compares equal values with different decimal representation', () => {
      expect(compare(parse('1.5000'), parse('1.5'))).toBe(0);
      expect(compare(parse('0.00'), parse('0'))).toBe(0);
    });

    it('evaluates zero check correctly', () => {
      expect(isZero(parse('0.0000'))).toBe(true);
      expect(isZero(parse('0'))).toBe(true);
      expect(isZero(parse(ZERO_ETH))).toBe(true);
      expect(isZero(parse('0.0001'))).toBe(false);
    });
  });

  describe('format() & toApi()', () => {
    it('formats with custom decimal places with comma as decimal separator (pt-BR)', () => {
      expect(format(parse('2.55555'), { decimals: 2 })).toBe('2,56');
      expect(format(parse('2.5'), { decimals: 4 })).toBe('2,5000');
    });

    it('formats large numbers with thousands separator (pt-BR dot)', () => {
      expect(format(parse('1250.50'), { decimals: 2 })).toBe('1.250,50');
      expect(format(parse('1000000.0000'), { decimals: 4 })).toBe('1.000.000,0000');
    });

    it('formats negative numbers correctly', () => {
      expect(format(parse('-1250.50'), { decimals: 2 })).toBe('-1.250,50');
    });

    it('serializes cleanly to API format', () => {
      const raw = '1.250000000000000000';
      const parsed = parse(raw);
      expect(toApi(parsed)).toBe(raw);
    });
  });
});
