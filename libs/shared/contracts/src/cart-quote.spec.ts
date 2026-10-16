import { describe, it, expect } from 'vitest';
import {
  CartItemSchema,
  AddToCartInputSchema,
  QuoteSchema,
  ItemAvailabilitySchema,
} from './index';

describe('Cart and Quote Contracts (@nft/shared-contracts)', () => {
  describe('CartItemSchema', () => {
    it('accepts valid cart item with integer quantity and decimal ETH price', () => {
      const validItem = {
        id: 'item-1',
        nftId: 'nft-100',
        editionId: 'ed-1',
        title: 'Cyber Panther #1',
        editionNumber: 1,
        imageUrl: 'https://example.com/item.png',
        unitPrice: '1.5000',
        quantity: 2,
        maxAvailable: 10,
      };
      const parsed = CartItemSchema.parse(validItem);
      expect(parsed.quantity).toBe(2);
      expect(parsed.unitPrice).toBe('1.5000');
    });

    it('rejects fractional quantity in cart items (e.g. 2.5)', () => {
      const invalidItem = {
        id: 'item-1',
        nftId: 'nft-100',
        editionId: 'ed-1',
        title: 'Cyber Panther #1',
        imageUrl: 'https://example.com/item.png',
        unitPrice: '1.5000',
        quantity: 2.5,
      };
      expect(() => CartItemSchema.parse(invalidItem)).toThrow(
        /Quantidade deve ser um número inteiro/
      );
    });

    it('rejects zero or negative quantities in cart items', () => {
      const invalidZero = {
        id: 'item-1',
        nftId: 'nft-100',
        editionId: 'ed-1',
        title: 'Cyber Panther #1',
        imageUrl: 'https://example.com/item.png',
        unitPrice: '1.5000',
        quantity: 0,
      };
      expect(() => CartItemSchema.parse(invalidZero)).toThrow();

      const invalidNegative = { ...invalidZero, quantity: -1 };
      expect(() => CartItemSchema.parse(invalidNegative)).toThrow();
    });

    it('enforces positive integer quantity on AddToCart input', () => {
      expect(() =>
        AddToCartInputSchema.parse({
          nftId: 'nft-1',
          editionId: 'ed-1',
          quantity: 1.5,
        })
      ).toThrow(/Quantidade deve ser um número inteiro/);
    });
  });

  describe('QuoteSchema & Authoritative API Totals', () => {
    it('validates authoritative quote with all monetary fields as decimal strings', () => {
      const validQuote = {
        quoteId: 'quote-abc-123',
        subtotal: '3.0000',
        discount: '0.3000',
        networkFee: '0.0050',
        total: '2.7050',
        coupon: {
          code: 'WELCOME10',
          discountPercent: 10,
          discountAmount: '0.3000',
          isValid: true,
          message: '10% de desconto aplicado',
        },
        itemsAvailability: [
          {
            nftId: 'nft-100',
            editionId: 'ed-1',
            requestedQuantity: 2,
            availableQuantity: 10,
            isAvailable: true,
            currentPrice: '1.5000',
            priceChanged: false,
          },
        ],
        isExpired: false,
        expiresAt: '2026-03-01T12:00:00Z',
      };

      const parsed = QuoteSchema.parse(validQuote);
      expect(parsed.quoteId).toBe('quote-abc-123');
      expect(parsed.subtotal).toBe('3.0000');
      expect(parsed.discount).toBe('0.3000');
      expect(parsed.networkFee).toBe('0.0050');
      expect(parsed.total).toBe('2.7050');
      expect(parsed.itemsAvailability).toHaveLength(1);
    });

    it('rejects quote when monetary fields are provided as numbers', () => {
      const invalidQuote = {
        quoteId: 'quote-123',
        subtotal: 3.0, // Number must fail!
        discount: '0.0000',
        networkFee: '0.0050',
        total: '3.0050',
        itemsAvailability: [],
        expiresAt: '2026-03-01T12:00:00Z',
      };

      expect(() => QuoteSchema.parse(invalidQuote)).toThrow(
        /Valor em ETH deve ser uma string decimal, não number/
      );
    });

    it('validates ItemAvailability constraints', () => {
      const validAvailability = {
        nftId: 'nft-1',
        editionId: 'ed-1',
        requestedQuantity: 3,
        availableQuantity: 2,
        isAvailable: false,
        currentPrice: '1.2000',
        priceChanged: true,
      };

      const parsed = ItemAvailabilitySchema.parse(validAvailability);
      expect(parsed.isAvailable).toBe(false);
      expect(parsed.priceChanged).toBe(true);
      expect(parsed.currentPrice).toBe('1.2000');
    });
  });
});
