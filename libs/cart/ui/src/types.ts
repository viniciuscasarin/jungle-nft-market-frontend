import {
  calculateCartItemTotal,
  formatCartPrice,
  type CartItem as DomainCartItem,
} from '@nft/cart-domain';

/**
 * UI-specific view model for CartItem, optimized for presentation.
 * Maps from domain CartItem to UI-friendly format.
 */
export interface CartItemViewModel {
  id: string;
  name: string;
  tokenId: string;
  imageUrl: string;
  priceEth: string;
  totalEth?: string;
  quantity: number;
  maxQuantity: number;
  edition: string;
}

/**
 * UI-specific view model for order summary in the cart.
 */
export interface CartOrderSummary {
  subtotalEth: string;
  discountEth: string;
  networkFeeEth: string;
  totalEth: string;
  appliedCoupon?: string | null;
}

/**
 * Converts a domain CartItem to a CartItemViewModel for UI rendering.
 */
export function toCartItemViewModel(item: DomainCartItem): CartItemViewModel {
  return {
    id: item.id,
    name: item.title,
    tokenId: item.editionNumber ? `#${String(item.editionNumber).padStart(4, '0')}` : '',
    imageUrl: item.imageUrl,
    priceEth: `${formatCartPrice(item.unitPrice)} ETH`,
    totalEth: `${formatCartPrice(calculateCartItemTotal(item.unitPrice, item.quantity))} ETH`,
    quantity: item.quantity,
    maxQuantity: item.maxAvailable ?? 999,
    edition: item.editionNumber ? `1/${item.maxAvailable ?? 1}` : '1/1',
  };
}

/**
 * Re-export domain CartItem for use in connected components.
 */
export type { DomainCartItem as CartItem };
