import { CartSchema } from '@nft/shared-contracts';
import {
  cartRequestOptions,
  useCartMutation,
  type CartMutationDependencies,
} from './cart-mutation';

/** Clears the cart only after the server accepts the operation. */
export function useClearCart(dependencies: CartMutationDependencies) {
  return useCartMutation<void>(
    dependencies,
    async () => {
      const response = await dependencies.client.delete<unknown>(
        '/api/cart',
        cartRequestOptions(dependencies),
      );
      return CartSchema.parse(response.data);
    },
    'Carrinho esvaziado',
  );
}
