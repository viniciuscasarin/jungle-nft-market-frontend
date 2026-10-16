import { describe, it, expect } from 'vitest';
import {
  WalletFormSchema,
  isValidWalletAddress,
  isValidEnsName,
  formatWalletAddress,
  walletToFormData,
  formDataToCreateWalletInput,
} from './index';

describe('Wallets Domain (@nft/wallets-domain)', () => {
  describe('WalletFormSchema', () => {
    it('accepts valid wallet form data', () => {
      const valid = {
        displayName: 'Minha MetaMask',
        label: 'MetaMask Hot Wallet',
        network: 'ethereum-mainnet' as const,
        address: '0x1234567890123456789012345678901234567890',
        walletType: 'metamask' as const,
        ensName: 'vinicius',
        ensDomain: '.eth' as const,
        email: 'vinicius@example.com',
        referralCode: 'REF123',
        isPrimary: true,
      };
      const parsed = WalletFormSchema.parse(valid);
      expect(parsed.address).toBe('0x1234567890123456789012345678901234567890');
      expect(parsed.walletType).toBe('metamask');
    });

    it('rejects invalid Ethereum address format', () => {
      expect(() =>
        WalletFormSchema.parse({
          displayName: 'Wallet',
          label: 'Primary',
          address: 'invalid-address',
        })
      ).toThrow(/Endereço deve ser hexadecimal/);

      expect(() =>
        WalletFormSchema.parse({
          displayName: 'Wallet',
          label: 'Primary',
          address: '0x123',
        })
      ).toThrow(/Endereço deve ser hexadecimal/);
    });

    it('rejects ENS names containing .eth suffix', () => {
      expect(() =>
        WalletFormSchema.parse({
          displayName: 'Wallet',
          label: 'Primary',
          address: '0x1234567890123456789012345678901234567890',
          ensName: 'vitalik.eth',
        })
      ).toThrow(/Nome ENS não deve conter o sufixo \.eth/);
    });
  });

  describe('Validation & Formatting Helpers', () => {
    it('isValidWalletAddress identifies 0x+40 hex addresses correctly', () => {
      expect(isValidWalletAddress('0x1111111111111111111111111111111111111111')).toBe(true);
      expect(isValidWalletAddress('0xabcdefABCDEF0123456789abcdefABCDEF012345')).toBe(true);
      expect(isValidWalletAddress('0x123')).toBe(false);
      expect(isValidWalletAddress('not-hex')).toBe(false);
      expect(isValidWalletAddress('1111111111111111111111111111111111111111')).toBe(false);
    });

    it('isValidEnsName rejects .eth or .xyz suffixes', () => {
      expect(isValidEnsName('vitalik')).toBe(true);
      expect(isValidEnsName('vitalik.eth')).toBe(false);
      expect(isValidEnsName('vitalik.xyz')).toBe(false);
    });

    it('formatWalletAddress formats long address to 0x123...4567', () => {
      expect(formatWalletAddress('0x71C82729B8F89382910283019827391823948394')).toBe('0x71C...8394');
      expect(formatWalletAddress('short')).toBe('short');
    });
  });

  describe('Conversion utilities', () => {
    it('converts wallet to form data and form data to create input', () => {
      const formData = walletToFormData({
        id: 'wal-1',
        address: '0x1111111111111111111111111111111111111111',
        network: 'polygon',
        walletType: 'coinbase',
        isPrimary: true,
      });

      expect(formData.network).toBe('polygon');
      expect(formData.walletType).toBe('coinbase');

      const createInput = formDataToCreateWalletInput(formData, true);
      expect(createInput.address).toBe('0x1111111111111111111111111111111111111111');
      expect(createInput.isPrimary).toBe(true);
    });
  });
});
