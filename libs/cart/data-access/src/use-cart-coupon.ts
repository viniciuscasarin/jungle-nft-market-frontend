import { CartCouponInputSchema, CartSchema, type CartCouponInput } from '@nft/shared-contracts';
import { cartRequestOptions, useCartMutation, type CartMutationDependencies } from './cart-mutation';

/** Stores the validated coupon on the server so login and payment use the same cart. */
export function useCartCoupon(dependencies: CartMutationDependencies) {
  return useCartMutation(dependencies, async (input: CartCouponInput) => {
    const response = await dependencies.client.put<unknown>('/api/cart/coupon',
      CartCouponInputSchema.parse(input), cartRequestOptions(dependencies));
    return CartSchema.parse(response.data);
  }, 'Cupom atualizado');
}
