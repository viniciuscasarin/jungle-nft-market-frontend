import * as React from 'react';
import {
  NftCarousel,
  type NftCarouselItem,
  type NftCarouselProps,
  DEFAULT_PDP_RELATED_ITEMS,
} from '@nft/shared-ui';

export type PdpRelatedItem = NftCarouselItem;
export type PdpRelatedCarouselProps = NftCarouselProps;

export const DEFAULT_RELATED_ITEMS = DEFAULT_PDP_RELATED_ITEMS;

/**
 * Carrossel da Página de Detalhes (PDP) "Mais dessa coleção", implementado
 * através do componente compartilhado e unificado NftCarousel de @nft/shared-ui.
 */
export const PdpRelatedCarousel: React.FC<PdpRelatedCarouselProps> = (props) => {
  return (
    <NftCarousel
      title="Mais dessa colecao"
      items={DEFAULT_PDP_RELATED_ITEMS}
      testIdPrefix="pdp-related"
      {...props}
    />
  );
};

PdpRelatedCarousel.displayName = 'PdpRelatedCarousel';
