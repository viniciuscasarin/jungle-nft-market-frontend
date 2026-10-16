import { HttpResponse } from 'msw';
import {
  defineHandler,
  getMockDatabase,
  paginate,
  apiError,
} from '@nft/mocks-core';
import { mockCollections } from '@nft/mocks-fixtures';
import {
  type NftItem,
  type CatalogFacets,
  ApiErrorCode,
  parseCatalogSearchParams,
} from '@nft/shared-contracts';
import { parse, compare } from '@nft/shared-money';

export function computeBaseFacets(nfts: readonly NftItem[]): CatalogFacets {
  const collections = mockCollections.map((col) => ({
    id: col.id,
    label: col.name,
    count: nfts.filter((n) => n.category === col.id).length,
  }));

  const networks = [
    {
      id: 'ethereum' as const,
      label: 'Ethereum',
      count: nfts.filter((n) => n.network === 'ethereum').length,
    },
    {
      id: 'polygon' as const,
      label: 'Polygon',
      count: nfts.filter((n) => n.network === 'polygon').length,
    },
    {
      id: 'solana' as const,
      label: 'Solana',
      count: nfts.filter((n) => n.network === 'solana').length,
    },
  ];

  return { collections, networks };
}

export const catalogHandlers = [
  defineHandler('GET', '/nfts', ({ request }) => {
    const { nfts } = getMockDatabase();
    const url = new URL(request.url);
    const searchObj = Object.fromEntries(url.searchParams.entries());

    // Multi-value search params handling (collections, networks)
    const rawCollections = url.searchParams.getAll('collections');
    if (rawCollections.length > 0) {
      searchObj['collections'] = rawCollections.join(',');
    }
    const rawNetworks = url.searchParams.getAll('networks');
    if (rawNetworks.length > 0) {
      searchObj['networks'] = rawNetworks.join(',');
    }

    const query = parseCatalogSearchParams(searchObj);
    const searchTerm = (query.q ?? query.search ?? '').trim().toLowerCase();

    const filtered = nfts.filter((nft) => {
      // 1. Textual search (title, description, collectionName, tags)
      if (searchTerm) {
        const matchesTitle = nft.title.toLowerCase().includes(searchTerm);
        const matchesDesc = (nft.description ?? '').toLowerCase().includes(searchTerm);
        const matchesCol = (nft.collectionName ?? '').toLowerCase().includes(searchTerm);
        const matchesTag = nft.tags.some((t) => t.toLowerCase().includes(searchTerm));
        if (!matchesTitle && !matchesDesc && !matchesCol && !matchesTag) {
          return false;
        }
      }

      // 2. Collections filter
      if (query.collections && query.collections.length > 0) {
        const matchesCollection =
          query.collections.includes(nft.category ?? '') ||
          query.collections.some(
            (c) =>
              c.toLowerCase() === (nft.collectionName ?? '').toLowerCase() ||
              c.toLowerCase() === (nft.category ?? '').toLowerCase(),
          );
        if (!matchesCollection) {
          return false;
        }
      }

      // 3. Category single filter (if provided)
      if (query.category) {
        if (
          nft.category !== query.category &&
          (nft.collectionName ?? '').toLowerCase() !== query.category.toLowerCase()
        ) {
          return false;
        }
      }

      // 4. Networks filter
      if (query.networks && query.networks.length > 0) {
        if (!nft.network || !query.networks.includes(nft.network)) {
          return false;
        }
      }

      // 5. Price range (ETH decimal comparisons via @nft/shared-money)
      if (query.minPrice) {
        try {
          if (compare(parse(nft.price), parse(query.minPrice)) < 0) {
            return false;
          }
        } catch {
          // Ignore invalid price comparison
        }
      }

      if (query.maxPrice) {
        try {
          if (compare(parse(nft.price), parse(query.maxPrice)) > 0) {
            return false;
          }
        } catch {
          // Ignore invalid price comparison
        }
      }

      // 6. Tab filter ('all' | 'new' | 'trending')
      if (query.tab === 'new') {
        // New tab prioritizes newer creation or featured items
        return nft.featured || (nft.createdAt && nft.createdAt >= '2026-01-10');
      }

      if (query.tab === 'trending') {
        // Trending tab prioritizes highly rated or featured items
        return nft.featured || nft.rating.average >= 4.5 || nft.rating.count >= 15;
      }

      return true;
    });

    // Sort order
    filtered.sort((a, b) => {
      switch (query.sort) {
        case 'price-asc':
          return compare(parse(a.price), parse(b.price));
        case 'price-desc':
          return compare(parse(b.price), parse(a.price));
        case 'rating-desc':
          return b.rating.average - a.rating.average || b.rating.count - a.rating.count;
        case 'created-desc':
          return (
            new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
          );
        case 'popular-desc':
        default: {
          const scoreA = a.rating.average * a.rating.count + (a.featured ? 50 : 0);
          const scoreB = b.rating.average * b.rating.count + (b.featured ? 50 : 0);
          return scoreB - scoreA || a.id.localeCompare(b.id);
        }
      }
    });

    // Pagination
    const paginated = paginate(filtered, {
      page: query.page,
      pageSize: query.pageSize,
    });

    // Facets (calculated from the base scenario items)
    const facets = computeBaseFacets(nfts);

    return HttpResponse.json({
      ...paginated,
      facets,
    });
  }),

  defineHandler('GET', '/nfts/:id', ({ params }) => {
    const { nfts } = getMockDatabase();
    const nft = nfts.find((item) => item.id === params['id']);
    if (!nft) {
      return apiError(ApiErrorCode.NOT_FOUND, {
        message: 'NFT não encontrado.',
        status: 404,
      });
    }
    return HttpResponse.json(nft);
  }),

  defineHandler('GET', '/nfts/:id/reviews', ({ params, request }) => {
    const { reviews } = getMockDatabase();
    const nftId = params['id'] as string;
    const nftReviews = reviews.filter((r) => r.nftId === nftId);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;
    return HttpResponse.json(paginate(nftReviews, { page, pageSize }));
  }),
];
