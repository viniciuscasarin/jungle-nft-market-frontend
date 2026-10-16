import * as React from 'react';
import { useNavigate, useParams } from '@nft/shared-router';
import { useShell, usePageChrome, useUnavailable } from '@nft/shell-kit';
import { Button, EmptyState, ErrorState, Skeleton } from '@nft/shared-ui';
import {
  useCatalogDetailQuery,
  useCatalogListQuery,
} from '@nft/catalog-data-access';
import {
  PdpPageContent,
  type PdpAttributeItem,
  type PdpRelatedItem,
  type PdpVersionOption,
} from '@nft/catalog-ui';
import { formatEth } from '@nft/shared-money';
import type { NftEdition, NftItem } from '@nft/shared-contracts';

const MAX_RELATED_ITEMS = 10;

function editionLabel(edition: NftEdition): string {
  return edition.name ?? `${edition.editionNumber}/${edition.maxSupply}`;
}

function toVersions(editions: NftEdition[]): PdpVersionOption[] {
  return editions.map((edition) => ({
    id: edition.id,
    name: editionLabel(edition),
    editionBadge: editionLabel(edition),
    availableStock: edition.availableSupply,
    totalStock: edition.maxSupply,
    priceEth: edition.price,
    isSoldOut: edition.availableSupply === 0,
  }));
}

function toAttributes(nft: NftItem): PdpAttributeItem[] {
  const attributes: PdpAttributeItem[] = [];
  if (nft.category) attributes.push({ trait_type: 'Categoria', value: nft.category });
  if (nft.rarity) attributes.push({ trait_type: 'Raridade', value: nft.rarity });
  for (const tag of nft.tags) attributes.push({ trait_type: 'Tag', value: tag });
  return attributes;
}

function PdpSkeleton() {
  return (
    <div
      data-testid="pdp-loading"
      aria-busy="true"
      aria-live="polite"
      className="w-full max-w-[1440px] mx-auto px-4 lg:px-[120px] py-8 flex flex-col lg:flex-row gap-8"
    >
      <Skeleton width="100%" height={573} rounded="xl" ariaLabel="Carregando imagem do NFT" />
      <div className="flex-1 flex flex-col gap-4">
        <Skeleton width="60%" height={36} rounded="sm" />
        <Skeleton width="30%" height={28} rounded="sm" />
        <Skeleton width="100%" height={96} rounded="md" />
        <Skeleton width="100%" height={48} rounded="md" />
      </div>
    </div>
  );
}

/**
 * PDP conectada: o detalhe vem de GET /api/nfts/:id e o preço exibido é o da
 * edição selecionada na resposta da API (a UI não calcula totais).
 */
export function PdpFeaturePage() {
  const { httpClient } = useShell();
  const navigate = useNavigate();
  const { notifyUnavailable } = useUnavailable();
  const params = useParams({ strict: false }) as Record<string, string | undefined>;
  const nftId = params['nftId'] ?? '';

  const detail = useCatalogDetailQuery(httpClient, nftId);
  const related = useCatalogListQuery(httpClient, {});
  const nft = detail.data;

  usePageChrome({ breadcrumbLabel: nft?.title });

  const [selectedEditionId, setSelectedEditionId] = React.useState<string | undefined>();
  const [quantity, setQuantity] = React.useState(1);

  const editions = nft?.editions ?? [];
  const activeEdition =
    editions.find((edition) => edition.id === selectedEditionId) ??
    editions.find((edition) => edition.availableSupply > 0) ??
    editions[0];

  const maxQuantity = Math.max(1, activeEdition?.availableSupply ?? 1);
  const safeQuantity = Math.min(quantity, maxQuantity);

  const relatedItems = React.useMemo<PdpRelatedItem[]>(
    () =>
      (related.data?.items ?? [])
        .filter((item) => item.id !== nftId)
        .slice(0, MAX_RELATED_ITEMS)
        .map((item) => ({
          id: item.id,
          name: item.title,
          price: `${formatEth(item.price)} ETH`,
          imageUrl: item.imageUrl,
          alt: `NFT ${item.title}`,
        })),
    [related.data, nftId],
  );

  const goToCatalog = React.useCallback(() => {
    void navigate({ to: '/' } as never);
  }, [navigate]);

  const handleSelectRelated = React.useCallback(
    (item: PdpRelatedItem) => {
      void navigate({ to: '/nft/$nftId', params: { nftId: item.id } } as never);
    },
    [navigate],
  );

  if (detail.isLoading) {
    return (
      <div data-testid="storefront-pdp-page" className="w-full">
        <PdpSkeleton />
      </div>
    );
  }

  if (detail.isError) {
    const code = (detail.error as { code?: string } | null)?.code;
    if (code === 'NOT_FOUND') {
      return (
        <div data-testid="storefront-pdp-page" className="w-full">
          <div data-testid="pdp-not-found" className="max-w-[1440px] mx-auto px-4 py-16">
            <EmptyState
              title="Colecionável não encontrado"
              description="O NFT que você procura não existe ou foi removido."
              action={<Button onClick={goToCatalog}>Voltar ao catálogo</Button>}
            />
          </div>
        </div>
      );
    }
    return (
      <div data-testid="storefront-pdp-page" className="w-full">
        <div data-testid="pdp-error" className="max-w-[1440px] mx-auto px-4 py-16">
          <ErrorState
            title="Não foi possível carregar o NFT"
            description="Tente novamente em instantes."
            onRetry={() => void detail.refetch()}
          />
        </div>
      </div>
    );
  }

  if (!nft) {
    return (
      <div data-testid="storefront-pdp-page" className="w-full">
        <PdpSkeleton />
      </div>
    );
  }

  return (
    <div data-testid="storefront-pdp-page" className="w-full">
      <PdpPageContent
        galleryImages={[
          { id: `${nft.id}-main`, url: nft.imageUrl, alt: nft.title, label: 'Principal' },
        ]}
        title={nft.title}
        priceEth={formatEth(activeEdition?.price ?? nft.price)}
        rating={nft.rating.average}
        reviewCount={nft.rating.count}
        description={nft.description ?? ''}
        detailsDescription={nft.description ?? ''}
        versions={toVersions(editions)}
        selectedVersionId={activeEdition?.id}
        onSelectVersion={setSelectedEditionId}
        quantity={safeQuantity}
        onQuantityChange={setQuantity}
        minQuantity={1}
        maxQuantity={maxQuantity}
        onFavoriteToggle={() => notifyUnavailable('Favoritar NFT')}
        onBuyNow={() => notifyUnavailable('Compra direta')}
        onAddToCart={() => notifyUnavailable('Adicionar ao carrinho')}
        tokenId={`#${nft.id}`}
        collectionName={nft.collectionName ?? ''}
        isCollectionVerified={nft.creator.verified}
        attributes={toAttributes(nft)}
        reviews={[]}
        relatedCarouselTitle="Mais dessa colecao"
        relatedItems={relatedItems}
        onSelectRelatedItem={handleSelectRelated}
        onBack={goToCatalog}
      />
    </div>
  );
}
