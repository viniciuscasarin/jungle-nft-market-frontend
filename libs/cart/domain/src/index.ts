// Public API for @nft/cart-domain
export const CART_DOMAIN_MODULE = '@nft/cart-domain';
export type { Cart, CartItem } from '@nft/shared-contracts';
export { formatEth as formatCartPrice } from '@nft/shared-money';

// Cart calculation functions
export {
  calculateCartItemTotal,
  mergeCartItems,
  validateCartItemQuantity,
  isCartEmpty,
} from './cart-calculations';
