import { mul, parse, toApi } from '@nft/shared-money';
import type { CartItem, Cart } from '@nft/shared-contracts';

/**
 * Calcula o total de um item do carrinho (preço unitário × quantidade).
 * 
 * @param unitPrice - Preço unitário em ETH como string decimal (ex: "1.19")
 * @param quantity - Quantidade inteira do item
 * @returns Total em ETH como string decimal
 * 
 * @example
 * calculateCartItemTotal("1.19", 2) // "2.38"
 */
export function calculateCartItemTotal(unitPrice: string, quantity: number): string {
  return toApi(mul(parse(unitPrice), quantity));
}

/**
 * Mescla um item existente no carrinho com uma nova quantidade,
 * respeitando o limite máximo disponível.
 * 
 * @param existingItem - Item já presente no carrinho
 * @param newQuantity - Nova quantidade a ser adicionada
 * @param maxAvailable - Quantidade máxima disponível em estoque
 * @returns Item atualizado com quantidade mesclada
 * 
 * @example
 * const item = { ..., quantity: 3, maxAvailable: 10 };
 * mergeCartItems(item, 5, 10) // { ..., quantity: 8 }
 * mergeCartItems(item, 10, 10) // { ..., quantity: 10 } // Capped at maxAvailable
 */
export function mergeCartItems(
  existingItem: CartItem,
  newQuantity: number,
  maxAvailable: number
): CartItem {
  const totalQuantity = existingItem.quantity + newQuantity;
  const cappedQuantity = Math.min(totalQuantity, maxAvailable);

  return {
    ...existingItem,
    quantity: cappedQuantity,
    maxAvailable,
  };
}

/**
 * Valida se a quantidade solicitada está dentro do limite disponível.
 * 
 * @param quantity - Quantidade solicitada
 * @param maxAvailable - Quantidade máxima disponível
 * @returns true se a quantidade é válida, false caso contrário
 * 
 * @example
 * validateCartItemQuantity(5, 10) // true
 * validateCartItemQuantity(15, 10) // false
 * validateCartItemQuantity(0, 10) // false
 * validateCartItemQuantity(-1, 10) // false
 */
export function validateCartItemQuantity(quantity: number, maxAvailable: number): boolean {
  return Number.isSafeInteger(quantity) && quantity > 0 && quantity <= maxAvailable;
}

/**
 * Verifica se o carrinho está vazio (sem items).
 * 
 * @param cart - Carrinho a ser verificado
 * @returns true se o carrinho está vazio, false caso contrário
 * 
 * @example
 * isCartEmpty({ items: [] }) // true
 * isCartEmpty({ items: [item1, item2] }) // false
 */
export function isCartEmpty(cart: Cart): boolean {
  return cart.items.length === 0;
}
