import * as React from 'react';
import { cn, PriceRangeSlider } from '@nft/shared-ui';
import { parse, format } from '@nft/shared-money';
import { validatePriceRangeEth } from '@nft/catalog-domain';

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
  minPrice?: string | undefined;
  maxPrice?: string | undefined;
  onPriceRangeChange?: ((minPrice?: string, maxPrice?: string) => void) | undefined;
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
  { id: 'col_cyber_jungle', label: 'Cyber Jungle', count: 12 },
  { id: 'col_neon_predators', label: 'Neon Predators', count: 10 },
  { id: 'col_solana_apes', label: 'Solana Apes', count: 10 },
  { id: 'col_quantum_mecha', label: 'Quantum Mecha', count: 8 },
  { id: 'col_pixel_wildlife', label: 'Pixel Wildlife', count: 8 },
];

export const DEFAULT_NETWORKS: NetworkFilterItem[] = [
  { id: 'ethereum', label: 'Ethereum', count: 20 },
  { id: 'polygon', label: 'Polygon', count: 18 },
  { id: 'solana', label: 'Solana', count: 10 },
];

const DEFAULT_MIN_NUM = 0;
const DEFAULT_MAX_NUM = 15;

export const CatalogFilterSidebar: React.FC<CatalogFilterSidebarProps> = ({
  collections = DEFAULT_COLLECTIONS,
  selectedCollections = [],
  onToggleCollection,
  minPrice,
  maxPrice,
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
  // Convert incoming decimal strings to slider numbers safely at DOM boundary
  const initialSliderMin = minPrice ? Math.max(DEFAULT_MIN_NUM, Number(minPrice) || DEFAULT_MIN_NUM) : DEFAULT_MIN_NUM;
  const initialSliderMax = maxPrice ? Math.min(DEFAULT_MAX_NUM, Number(maxPrice) || DEFAULT_MAX_NUM) : DEFAULT_MAX_NUM;

  const [sliderRange, setSliderRange] = React.useState<[number, number]>([initialSliderMin, initialSliderMax]);

  React.useEffect(() => {
    const nextMin = minPrice ? Number(minPrice) || DEFAULT_MIN_NUM : DEFAULT_MIN_NUM;
    const nextMax = maxPrice ? Number(maxPrice) || DEFAULT_MAX_NUM : DEFAULT_MAX_NUM;
    setSliderRange([nextMin, nextMax]);
  }, [minPrice, maxPrice]);

  const handleSliderChange = (range: [number, number]) => {
    setSliderRange(range);
    const newMinStr = range[0].toFixed(2);
    const newMaxStr = range[1].toFixed(2);
    const validated = validatePriceRangeEth(newMinStr, newMaxStr);
    onPriceRangeChange?.(validated.minPrice, validated.maxPrice);
  };

  const handleApplyPrice = () => {
    onApplyPriceRange?.();
  };

  const hasActiveFilters =
    selectedCollections.length > 0 ||
    selectedNetworks.length > 0 ||
    Boolean(minPrice && minPrice !== '0.00' && minPrice !== '0') ||
    Boolean(maxPrice && maxPrice !== '15.00' && maxPrice !== '15');

  const displayMinFormatted = format(parse(sliderRange[0].toFixed(2)), { decimals: 2 });
  const displayMaxFormatted = format(parse(sliderRange[1].toFixed(2)), { decimals: 2 });

  return (
    <aside
      data-testid="catalog-filter-sidebar"
      className={cn('w-full font-mono flex flex-col gap-8 select-none bg-surface-card p-5 rounded-2xl border border-border-default', className)}
      aria-label="Filtros do Catálogo"
    >
      {/* Botão de limpar filtros se houver ativos */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pb-2 border-b border-border-default/40">
          <span className="text-tiny-10 text-text-muted">Filtros ativos</span>
          <button
            type="button"
            onClick={onClearFilters}
            className="text-tiny-10 text-text-accent hover:underline font-bold cursor-pointer"
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
          min={DEFAULT_MIN_NUM}
          max={DEFAULT_MAX_NUM}
          step={0.1}
          value={sliderRange}
          onChange={handleSliderChange}
          currencySymbol="ETH"
          className="mb-3"
        />

        {/* Linha com Preço formatado e Botão Aplicar */}
        <div className="flex items-center justify-between gap-3 mt-1">
          <div className="text-caption-12 text-text-secondary">
            Preço:{' '}
            <strong className="text-text-primary font-bold">
              {displayMinFormatted} - {displayMaxFormatted} ETH
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
