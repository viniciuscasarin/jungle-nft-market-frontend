import {
  CartSchema,
  UpdateCartItemInputSchema,
  type UpdateCartItemInput,
} from '@nft/shared-contracts';
import {
  cartRequestOptions,
  useCartMutation,
  type CartMutationDependencies,
} from './cart-mutation';

/** Changes quantity through REST; stock and totals remain authoritative on the server. */
export function useUpdateCartItem(dependencies: CartMutationDependencies) {
  return useCartMutation(
    dependencies,
    async (input: UpdateCartItemInput & { itemId: string }) => {
      const response = await dependencies.client.put<unknown>(
        `/api/cart/items/${encodeURIComponent(input.itemId)}`,
        UpdateCartItemInputSchema.parse(input),
        cartRequestOptions(dependencies),
      );
      return CartSchema.parse(response.data);
    },
    'Quantidade atualizada',
  );
}
