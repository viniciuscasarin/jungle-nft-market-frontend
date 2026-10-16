import { describe, it, expect } from 'vitest';
import type { CreateOrderInput } from '@nft/shared-contracts';
import {
  isTerminalOrderStatus,
  canTransitionOrderStatus,
  areOrderPayloadsEqual,
  createIdempotencyKey,
} from './index';

describe('Orders Domain (@nft/orders-domain)', () => {
  describe('terminal status checks and transitions', () => {
    it('identifies confirmed and rejected as terminal', () => {
      expect(isTerminalOrderStatus('confirmed')).toBe(true);
      expect(isTerminalOrderStatus('rejected')).toBe(true);
      expect(isTerminalOrderStatus('pending')).toBe(false);
    });

    it('blocks transitions from confirmed status', () => {
      expect(canTransitionOrderStatus('confirmed', 'pending')).toBe(false);
      expect(canTransitionOrderStatus('confirmed', 'rejected')).toBe(false);
      expect(canTransitionOrderStatus('confirmed', 'confirmed')).toBe(false);
    });

    it('blocks transitions from rejected status', () => {
      expect(canTransitionOrderStatus('rejected', 'pending')).toBe(false);
      expect(canTransitionOrderStatus('rejected', 'confirmed')).toBe(false);
      expect(canTransitionOrderStatus('rejected', 'rejected')).toBe(false);
    });

    it('allows transitions from pending status', () => {
      expect(canTransitionOrderStatus('pending', 'confirmed')).toBe(true);
      expect(canTransitionOrderStatus('pending', 'rejected')).toBe(true);
      expect(canTransitionOrderStatus('pending', 'pending')).toBe(true);
    });
  });

  describe('areOrderPayloadsEqual', () => {
    const basePayload: CreateOrderInput = {
      quoteId: 'quote-123',
      collector: {
        fullName: 'Alice Silva',
        email: 'alice@example.com',
        walletAddress: '0x1111111111111111111111111111111111111111',
        walletType: 'metamask',
        network: 'ethereum-mainnet',
        ensName: 'alice',
        useSecondaryWallet: false,
        secondaryWallet: null,
      },
    };

    it('returns true when payloads match exactly', () => {
      const cloned = JSON.parse(JSON.stringify(basePayload));
      expect(areOrderPayloadsEqual(basePayload, cloned)).toBe(true);
    });

    it('returns true when address casing differs but is identical', () => {
      const copy: CreateOrderInput = {
        ...basePayload,
        collector: {
          ...basePayload.collector,
          walletAddress: '0X1111111111111111111111111111111111111111',
        },
      };
      expect(areOrderPayloadsEqual(basePayload, copy)).toBe(true);
    });

    it('returns false when quoteId differs', () => {
      const copy: CreateOrderInput = {
        ...basePayload,
        quoteId: 'quote-456',
      };
      expect(areOrderPayloadsEqual(basePayload, copy)).toBe(false);
    });

    it('returns false when collector email differs', () => {
      const copy: CreateOrderInput = {
        ...basePayload,
        collector: {
          ...basePayload.collector,
          email: 'different@example.com',
        },
      };
      expect(areOrderPayloadsEqual(basePayload, copy)).toBe(false);
    });

    it('handles secondary wallet matching and mismatches', () => {
      const payloadWithSec: CreateOrderInput = {
        ...basePayload,
        collector: {
          ...basePayload.collector,
          useSecondaryWallet: true,
          secondaryWallet: {
            address: '0x2222222222222222222222222222222222222222',
            network: 'ethereum-mainnet',
          },
        },
      };

      const copy = JSON.parse(JSON.stringify(payloadWithSec));
      expect(areOrderPayloadsEqual(payloadWithSec, copy)).toBe(true);

      const differentSec = {
        ...payloadWithSec,
        collector: {
          ...payloadWithSec.collector,
          secondaryWallet: {
            address: '0x3333333333333333333333333333333333333333',
            network: 'ethereum-mainnet',
          },
        },
      };
      expect(areOrderPayloadsEqual(payloadWithSec, differentSec)).toBe(false);
    });
  });

  describe('createIdempotencyKey', () => {
    it('generates non-empty string with prefix', () => {
      const key = createIdempotencyKey();
      expect(key.startsWith('idem_')).toBe(true);
      expect(key.length).toBeGreaterThan(10);
    });
  });
});
