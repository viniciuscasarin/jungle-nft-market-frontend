import { CartSchema } from '@nft/shared-contracts';
import {
  cartRequestOptions,
  useCartMutation,
  type CartMutationDependencies,
} from './cart-mutation';

/** Removes only an item owned by the current cart identity. */
export function useRemoveCartItem(dependencies: CartMutationDependencies) {
  return useCartMutation(
    dependencies,
    async (input: { itemId: string }) => {
      const response = await dependencies.client.delete<unknown>(
        `/api/cart/items/${encodeURIComponent(input.itemId)}`,
        cartRequestOptions(dependencies),
      );
      return CartSchema.parse(response.data);
    },
    'Item removido do carrinho',
  );
}
