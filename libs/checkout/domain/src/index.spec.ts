import { describe, expect, it } from 'vitest';
import type { Profile, Quote, Wallet } from '@nft/shared-contracts';
import {
  hasQuoteChanged,
  mapProfileAndWalletToCollector,
  parseWalletNetwork,
} from './index';

describe('checkout-domain', () => {
  describe('parseWalletNetwork', () => {
    it('parses valid networks', () => {
      expect(parseWalletNetwork('ethereum-mainnet')).toBe('ethereum-mainnet');
      expect(parseWalletNetwork('polygon')).toBe('polygon');
      expect(parseWalletNetwork('invalid-network')).toBeUndefined();
    });
  });

  describe('mapProfileAndWalletToCollector', () => {
    it('maps profile and primary wallet to collector with sanitized ensName', () => {
      const profile: Profile = {
        id: 'usr_1',
        email: 'collector@example.com',
        username: 'collector_1',
        displayName: 'John Collector',
        createdAt: '2026-01-01T00:00:00.000Z',
        ensName: 'john.eth',
        walletNickname: 'Vault',
      };

      const wallet: Wallet = {
        id: 'wal_1',
        userId: 'usr_1',
        address: '0x1111111111111111111111111111111111111111',
        network: 'ethereum-mainnet',
        walletType: 'metamask',
        isPrimary: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      const result = mapProfileAndWalletToCollector({
        profile,
        primaryWallet: wallet,
      });

      expect(result).toEqual({
        fullName: 'John Collector',
        email: 'collector@example.com',
        walletAddress: '0x1111111111111111111111111111111111111111',
        walletType: 'metamask',
        network: 'ethereum-mainnet',
        ensName: 'john', // stripped .eth
        useSecondaryWallet: false,
        secondaryWallet: null,
        note: '',
      });
    });

    it('falls back to default values when profile and wallet are empty', () => {
      const result = mapProfileAndWalletToCollector({});
      expect(result.fullName).toBe('');
      expect(result.email).toBe('');
      expect(result.walletAddress).toBe('');
      expect(result.walletType).toBe('metamask');
      expect(result.network).toBe('ethereum-mainnet');
      expect(result.ensName).toBeUndefined();
    });
  });

  describe('hasQuoteChanged', () => {
    const baseQuote: Quote = {
      quoteId: 'quote_1',
      subtotal: '2.5000',
      discount: '0.0000',
      networkFee: '0.0050',
      total: '2.5050',
      coupon: null,
      itemsAvailability: [
        {
          nftId: 'nft_1',
          editionId: 'ed_1',
          requestedQuantity: 1,
          availableQuantity: 5,
          isAvailable: true,
          currentPrice: '2.5000',
          priceChanged: false,
        },
      ],
      isExpired: false,
      expiresAt: '2026-10-16T18:00:00.000Z',
    };

    it('returns false when quotes are identical', () => {
      const cloned = JSON.parse(JSON.stringify(baseQuote));
      expect(hasQuoteChanged(baseQuote, cloned)).toBe(false);
    });

    it('returns true when quoteId changes', () => {
      const changed = { ...baseQuote, quoteId: 'quote_2' };
      expect(hasQuoteChanged(baseQuote, changed)).toBe(true);
    });

    it('returns true when total changes', () => {
      const changed: Quote = { ...baseQuote, total: '2.6000' };
      expect(hasQuoteChanged(baseQuote, changed)).toBe(true);
    });

    it('returns true when priceChanged flag is set in items', () => {
      const changed: Quote = {
        ...baseQuote,
        itemsAvailability: [
          {
            ...baseQuote.itemsAvailability[0]!,
            priceChanged: true,
          },
        ],
      };
      expect(hasQuoteChanged(baseQuote, changed)).toBe(true);
    });

    it('returns false if either quote is null or undefined', () => {
      expect(hasQuoteChanged(null, baseQuote)).toBe(false);
      expect(hasQuoteChanged(baseQuote, undefined)).toBe(false);
    });
  });
});
