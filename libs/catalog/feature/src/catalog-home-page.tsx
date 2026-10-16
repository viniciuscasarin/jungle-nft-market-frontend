import * as React from 'react';
import { useNavigate, useSearch } from '@nft/shared-router';
import { useShell, usePageChrome, useUnavailable } from '@nft/shell-kit';
import {
  type CatalogSearchParams,
  type NftNetwork,
  type NftTab,
} from '@nft/shared-contracts';
import {
  normalizeCatalogSearchParams,
  applyCatalogFilterChange,
} from '@nft/catalog-domain';
import { useCatalogListQuery } from '@nft/catalog-data-access';
import { HomePageContent } from '@nft/catalog-ui';

export function CatalogHomePage() {
  const { httpClient } = useShell();
  const rawSearch = useSearch({ strict: false });
  const navigate = useNavigate();
  const { notifyUnavailable } = useUnavailable();

  const searchParams = React.useMemo(
    () => normalizeCatalogSearchParams(rawSearch),
    [rawSearch],
  );

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = React.useState(false);

  // Integra o gatilho de filtros do header/searchbar do shell ao Drawer
  usePageChrome({
    onOpenFilters: React.useCallback(() => {
      setIsFilterDrawerOpen(true);
    }, []),
  });

  const { data, isLoading, isError, error, refetch } = useCatalogListQuery(
    httpClient,
    searchParams,
  );

  const scrollToCatalog = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    const el = document.getElementById('catalogo') || document.getElementById('busca');
    if (el) {
      const prefersReducedMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    }
  }, []);

  React.useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      (window.location.hash === '#catalogo' || window.location.hash === '#busca')
    ) {
      const timer = setTimeout(() => {
        scrollToCatalog();
      }, 50);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [scrollToCatalog]);

  const updateFilters = React.useCallback(
    (changes: Partial<CatalogSearchParams>) => {
      const next = applyCatalogFilterChange(searchParams, changes);
      void navigate({
        search: next,
        hash: 'catalogo',
        replace: true,
      } as never);
      scrollToCatalog();
    },
    [navigate, searchParams, scrollToCatalog],
  );

  const handleClearFilters = React.useCallback(() => {
    void navigate({
      search: {
        page: 1,
        pageSize: 9,
        tab: 'all',
        sort: 'popular-desc',
      },
      hash: 'catalogo',
      replace: true,
    } as never);
    scrollToCatalog();
  }, [navigate, scrollToCatalog]);

  const handleToggleCollection = React.useCallback(
    (colId: string) => {
      const current = searchParams.collections ?? [];
      const updated = current.includes(colId)
        ? current.filter((id) => id !== colId)
        : [...current, colId];
      updateFilters({ collections: updated.length > 0 ? updated : undefined });
    },
    [searchParams.collections, updateFilters],
  );

  const handleToggleNetwork = React.useCallback(
    (netId: string) => {
      const current = searchParams.networks ?? [];
      const updated = current.includes(netId as NftNetwork)
        ? current.filter((id) => id !== netId)
        : [...current, netId as NftNetwork];
      updateFilters({ networks: updated.length > 0 ? updated : undefined });
    },
    [searchParams.networks, updateFilters],
  );

  const [pendingMinPrice, setPendingMinPrice] = React.useState<string | undefined>(
    searchParams.minPrice,
  );
  const [pendingMaxPrice, setPendingMaxPrice] = React.useState<string | undefined>(
    searchParams.maxPrice,
  );

  React.useEffect(() => {
    setPendingMinPrice(searchParams.minPrice);
    setPendingMaxPrice(searchParams.maxPrice);
  }, [searchParams.minPrice, searchParams.maxPrice]);

  const handlePriceRangeChange = React.useCallback(
    (min?: string, max?: string) => {
      setPendingMinPrice(min);
      setPendingMaxPrice(max);
    },
    [],
  );

  const handleApplyPriceRange = React.useCallback(() => {
    updateFilters({
      minPrice: pendingMinPrice,
      maxPrice: pendingMaxPrice,
    });
  }, [pendingMinPrice, pendingMaxPrice, updateFilters]);

  const handleTabChange = React.useCallback(
    (tab: NftTab) => {
      updateFilters({ tab });
    },
    [updateFilters],
  );

  const handleSortChange = React.useCallback(
    (sort: string) => {
      updateFilters({ sort: sort as CatalogSearchParams['sort'] });
    },
    [updateFilters],
  );

  const handlePageChange = React.useCallback(
    (page: number) => {
      updateFilters({ page });
    },
    [updateFilters],
  );

  const handleSelectNft = React.useCallback(
    (nftId: string) => {
      navigate({
        to: '/nft/$nftId',
        params: { nftId },
      });
    },
    [navigate],
  );

  const handleFavoriteToggle = React.useCallback(
    () => {
      notifyUnavailable('Favoritar NFT');
    },
    [notifyUnavailable],
  );

  const handleUnavailable = React.useCallback(
    (featureName: string) => {
      notifyUnavailable(featureName);
    },
    [notifyUnavailable],
  );

  return (
    <HomePageContent
      items={data?.items ?? []}
      isLoading={isLoading}
      isError={isError}
      error={error as Error | null}
      onRetry={() => void refetch()}
      facets={data?.facets}
      activeTab={searchParams.tab}
      onTabChange={handleTabChange}
      sortBy={searchParams.sort}
      onSortChange={handleSortChange}
      selectedCollections={searchParams.collections}
      onToggleCollection={handleToggleCollection}
      selectedNetworks={searchParams.networks}
      onToggleNetwork={handleToggleNetwork}
      minPrice={pendingMinPrice}
      maxPrice={pendingMaxPrice}
      onPriceRangeChange={handlePriceRangeChange}
      onApplyPriceRange={handleApplyPriceRange}
      onClearFilters={handleClearFilters}
      currentPage={data?.page ?? searchParams.page ?? 1}
      totalPages={data?.totalPages ?? 1}
      onPageChange={handlePageChange}
      onSelectNft={handleSelectNft}
      onFavoriteToggle={handleFavoriteToggle}
      onUnavailable={handleUnavailable}
      isFilterDrawerOpen={isFilterDrawerOpen}
      onOpenFilterDrawerChange={setIsFilterDrawerOpen}
    />
  );
}
