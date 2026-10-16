import * as React from 'react';
import {
  NftCarousel,
  type NftCarouselItem,
  type NftCarouselProps,
} from '@nft/shared-ui';

export type RecommendedItem = NftCarouselItem;
export type CartRecommendedCarouselProps = NftCarouselProps;

/**
 * Seção "Colecionadores também viram" da página de Carrinho (#11:1278),
 * reutilizando o mesmo componente NftCarousel da PDP configurado para a lista do carrinho.
 */
export const CartRecommendedCarousel: React.FC<CartRecommendedCarouselProps> = (props) => {
  return (
    <NftCarousel
      title="Colecionadores também viram"
      testIdPrefix="cart-recommended"
      {...props}
    />
  );
};

CartRecommendedCarousel.displayName = 'CartRecommendedCarousel';
