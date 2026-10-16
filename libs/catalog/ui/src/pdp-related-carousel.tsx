import * as React from 'react';
import {
  NftCarousel,
  type NftCarouselItem,
  type NftCarouselProps,
} from '@nft/shared-ui';

export type PdpRelatedItem = NftCarouselItem;
export type PdpRelatedCarouselProps = NftCarouselProps;

/**
 * Carrossel da Página de Detalhes (PDP) "Mais dessa coleção", implementado
 * através do componente compartilhado e unificado NftCarousel de @nft/shared-ui.
 */
export const PdpRelatedCarousel: React.FC<PdpRelatedCarouselProps> = (props) => {
  return (
    <NftCarousel
      title="Mais dessa colecao"
      testIdPrefix="pdp-related"
      {...props}
    />
  );
};

PdpRelatedCarousel.displayName = 'PdpRelatedCarousel';
