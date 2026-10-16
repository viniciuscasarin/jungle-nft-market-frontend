import { describe, it, expect } from 'vitest';
import {
  calculateCartItemTotal,
  mergeCartItems,
  validateCartItemQuantity,
  isCartEmpty,
} from './cart-calculations';
import type { CartItem, Cart } from '@nft/shared-contracts';

describe('cart-calculations', () => {
  describe('calculateCartItemTotal', () => {
    it('calcula total com quantidade 1', () => {
      const result = calculateCartItemTotal('1.19', 1);
      expect(result).toBe('1.19');
    });

    it('calcula total com quantidade múltipla', () => {
      const result = calculateCartItemTotal('1.19', 2);
      expect(result).toBe('2.38');
    });

    it('calcula total com preço decimal complexo', () => {
      const result = calculateCartItemTotal('0.123456789', 3);
      expect(result).toBe('0.370370367');
    });

    it('calcula total com quantidade zero', () => {
      const result = calculateCartItemTotal('1.19', 0);
      expect(result).toBe('0');
    });

    it('mantém precisão com valores grandes', () => {
      const result = calculateCartItemTotal('99.99999999', 100);
      expect(result).toBe('9999.999999');
    });
  });

  describe('mergeCartItems', () => {
    const baseItem: CartItem = {
      id: 'item-1',
      nftId: 'nft-1',
      editionId: 'edition-1',
      title: 'Test NFT',
      imageUrl: '/test.png',
      unitPrice: '1.19',
      quantity: 3,
      maxAvailable: 10,
    };

    it('mescla quantidades sem exceder limite', () => {
      const result = mergeCartItems(baseItem, 5, 10);
      
      expect(result.quantity).toBe(8);
      expect(result.maxAvailable).toBe(10);
      expect(result.id).toBe(baseItem.id);
    });

    it('mescla quantidades respeitando maxAvailable (capping)', () => {
      const result = mergeCartItems(baseItem, 10, 10);
      
      expect(result.quantity).toBe(10); // 3 + 10 = 13, mas capped em 10
      expect(result.maxAvailable).toBe(10);
    });

    it('não altera item se nova quantidade é zero', () => {
      const result = mergeCartItems(baseItem, 0, 10);
      
      expect(result.quantity).toBe(3);
    });

    it('atinge exatamente o limite máximo', () => {
      const result = mergeCartItems(baseItem, 7, 10);
      
      expect(result.quantity).toBe(10); // 3 + 7 = 10
    });

    it('mantém todos os outros campos do item', () => {
      const result = mergeCartItems(baseItem, 2, 10);
      
      expect(result.nftId).toBe(baseItem.nftId);
      expect(result.title).toBe(baseItem.title);
      expect(result.unitPrice).toBe(baseItem.unitPrice);
      expect(result.imageUrl).toBe(baseItem.imageUrl);
    });
  });

  describe('validateCartItemQuantity', () => {
    it('valida quantidade dentro do limite', () => {
      expect(validateCartItemQuantity(5, 10)).toBe(true);
    });

    it('valida quantidade igual ao limite', () => {
      expect(validateCartItemQuantity(10, 10)).toBe(true);
    });

    it('invalida quantidade excedendo limite', () => {
      expect(validateCartItemQuantity(15, 10)).toBe(false);
    });

    it('invalida quantidade zero', () => {
      expect(validateCartItemQuantity(0, 10)).toBe(false);
    });

    it('invalida quantidade negativa', () => {
      expect(validateCartItemQuantity(-1, 10)).toBe(false);
      expect(validateCartItemQuantity(-5, 10)).toBe(false);
    });

    it('valida quantidade 1', () => {
      expect(validateCartItemQuantity(1, 10)).toBe(true);
      expect(validateCartItemQuantity(1, 1)).toBe(true);
    });

    it('invalida quantidade maior que 1 quando limite é 1', () => {
      expect(validateCartItemQuantity(2, 1)).toBe(false);
    });
  });

  describe('isCartEmpty', () => {
    it('retorna true para carrinho sem items', () => {
      const emptyCart: Cart = {
        id: 'cart-1',
        items: [],
      };
      
      expect(isCartEmpty(emptyCart)).toBe(true);
    });

    it('retorna false para carrinho com items', () => {
      const cart: Cart = {
        id: 'cart-1',
        items: [
          {
            id: 'item-1',
            nftId: 'nft-1',
            editionId: 'edition-1',
            title: 'Test NFT',
            imageUrl: '/test.png',
            unitPrice: '1.19',
            quantity: 1,
          },
        ],
      };
      
      expect(isCartEmpty(cart)).toBe(false);
    });

    it('retorna false para carrinho com múltiplos items', () => {
      const cart: Cart = {
        id: 'cart-1',
        items: [
          {
            id: 'item-1',
            nftId: 'nft-1',
            editionId: 'edition-1',
            title: 'NFT 1',
            imageUrl: '/test1.png',
            unitPrice: '1.19',
            quantity: 1,
          },
          {
            id: 'item-2',
            nftId: 'nft-2',
            editionId: 'edition-2',
            title: 'NFT 2',
            imageUrl: '/test2.png',
            unitPrice: '2.39',
            quantity: 2,
          },
        ],
      };
      
      expect(isCartEmpty(cart)).toBe(false);
    });
  });
});
