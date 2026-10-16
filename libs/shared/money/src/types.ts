declare const EthAmountBrand: unique symbol;

/**
 * Opaque branded type representing a validated decimal ETH amount.
 * Never instantiate directly; use `parse()` or contracts validation.
 */
export type EthAmount = string & { readonly [EthAmountBrand]: typeof EthAmountBrand };

/**
 * Error thrown when an invalid ETH amount is parsed or evaluated.
 */
export class InvalidEthAmountError extends Error {
  readonly value: unknown;

  constructor(message: string, value?: unknown) {
    super(message);
    this.name = 'InvalidEthAmountError';
    this.value = value;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
