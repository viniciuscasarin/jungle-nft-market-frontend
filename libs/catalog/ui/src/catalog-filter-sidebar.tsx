import * as React from 'react';
import { cn, PriceRangeSlider } from '@nft/shared-ui';

export interface CollectionFilterItem {
  id: string;
  label: string;
  count: number;
}

export interface NetworkFilterItem {
  id: string;
  label: string;
  count: number;
}

export interface CatalogFilterSidebarProps {
  collections?: CollectionFilterItem[] | undefined;
  selectedCollections?: string[] | undefined;
  onToggleCollection?: ((id: string) => void) | undefined;
  priceRange?: [number, number] | undefined;
  onPriceRangeChange?: ((range: [number, number]) => void) | undefined;
  onApplyPriceRange?: (() => void) | undefined;
  networks?: NetworkFilterItem[] | undefined;
  selectedNetworks?: string[] | undefined;
  onToggleNetwork?: ((id: string) => void) | undefined;
  onClearFilters?: (() => void) | undefined;
  featuredNft?: {
    title?: string | undefined;
    subtitle?: string | undefined;
    imageUrl?: string | undefined;
    onClick?: (() => void) | undefined;
  } | undefined;
  className?: string | undefined;
}

export const DEFAULT_COLLECTIONS: CollectionFilterItem[] = [
  { id: 'arte-digital', label: 'Arte digital', count: 33 },
  { id: 'fotografia', label: 'Fotografia', count: 12 },
  { id: 'musica', label: 'Música', count: 65 },
  { id: 'arte-3d', label: 'Arte 3D', count: 39 },
  { id: 'colecionaveis', label: 'Colecionáveis', count: 23 },
  { id: 'generativa', label: 'Generativa', count: 17 },
  { id: 'jogos', label: 'Jogos', count: 19 },
  { id: 'assinaturas', label: 'Assinaturas', count: 13 },
  { id: 'utilidade', label: 'Utilidade', count: 18 },
];

export const DEFAULT_NETWORKS: NetworkFilterItem[] = [
  { id: 'ethereum', label: 'Ethereum', count: 119 },
  { id: 'polygon', label: 'Polygon', count: 78 },
  { id: 'solana', label: 'Solana', count: 86 },
];

export const CatalogFilterSidebar: React.FC<CatalogFilterSidebarProps> = ({
  collections = DEFAULT_COLLECTIONS,
  selectedCollections = [],
  onToggleCollection,
  priceRange = [0.02, 12.3],
  onPriceRangeChange,
  onApplyPriceRange,
  networks = DEFAULT_NETWORKS,
  selectedNetworks = [],
  onToggleNetwork,
  onClearFilters,
  featuredNft = {
    title: 'NFT EM DESTAQUE',
    subtitle: 'OFERTA LIMITADA',
    imageUrl: '/assets/images/featured-nft.png',
  },
  className,
}) => {
  const [internalPriceRange, setInternalPriceRange] = React.useState<[number, number]>(priceRange);

  React.useEffect(() => {
    setInternalPriceRange(priceRange);
  }, [priceRange]);

  const handleSliderChange = (range: [number, number]) => {
    setInternalPriceRange(range);
    onPriceRangeChange?.(range);
  };

  const handleApplyPrice = () => {
    onApplyPriceRange?.();
  };

  const hasActiveFilters =
    selectedCollections.length > 0 ||
    selectedNetworks.length > 0 ||
    internalPriceRange[0] > 0.02 ||
    internalPriceRange[1] < 12.3;

  return (
    <aside
      data-testid="catalog-filter-sidebar"
      className={cn('w-full font-mono flex flex-col gap-8 select-none bg-surface-card p-5', className)}
      aria-label="Filtros do Catálogo"
    >
      {/* Botão de limpar filtros se houver ativos */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pb-2 border-b border-border-default/40">
          <span className="text-tiny-10 text-text-muted">Filtros ativos</span>
          <button
            type="button"
            onClick={onClearFilters}
            className="text-tiny-10 text-text-accent hover:underline font-bold"
          >
            Limpar todos
          </button>
        </div>
      )}

      {/* SEÇÃO 1: Coleções */}
      <div data-testid="sidebar-collections-section" className="flex flex-col">
        <h3 className="text-body-18 font-bold text-text-primary tracking-wide mb-3">
          Coleções
        </h3>
        <ul className="flex flex-col space-y-2" role="group" aria-label="Filtro por coleção">
          {collections.map((col) => {
            const isSelected = selectedCollections.includes(col.id);
            return (
              <li key={col.id}>
                <button
                  type="button"
                  onClick={() => onToggleCollection?.(col.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    'w-full flex items-center justify-between text-caption-15 py-1 px-1.5 rounded transition-colors text-left cursor-pointer group',
                    isSelected
                      ? 'text-text-accent font-bold'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    {col.label}
                  </span>
                  <span
                    className={cn(
                      'text-caption-15',
                      isSelected ? 'text-text-accent' : 'text-text-muted'
                    )}
                  >
                    ({col.count})
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* SEÇÃO 2: Faixa de Preço */}
      <div data-testid="sidebar-price-section" className="flex flex-col">
        <h3 className="text-body-18 font-bold text-text-primary tracking-wide mb-3">
          Faixa de preço
        </h3>

        {/* Dual Slider */}
        <PriceRangeSlider
          min={0}
          max={15}
          step={0.1}
          value={internalPriceRange}
          onChange={handleSliderChange}
          currencySymbol="ETH"
          className="mb-3"
        />

        {/* Linha com Preço formatado e Botão Aplicar */}
        <div className="flex items-center justify-between gap-3 mt-1">
          <div className="text-caption-12 text-text-secondary">
            Preço:{' '}
            <strong className="text-text-primary font-bold">
              {internalPriceRange[0].toFixed(2).replace('.', ',')} - {internalPriceRange[1].toFixed(2).replace('.', ',')} ETH
            </strong>
          </div>
          <button
            type="button"
            data-testid="apply-price-button"
            onClick={handleApplyPrice}
            className="bg-primary hover:bg-primary-hover text-ink text-caption-12 font-bold px-3 py-1 rounded transition-colors shadow-xs active:scale-95 cursor-pointer"
          >
            Aplicar
          </button>
        </div>
      </div>

      {/* SEÇÃO 3: Rede */}
      <div data-testid="sidebar-networks-section" className="flex flex-col">
        <h3 className="text-body-18 font-bold text-text-primary tracking-wide mb-3">
          Rede
        </h3>
        <ul className="flex flex-col space-y-2" role="group" aria-label="Filtro por rede">
          {networks.map((net) => {
            const isSelected = selectedNetworks.includes(net.id);
            return (
              <li key={net.id}>
                <button
                  type="button"
                  onClick={() => onToggleNetwork?.(net.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    'w-full flex items-center justify-between text-caption-15 py-1 px-1.5 rounded transition-colors text-left cursor-pointer group',
                    isSelected
                      ? 'text-text-accent font-bold'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    {net.label}
                  </span>
                  <span
                    className={cn(
                      'text-caption-15',
                      isSelected ? 'text-text-accent' : 'text-text-muted'
                    )}
                  >
                    ({net.count})
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* SEÇÃO 4: NFT EM DESTAQUE / OFERTA LIMITADA */}
      {featuredNft && (
        <button
          type="button"
          data-testid="sidebar-featured-nft"
          className="flex flex-col rounded-2xl border border-border-default/80 bg-surface-card p-4 overflow-hidden shadow-card group transition-all hover:border-border-accessible cursor-pointer text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={featuredNft.onClick}
        >
          <div className="text-center w-full mb-3">
            <span className="block text-tiny-10 font-bold tracking-widest text-text-accent uppercase">
              {featuredNft.title ?? 'NFT EM DESTAQUE'}
            </span>
            <h4 className="text-caption-12 font-bold tracking-wider text-text-primary uppercase mt-0.5">
              {featuredNft.subtitle ?? 'OFERTA LIMITADA'}
            </h4>
          </div>

          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-surface-raised border border-border-default">
            <img
              src={featuredNft.imageUrl ?? '/assets/images/featured-nft.png'}
              alt={featuredNft.title ?? 'NFT em destaque'}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </button>
      )}
    </aside>
  );
};
