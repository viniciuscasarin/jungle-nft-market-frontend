import { describe, it, expect } from 'vitest';
import {
  CollectorSchema,
  OrderSchema,
  OrderReceiptSnapshotSchema,
} from './index';

describe('Orders and Collector Refined Validation (@nft/shared-contracts)', () => {
  describe('CollectorSchema refined validation', () => {
    const validBaseCollector = {
      fullName: 'Alice Walker',
      email: 'alice@example.com',
      walletAddress: '0x1234567890123456789012345678901234567890',
      network: 'ethereum-mainnet',
      ensName: 'alice',
      useSecondaryWallet: false,
    };

    it('succeeds when useSecondaryWallet is false and secondaryWallet is omitted', () => {
      const parsed = CollectorSchema.parse(validBaseCollector);
      expect(parsed.walletAddress).toBe('0x1234567890123456789012345678901234567890');
      expect(parsed.useSecondaryWallet).toBe(false);
    });

    it('fails validation on secondaryWallet when useSecondaryWallet is true but secondaryWallet is omitted', () => {
      const invalid = {
        ...validBaseCollector,
        useSecondaryWallet: true,
      };

      try {
        CollectorSchema.parse(invalid);
        expect.unreachable('Should throw validation error');
      } catch (err: unknown) {
        const error = err as { errors: Array<{ path: string[]; message: string }> };
        const secondaryWalletIssue = error.errors.find((e) =>
          e.path.includes('secondaryWallet')
        );
        expect(secondaryWalletIssue).toBeDefined();
        expect(secondaryWalletIssue?.message).toContain(
          'Carteira secundária é obrigatória quando selecionada'
        );
      }
    });

    it('succeeds when useSecondaryWallet is true and valid secondaryWallet is provided', () => {
      const validWithSecondary = {
        ...validBaseCollector,
        useSecondaryWallet: true,
        secondaryWallet: {
          address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          network: 'ethereum-mainnet',
        },
      };

      const parsed = CollectorSchema.parse(validWithSecondary);
      expect(parsed.secondaryWallet?.address).toBe(
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
      );
    });

    it('fails validation when secondary wallet address is identical to primary', () => {
      const invalid = {
        ...validBaseCollector,
        useSecondaryWallet: true,
        secondaryWallet: {
          address: '0x1234567890123456789012345678901234567890', // same as primary!
          network: 'ethereum-mainnet',
        },
      };

      expect(() => CollectorSchema.parse(invalid)).toThrow(
        /A carteira secundária deve ser diferente da principal/
      );
    });

    it('fails validation with field error on walletAddress if not 42 hex chars', () => {
      const invalid = {
        ...validBaseCollector,
        walletAddress: '0xinvalid',
      };

      try {
        CollectorSchema.parse(invalid);
        expect.unreachable('Should throw validation error');
      } catch (err: unknown) {
        const error = err as { errors: Array<{ path: string[]; message: string }> };
        const walletIssue = error.errors.find((e) => e.path.includes('walletAddress'));
        expect(walletIssue).toBeDefined();
        expect(walletIssue?.message).toContain(
          'Endereço deve ser hexadecimal de 42 caracteres'
        );
      }
    });

    it('fails validation with field error on ensName if it contains .eth suffix', () => {
      const invalid = {
        ...validBaseCollector,
        ensName: 'vitalik.eth',
      };

      try {
        CollectorSchema.parse(invalid);
        expect.unreachable('Should throw validation error');
      } catch (err: unknown) {
        const error = err as { errors: Array<{ path: string[]; message: string }> };
        const ensIssue = error.errors.find((e) => e.path.includes('ensName'));
        expect(ensIssue).toBeDefined();
        expect(ensIssue?.message).toContain('Nome ENS não deve conter o sufixo .eth');
      }
    });
  });

  describe('OrderSchema & OrderReceiptSnapshotSchema', () => {
    it('validates confirmed order and receipt snapshot', () => {
      const receipt = {
        orderId: 'ord-100',
        transactionHash: '0x9999999999999999999999999999999999999999999999999999999999999999',
        collector: {
          fullName: 'Alice Walker',
          email: 'alice@example.com',
          walletAddress: '0x1234567890123456789012345678901234567890',
          network: 'ethereum-mainnet',
          useSecondaryWallet: false,
        },
        items: [
          {
            nftId: 'nft-1',
            editionId: 'ed-1',
            editionNumber: 1,
            title: 'Jungle Apex',
            imageUrl: 'https://example.com/nft.png',
            unitPrice: '1.5000',
            quantity: 1,
            subtotal: '1.5000',
          },
        ],
        quoteId: 'quote-100',
        subtotal: '1.5000',
        discount: '0.0000',
        networkFee: '0.0020',
        total: '1.5020',
        confirmedAt: '2026-03-01T15:00:00Z',
      };

      const parsedReceipt = OrderReceiptSnapshotSchema.parse(receipt);
      expect(parsedReceipt.total).toBe('1.5020');

      const order = {
        id: 'ord-100',
        userId: 'usr-1',
        quoteId: 'quote-100',
        idempotencyKey: 'idem-key-12345',
        status: 'confirmed',
        collector: receipt.collector,
        items: receipt.items,
        subtotal: '1.5000',
        discount: '0.0000',
        networkFee: '0.0020',
        total: '1.5020',
        receipt: parsedReceipt,
        createdAt: '2026-03-01T14:59:00Z',
        updatedAt: '2026-03-01T15:00:00Z',
      };

      const parsedOrder = OrderSchema.parse(order);
      expect(parsedOrder.status).toBe('confirmed');
      expect(parsedOrder.receipt?.transactionHash).toBe(receipt.transactionHash);
    });

    it('rejects order with invalid status', () => {
      const invalidOrder = {
        id: 'ord-100',
        userId: 'usr-1',
        quoteId: 'quote-100',
        idempotencyKey: 'idem-key-12345',
        status: 'in_progress', // invalid status
        collector: {
          fullName: 'Alice',
          email: 'alice@example.com',
          walletAddress: '0x1234567890123456789012345678901234567890',
          network: 'ethereum-mainnet',
          useSecondaryWallet: false,
        },
        items: [],
        subtotal: '1.0',
        discount: '0.0',
        networkFee: '0.0',
        total: '1.0',
        createdAt: '2026-03-01T14:59:00Z',
        updatedAt: '2026-03-01T15:00:00Z',
      };

      expect(() => OrderSchema.parse(invalidOrder)).toThrow();
    });
  });
});
