import {
  AddToCartInputSchema,
  CartSchema,
  NftItemSchema,
  ApiError,
  type AddToCartInput,
  type NftItem,
} from '@nft/shared-contracts';
import { queryKeys } from '@nft/shared-query';
import {
  cartRequestOptions,
  useCartMutation,
  type CartMutationDependencies,
} from './cart-mutation';

/** Adds an edition with reversible optimistic state based on actual catalog metadata. */
export function useAddToCart(dependencies: CartMutationDependencies) {
  return useCartMutation(
    dependencies,
    async (input: AddToCartInput) => {
      const response = await dependencies.client.post<unknown>(
        '/api/cart/items',
        AddToCartInputSchema.parse(input),
        cartRequestOptions(dependencies),
      );
      return CartSchema.parse(response.data);
    },
    'Item adicionado ao carrinho',
    async (cart, input, queryClient) => {
      const validated = AddToCartInputSchema.parse(input);
      const cached = queryClient.getQueryData<NftItem>(queryKeys.catalog.detail(validated.nftId));
      const nft =
        cached ??
        NftItemSchema.parse(
          (
            await dependencies.client.get<unknown>(
              `/api/nfts/${encodeURIComponent(validated.nftId)}`,
            )
          ).data,
        );
      const edition = nft.editions.find(candidate => candidate.id === validated.editionId);
      if (!edition)
        throw new ApiError({
          code: 'NOT_FOUND',
          message: 'Edição não encontrada.',
          retryable: false,
        });
      const existing = cart.items.find(
        item => item.nftId === validated.nftId && item.editionId === validated.editionId,
      );
      const items = existing
        ? cart.items.map(item =>
            item.id === existing.id
              ? {
                  ...item,
                  quantity: Math.min(item.quantity + validated.quantity, edition.availableSupply),
                }
              : item,
          )
        : [
            ...cart.items,
            {
              id: `optimistic:${validated.nftId}:${validated.editionId}`,
              nftId: nft.id,
              editionId: edition.id,
              title: nft.title,
              imageUrl: nft.imageUrl,
              unitPrice: edition.price,
              editionNumber: edition.editionNumber,
              quantity: validated.quantity,
              maxAvailable: edition.availableSupply,
            },
          ];
      return { ...cart, items };
    },
  );
}
