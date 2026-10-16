import { describe, it, expect } from 'vitest';
import * as PublicMoneyExports from './index';
import { EthAmount, InvalidEthAmountError } from './types';
import { EthDecimal } from './decimal';

describe('Task 1.1: EthAmount, InvalidEthAmountError and Decimal encapsulation', () => {
  it('instantiates InvalidEthAmountError as an Error with proper name and message', () => {
    const error = new InvalidEthAmountError('Invalid ETH string: "abc"', 'abc');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(InvalidEthAmountError);
    expect(error.name).toBe('InvalidEthAmountError');
    expect(error.message).toBe('Invalid ETH string: "abc"');
    expect(error.value).toBe('abc');
  });

  it('configures internal EthDecimal with precision 36 and ROUND_HALF_UP', () => {
    expect(EthDecimal.precision).toBe(36);
    expect(EthDecimal.rounding).toBe(EthDecimal.ROUND_HALF_UP);

    // Verify 36 decimal places precision without binary drift or truncation
    const a = new EthDecimal('0.123456789012345678901234567890123456');
    const b = new EthDecimal('0.000000000000000000000000000000000001');
    const result = a.plus(b);
    expect(result.toString()).toBe('0.123456789012345678901234567890123457');
  });

  it('guarantees decimal.js is not leaked in public exports of @nft/shared-money', () => {
    const exportedKeys = Object.keys(PublicMoneyExports);

    expect(exportedKeys).not.toContain('Decimal');
    expect(exportedKeys).not.toContain('EthDecimal');
    expect(exportedKeys).not.toContain('default');

    for (const key of exportedKeys) {
      const val = (PublicMoneyExports as Record<string, unknown>)[key];
      // None of the exported values should be a Decimal constructor or instance
      if (typeof val === 'function') {
        expect(val.name).not.toBe('Decimal');
        expect(val.name).not.toBe('EthDecimal');
      }
    }
  });

  it('supports EthAmount branded type usage', () => {
    const amount = '1.25' as EthAmount;
    expect(typeof amount).toBe('string');
  });
});
