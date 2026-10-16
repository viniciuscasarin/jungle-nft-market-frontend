import * as React from 'react';
import {
  cn,
  IconSliders,
  IconSearch,
  IconHeart,
  Drawer,
  DrawerContent,
  Skeleton,
  EmptyState,
  ErrorState,
  Button,
} from '@nft/shared-ui';
import { parse, format } from '@nft/shared-money';
import type { CatalogFacets, NftItem } from '@nft/shared-contracts';
import { HomeHeroBanner } from './home-hero-banner';
import {
  CatalogFilterSidebar,
  type CollectionFilterItem,
  type NetworkFilterItem,
} from './catalog-filter-sidebar';
import { HomePromoSection } from './home-promo-section';
import { HomeBlogSection } from './home-blog-section';

export interface CatalogNftDisplayItem {
  id: string;
  title: string;
  collectionName?: string | undefined;
  priceEth: string;
  previousPriceEth?: string | undefined;
  rarity?: string | undefined;
  imageUrl: string;
  isFavorite?: boolean | undefined;
}

export interface HomePageContentProps {
  items?: (CatalogNftDisplayItem | NftItem)[] | undefined;
  isLoading?: boolean | undefined;
  isError?: boolean | undefined;
  error?: Error | null | undefined;
  onRetry?: (() => void) | undefined;
  facets?: CatalogFacets | undefined;
  activeTab?: 'all' | 'new' | 'trending' | undefined;
  onTabChange?: ((tab: 'all' | 'new' | 'trending') => void) | undefined;
  sortBy?: string | undefined;
  onSortChange?: ((sort: string) => void) | undefined;
  selectedCollections?: string[] | undefined;
  onToggleCollection?: ((id: string) => void) | undefined;
  selectedNetworks?: string[] | undefined;
  onToggleNetwork?: ((id: string) => void) | undefined;
  minPrice?: string | undefined;
  maxPrice?: string | undefined;
  onPriceRangeChange?: ((min?: string, max?: string) => void) | undefined;
  onApplyPriceRange?: (() => void) | undefined;
  onClearFilters?: (() => void) | undefined;
  currentPage?: number | undefined;
  totalPages?: number | undefined;
  onPageChange?: ((page: number) => void) | undefined;
  onSelectNft?: ((id: string) => void) | undefined;
  onFavoriteToggle?: ((id: string) => void) | undefined;
  onUnavailable?: ((featureName: string) => void) | undefined;
  isFilterDrawerOpen?: boolean | undefined;
  onOpenFilterDrawerChange?: ((open: boolean) => void) | undefined;
  className?: string | undefined;
}

export const HomePageContent: React.FC<HomePageContentProps> = ({
  items = [],
  isLoading = false,
  isError = false,
  error,
  onRetry,
  facets,
  activeTab = 'all',
  onTabChange,
  sortBy = 'popular-desc',
  onSortChange,
  selectedCollections = [],
  onToggleCollection,
  selectedNetworks = [],
  onToggleNetwork,
  minPrice,
  maxPrice,
  onPriceRangeChange,
  onApplyPriceRange,
  onClearFilters,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onSelectNft,
  onFavoriteToggle,
  onUnavailable,
  isFilterDrawerOpen: controlledFilterDrawerOpen,
  onOpenFilterDrawerChange,
  className,
}) => {
  const [internalDrawerOpen, setInternalDrawerOpen] = React.useState(false);
  const isDrawerOpen = controlledFilterDrawerOpen ?? internalDrawerOpen;
  const setDrawerOpen = onOpenFilterDrawerChange ?? setInternalDrawerOpen;

  const collectionsData: CollectionFilterItem[] | undefined = facets?.collections;
  const networksData: NetworkFilterItem[] | undefined = facets?.networks;

  const renderedItems: CatalogNftDisplayItem[] = items.map((item) => {
    if ('price' in item && typeof item.price === 'string') {
      return {
        id: item.id,
        title: item.title,
        collectionName: item.collectionName,
        priceEth: item.price,
        previousPriceEth: item.previousPriceEth,
        rarity: item.rarity,
        imageUrl: item.imageUrl,
      };
    }
    return item as CatalogNftDisplayItem;
  });

  return (
    <div
      data-testid="home-page-content"
      className={cn(
        'w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-[120px] font-mono text-text-primary py-4 sm:py-6 pb-24 lg:pb-12',
        className,
      )}
    >
      {/* BARRA DE PESQUISA & FILTRO MOBILE */}
      <div className="lg:hidden mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Explorar coleções e abrir filtros"
          className="flex-1 relative flex items-center bg-surface-card border border-border-default/70 rounded-[14px] px-3.5 h-[48px] shadow-sm text-left cursor-pointer active:scale-[0.99] transition-transform"
        >
          <IconSearch className="w-5 h-5 text-text-secondary mr-2.5 shrink-0" aria-hidden="true" />
          <span className="text-caption-13 text-text-secondary font-mono">
            Explorar coleções
          </span>
        </button>

        <button
          type="button"
          data-testid="mobile-filter-button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir painel de filtros"
          className="h-[48px] w-[48px] flex items-center justify-center rounded-[14px] bg-primary text-ink hover:bg-primary-hover active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
        >
          <IconSliders className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* 1. SEÇÃO HERO BANNER */}
      <HomeHeroBanner
        onCtaClick={() => {
          onSelectNft?.('nft-01');
        }}
      />

      {/* 2. SEÇÃO CATÁLOGO & DESCOBERTA */}
      <section
        id="catalogo"
        data-testid="home-catalog-section"
        className="mt-6 sm:mt-16 scroll-mt-20 sm:scroll-mt-24"
        aria-label="Catálogo de Colecionáveis"
      >
        <div id="busca" className="sr-only" aria-hidden="true" />
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* COLUNA ESQUERDA: Sidebar de Filtros Desktop */}
          <div className="hidden lg:block w-[310px] shrink-0 sticky top-6">
            <CatalogFilterSidebar
              collections={collectionsData}
              selectedCollections={selectedCollections}
              onToggleCollection={onToggleCollection}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceRangeChange={onPriceRangeChange}
              onApplyPriceRange={onApplyPriceRange}
              networks={networksData}
              selectedNetworks={selectedNetworks}
              onToggleNetwork={onToggleNetwork}
              onClearFilters={onClearFilters}
              featuredNft={{
                title: 'NFT EM DESTAQUE',
                subtitle: 'OFERTA LIMITADA',
                imageUrl: '/assets/images/featured-nft.png',
                onClick: () => {
                  onSelectNft?.('nft-02');
                },
              }}
            />
          </div>

          {/* COLUNA DIREITA: Área do Catálogo */}
          <div className="flex-1 min-w-0 w-full">
            {/* Barra Superior do Catálogo: Abas e Ordenação */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-default/60">
              {/* Abas */}
              <div
                role="tablist"
                aria-label="Categorias de exibição de NFTs"
                className="w-full sm:w-auto flex items-center gap-6 overflow-x-auto sm:overflow-visible border-b border-border-default/60 sm:border-b-0 select-none"
              >
                <button
                  type="button"
                  role="tab"
                  data-testid="catalog-tab-all"
                  aria-selected={activeTab === 'all'}
                  onClick={() => onTabChange?.('all')}
                  className={cn(
                    'text-caption-13 font-bold transition-colors pb-3 -mb-[1px] whitespace-nowrap cursor-pointer border-b-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
                    activeTab === 'all'
                      ? 'text-text-accent border-primary'
                      : 'text-text-secondary hover:text-text-primary border-transparent',
                  )}
                >
                  Todos os NFTs
                </button>

                <button
                  type="button"
                  role="tab"
                  data-testid="catalog-tab-new"
                  aria-selected={activeTab === 'new'}
                  onClick={() => onTabChange?.('new')}
                  className={cn(
                    'text-caption-13 font-bold transition-colors pb-3 -mb-[1px] whitespace-nowrap cursor-pointer border-b-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
                    activeTab === 'new'
                      ? 'text-text-accent border-primary'
                      : 'text-text-secondary hover:text-text-primary border-transparent',
                  )}
                >
                  Novos lançamentos
                </button>

                <button
                  type="button"
                  role="tab"
                  data-testid="catalog-tab-trending"
                  aria-selected={activeTab === 'trending'}
                  onClick={() => onTabChange?.('trending')}
                  className={cn(
                    'text-caption-13 font-bold transition-colors pb-3 -mb-[1px] whitespace-nowrap cursor-pointer border-b-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
                    activeTab === 'trending'
                      ? 'text-text-accent border-primary'
                      : 'text-text-secondary hover:text-text-primary border-transparent',
                  )}
                >
                  Em alta
                </button>
              </div>

              {/* Controles da Direita: Ordenação */}
              <div className="hidden lg:flex items-center justify-end gap-3 pb-2.5">
                <div className="flex items-center gap-2 text-caption-12 text-text-secondary">
                  <label htmlFor="catalog-sort-select">Ordenar por:</label>
                  <select
                    id="catalog-sort-select"
                    data-testid="catalog-sort-select"
                    value={sortBy}
                    onChange={(e) => onSortChange?.(e.target.value)}
                    aria-label="Opções de ordenação"
                    className="bg-surface-card border border-border-default text-text-primary text-caption-12 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary cursor-pointer font-mono"
                  >
                    <option value="popular-desc">Mais populares</option>
                    <option value="created-desc">Listados recentemente</option>
                    <option value="price-asc">Menor preço</option>
                    <option value="price-desc">Maior preço</option>
                    <option value="rating-desc">Melhor avaliação</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ESTADO DE ERRO */}
            {isError && (
              <div className="mt-8" data-testid="catalog-error-state">
                <ErrorState
                  title="Não foi possível carregar o catálogo"
                  description={error?.message ?? 'Ocorreu uma falha ao consultar os NFTs. Verifique sua conexão e tente novamente.'}
                  onRetry={onRetry}
                  retryLabel="Tentar novamente"
                />
              </div>
            )}

            {/* ESTADO DE CARREGAMENTO (SKELETONS) */}
            {isLoading && !isError && (
              <div
                data-testid="catalog-loading-grid"
                aria-busy="true"
                aria-label="Carregando catálogo de NFTs..."
                className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mt-6 sm:mt-8"
              >
                {Array.from({ length: 9 }).map((_, index) => (
                  <div
                    key={index}
                    data-testid="catalog-card-skeleton"
                    className="flex flex-col bg-surface-card p-3 rounded-[16px] sm:rounded-[20px] border border-border-default/40"
                  >
                    <Skeleton width="100%" height={210} rounded="lg" className="mb-3" />
                    <Skeleton width="70%" height={20} rounded="sm" className="mb-2" />
                    <Skeleton width="40%" height={16} rounded="sm" />
                  </div>
                ))}
              </div>
            )}

            {/* ESTADO VAZIO */}
            {!isLoading && !isError && renderedItems.length === 0 && (
              <div className="mt-8" data-testid="catalog-empty-state">
                <EmptyState
                  title="Nenhum NFT encontrado"
                  description="Nenhum item corresponde aos filtros selecionados. Tente ajustar os termos de busca ou limpar os filtros ativos."
                  action={
                    onClearFilters ? (
                      <Button
                        type="button"
                        variant="primary"
                        onClick={onClearFilters}
                        data-testid="clear-filters-button"
                      >
                        Limpar todos os filtros
                      </Button>
                    ) : undefined
                  }
                />
              </div>
            )}

            {/* GRADE DE CARDS DO CATÁLOGO (SUCESSO) */}
            {!isLoading && !isError && renderedItems.length > 0 && (
              <div
                data-testid="catalog-grid"
                className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mt-6 sm:mt-8"
              >
                {renderedItems.map((item, index) => {
                  let formattedPrice = `${item.priceEth} ETH`;
                  let formattedPreviousPrice: string | undefined;

                  try {
                    formattedPrice = `${format(parse(item.priceEth), { decimals: 2 })} ETH`;
                  } catch {
                    // Fallback to raw string
                  }

                  if (item.previousPriceEth) {
                    try {
                      formattedPreviousPrice = `${format(parse(item.previousPriceEth), { decimals: 2 })} ETH`;
                    } catch {
                      formattedPreviousPrice = `${item.previousPriceEth} ETH`;
                    }
                  }

                  return (
                    <div
                      key={item.id}
                      data-testid={`catalog-item-${item.id}`}
                      data-item-index={index}
                      aria-label={`${item.title}, preço ${formattedPrice}`}
                      tabIndex={0}
                      role="button"
                      onClick={() => onSelectNft?.(item.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectNft?.(item.id);
                        }
                      }}
                      className="w-full flex flex-col group cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default rounded-[16px] transition-transform duration-150 hover:-translate-y-1 border-none bg-transparent p-0 select-none"
                    >
                      {/* Container da imagem */}
                      <div
                        data-testid={`catalog-image-container-${item.id}`}
                        className="w-full bg-surface-card py-3 sm:py-[20px] px-2 sm:px-[4px] flex items-center justify-center rounded-[16px] sm:rounded-[20px] border border-border-default/40 group-hover:border-border-accessible/60 transition-colors relative overflow-hidden"
                      >
                        {item.rarity && (
                          <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-primary text-ink text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm z-10 select-none">
                            {item.rarity}
                          </span>
                        )}

                        {/* Botão de Favorito */}
                        <button
                          type="button"
                          aria-label={`Favoritar ${item.title}`}
                          data-testid={`favorite-button-${item.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onFavoriteToggle) {
                              onFavoriteToggle(item.id);
                            } else {
                              onUnavailable?.('Favoritar NFT');
                            }
                          }}
                          className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#140d0a]/70 hover:bg-[#140d0a] backdrop-blur-sm flex items-center justify-center text-text-secondary hover:text-text-coral active:scale-90 transition-all cursor-pointer z-10"
                        >
                          <IconHeart className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                        </button>

                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          data-testid={`catalog-image-${item.id}`}
                          className="w-full max-w-[212px] aspect-square rounded-[12px] sm:rounded-[14px] object-cover shrink-0 select-none pointer-events-none"
                          loading="lazy"
                          draggable={false}
                        />
                      </div>

                      {/* Nome do item */}
                      <span
                        data-testid={`catalog-name-${item.id}`}
                        className="mt-2.5 text-[14px] sm:text-[15px] text-text-primary truncate block font-medium group-hover:text-accent transition-colors"
                        title={item.title}
                      >
                        {item.title}
                      </span>

                      {/* Preço do item */}
                      <span
                        data-testid={`catalog-price-${item.id}`}
                        className="mt-0.5 text-[14px] sm:text-[16px] font-bold text-accent block"
                      >
                        {formattedPrice}
                        {formattedPreviousPrice && (
                          <span className="text-[13px] sm:text-[14px] line-through text-text-muted ml-2 font-normal">
                            {formattedPreviousPrice}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Paginação do Catálogo */}
            {!isLoading && !isError && totalPages > 1 && (
              <div
                data-testid="catalog-pagination"
                className="flex items-center justify-end gap-2 mt-12"
                role="navigation"
                aria-label="Paginação do catálogo"
              >
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      data-testid={`pagination-page-${pageNum}`}
                      onClick={() => onPageChange?.(pageNum)}
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={`Página ${pageNum}`}
                      className={cn(
                        'w-9 h-9 flex items-center justify-center rounded-sm text-caption-12 font-bold transition-all cursor-pointer',
                        isActive
                          ? 'bg-primary text-ink shadow-sm'
                          : 'border border-border-default text-text-foreground hover:border-primary hover:text-text-primary bg-transparent',
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Botão Próxima Página */}
                <button
                  type="button"
                  data-testid="pagination-next"
                  onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                  aria-label="Próxima página"
                  className="w-9 h-9 flex items-center justify-center rounded-sm text-caption-12 font-bold border border-border-default text-text-foreground hover:border-primary hover:text-text-primary bg-transparent disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. SEÇÃO PROMOÇÕES */}
      <HomePromoSection onUnavailable={onUnavailable} />

      {/* 4. SEÇÃO BLOG ("Diário da Cunhagem") */}
      <HomeBlogSection onUnavailable={onUnavailable} />

      {/* DRAWER LATERAL DE FILTROS PARA MOBILE / TABLET */}
      <Drawer open={isDrawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent side="left" className="w-[320px] max-w-[85vw] p-6 bg-surface-card">
          <div className="flex items-center justify-between pb-4 border-b border-border-default mb-6">
            <h3 className="text-title-20 font-bold text-text-primary">Filtros</h3>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-140px)] pr-2">
            <CatalogFilterSidebar
              collections={collectionsData}
              selectedCollections={selectedCollections}
              onToggleCollection={onToggleCollection}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceRangeChange={onPriceRangeChange}
              selectedNetworks={selectedNetworks}
              onToggleNetwork={onToggleNetwork}
              onClearFilters={onClearFilters}
              onApplyPriceRange={() => {
                onApplyPriceRange?.();
                setDrawerOpen(false);
              }}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
