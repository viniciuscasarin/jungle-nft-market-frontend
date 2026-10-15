import Decimal from 'decimal.js';

export const ZERO_ETH = '0.0000';

/**
 * Configure Decimal precision for cryptocurrency handling
 */
const EthDecimal = Decimal.clone({
  precision: 36,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -18,
  toExpPos: 36,
});

/**
 * Parses an ETH string into an EthDecimal instance.
 * Throws if the input is not a valid decimal string.
 */
export function parseEth(value: string): Decimal {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Invalid ETH string: expected non-empty string, received '${value}'`);
  }
  return new EthDecimal(value.trim());
}

/**
 * Formats an ETH value (string or Decimal) with fixed or standard decimal places.
 */
export function formatEth(value: string | Decimal, decimals = 4): string {
  const d = typeof value === 'string' ? parseEth(value) : value;
  return d.toFixed(decimals);
}

/**
 * Adds two decimal ETH strings: a + b
 */
export function addEth(a: string, b: string): string {
  return parseEth(a).plus(parseEth(b)).toString();
}

/**
 * Subtracts two decimal ETH strings: a - b
 */
export function subEth(a: string, b: string): string {
  return parseEth(a).minus(parseEth(b)).toString();
}

/**
 * Multiplies an ETH string by an integer or decimal multiplier: eth * multiplier
 */
export function mulEth(eth: string, multiplier: string | number): string {
  return parseEth(eth).times(new EthDecimal(multiplier)).toString();
}

/**
 * Compares two ETH strings:
 * returns 1 if a > b, -1 if a < b, 0 if a == b
 */
export function cmpEth(a: string, b: string): number {
  return parseEth(a).comparedTo(parseEth(b));
}

/**
 * Checks whether the ETH string is strictly greater than zero.
 */
export function isPositiveEth(value: string): boolean {
  return parseEth(value).isPositive() && !parseEth(value).isZero();
}

/**
 * Checks whether the ETH string represents zero.
 */
export function isZeroEth(value: string): boolean {
  return parseEth(value).isZero();
}
