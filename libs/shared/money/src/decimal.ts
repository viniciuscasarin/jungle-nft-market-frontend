import Decimal from 'decimal.js';

/**
 * Internal Decimal configuration for cryptocurrency arithmetic.
 * Precision: 36, Rounding: ROUND_HALF_UP.
 * This configuration and Decimal instance MUST NOT be exported outside libs/shared/money.
 */
export const EthDecimal = Decimal.clone({
  precision: 36,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -36,
  toExpPos: 36,
});

export type EthDecimalInstance = InstanceType<typeof EthDecimal>;
