import { EthDecimal } from './decimal';
import { EthAmount, InvalidEthAmountError } from './types';

const DECIMAL_REGEX = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;

export const ZERO_ETH = '0.0000' as EthAmount;

/**
 * Parses and strictly validates a decimal string into an opaque EthAmount.
 * Throws InvalidEthAmountError on non-string inputs, empty strings, IEEE-754 floats,
 * scientific notation, or malformed characters.
 */
export function parse(value: unknown): EthAmount {
  if (typeof value !== 'string') {
    throw new InvalidEthAmountError(
      `Invalid ETH amount: expected string, received ${typeof value}`,
      value
    );
  }

  if (value.trim() === '' || !DECIMAL_REGEX.test(value)) {
    throw new InvalidEthAmountError(
      `Invalid ETH amount: '${value}' is not a valid decimal string`,
      value
    );
  }

  try {
    new EthDecimal(value);
  } catch {
    throw new InvalidEthAmountError(
      `Invalid ETH amount: '${value}' could not be evaluated by Decimal`,
      value
    );
  }

  return value as EthAmount;
}

/**
 * Pure addition: a + b
 */
export function add(a: EthAmount, b: EthAmount): EthAmount {
  const result = new EthDecimal(a).plus(new EthDecimal(b));
  return result.toString() as EthAmount;
}

/**
 * Pure subtraction: a - b
 */
export function sub(a: EthAmount, b: EthAmount): EthAmount {
  const result = new EthDecimal(a).minus(new EthDecimal(b));
  return result.toString() as EthAmount;
}

/**
 * Pure multiplication: amount * integerQuantity
 * Rejects non-integer quantities.
 */
export function mul(amount: EthAmount, quantity: number): EthAmount {
  if (typeof quantity !== 'number' || !Number.isInteger(quantity)) {
    throw new InvalidEthAmountError(
      `Multiplication quantity must be an integer, received '${quantity}'`,
      quantity
    );
  }
  const result = new EthDecimal(amount).times(quantity);
  return result.toString() as EthAmount;
}

/**
 * Pure percentage calculation: amount * (percentage / 100)
 * Preserves decimal representation of input if appropriate.
 */
export function percent(amount: EthAmount, percentage: number): EthAmount {
  if (typeof percentage !== 'number' || !Number.isFinite(percentage)) {
    throw new InvalidEthAmountError(
      `Percentage must be a finite number, received '${percentage}'`,
      percentage
    );
  }
  const d = new EthDecimal(amount).times(percentage).dividedBy(100);
  const dotIndex = (amount as string).indexOf('.');
  const originalDecimals = dotIndex === -1 ? 0 : (amount as string).length - dotIndex - 1;
  const resultStr = d.toString();
  const resultDotIndex = resultStr.indexOf('.');
  const resultDecimals = resultDotIndex === -1 ? 0 : resultStr.length - resultDotIndex - 1;

  if (originalDecimals > resultDecimals) {
    return d.toFixed(originalDecimals) as EthAmount;
  }
  return resultStr as EthAmount;
}

/**
 * Pure sum across an array of EthAmounts.
 */
export function sum(amounts: readonly EthAmount[]): EthAmount {
  if (amounts.length === 0) {
    return '0' as EthAmount;
  }
  const total = amounts.reduce(
    (acc, val) => acc.plus(new EthDecimal(val)),
    new EthDecimal(0)
  );
  return total.toString() as EthAmount;
}

/**
 * Pure comparison:
 * returns 1 if a > b, -1 if a < b, 0 if a == b
 */
export function compare(a: EthAmount, b: EthAmount): number {
  return new EthDecimal(a).comparedTo(new EthDecimal(b));
}

/**
 * Checks whether an EthAmount strictly equals zero.
 */
export function isZero(amount: EthAmount): boolean {
  return new EthDecimal(amount).isZero();
}

/**
 * Formats an EthAmount using Brazilian Portuguese (pt-BR) conventions:
 * dot as thousands separator, comma as decimal separator, configurable decimal places.
 */
export function format(amount: EthAmount, options?: { decimals?: number }): string {
  const d = new EthDecimal(amount);
  const decimals = options?.decimals ?? 4;
  const fixedStr = d.toFixed(decimals, EthDecimal.ROUND_HALF_UP);
  const [integerPart = '0', decimalPart] = fixedStr.split('.');

  const isNegative = integerPart.startsWith('-');
  const rawDigits = isNegative ? integerPart.slice(1) : integerPart;
  const withThousands = rawDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const formattedInteger = isNegative ? `-${withThousands}` : withThousands;

  if (decimals > 0 && decimalPart !== undefined) {
    return `${formattedInteger},${decimalPart}`;
  }
  return formattedInteger;
}

/**
 * Serializes an EthAmount into a canonical string for REST / API transport.
 */
export function toApi(amount: EthAmount): string {
  return amount as string;
}
