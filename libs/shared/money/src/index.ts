export type { EthAmount } from './types';
export { InvalidEthAmountError } from './types';

export {
  ZERO_ETH,
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
} from './money';

// Backward compatibility adapters for legacy callers
import { parse, add, sub, mul, compare, isZero, format } from './money';

/** @deprecated Use `parse()` */
export const parseEth = parse;

/** @deprecated Use `add()` */
export const addEth = add;

/** @deprecated Use `sub()` */
export const subEth = sub;

/** @deprecated Use `mul()` */
export const mulEth = mul;

/** @deprecated Use `compare()` */
export const cmpEth = compare;

/** @deprecated Use `isZero()` */
export const isZeroEth = isZero;

/** @deprecated Use `format(amount, { decimals })` */
export function formatEth(value: string, decimals = 4): string {
  return format(parse(value), { decimals });
}

/** @deprecated Use `compare(amount, parse('0')) > 0` */
export function isPositiveEth(value: string): boolean {
  return compare(parse(value), parse('0')) > 0;
}
