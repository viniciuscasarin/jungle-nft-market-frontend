import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { CatalogHomePage } from './catalog-home-page';

const mockNavigate = vi.fn();
let mockSearchState: Record<string, unknown> = {};

vi.mock('@nft/shared-router', () => ({
  useNavigate: () => mockNavigate,
  useSearch: () => mockSearchState,
}));

const mockNotify = vi.fn();
vi.mock('@nft/shell-kit', () => ({
  useShell: () => ({
    httpClient: {},
  }),
  usePageChrome: vi.fn(),
  useUnavailable: () => ({
    notifyUnavailable: mockNotify,
  }),
}));

const mockRefetch = vi.fn();
let mockQueryResult = {
  data: {
    items: [
      {
        id: 'nft-01',
        title: 'Alpha Primate',
        collectionName: 'Cyber Jungle',
        price: '1.50',
        imageUrl: '/assets/images/nft-03-emerald-ape.png',
      },
    ],
    total: 1,
    page: 1,
    pageSize: 9,
    totalPages: 1,
    facets: {
      collections: [{ id: 'col_cyber_jungle', label: 'Cyber Jungle', count: 1 }],
      networks: [{ id: 'ethereum', label: 'Ethereum', count: 1 }],
    },
  },
  isLoading: false,
  isError: false,
  error: null,
  refetch: mockRefetch,
};

vi.mock('@nft/catalog-data-access', () => ({
  useCatalogListQuery: () => mockQueryResult,
}));

describe('CatalogHomePage (@nft/catalog-feature)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchState = {};
    mockQueryResult = {
      data: {
        items: [
          {
            id: 'nft-01',
            title: 'Alpha Primate',
            collectionName: 'Cyber Jungle',
            price: '1.50',
            imageUrl: '/assets/images/nft-03-emerald-ape.png',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 9,
        totalPages: 1,
        facets: {
          collections: [{ id: 'col_cyber_jungle', label: 'Cyber Jungle', count: 1 }],
          networks: [{ id: 'ethereum', label: 'Ethereum', count: 1 }],
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    };
  });

  it('renders catalog items and navigates to details page on card click', () => {
    render(<CatalogHomePage />);

    expect(screen.getByText('Alpha Primate')).toBeDefined();

    const card = screen.getByTestId('catalog-item-nft-01');
    fireEvent.click(card);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/nft/$nftId',
      params: { nftId: 'nft-01' },
    });
  });

  it('updates URL search parameters when active tab changes', () => {
    render(<CatalogHomePage />);

    const tabTrending = screen.getByTestId('catalog-tab-trending');
    fireEvent.click(tabTrending);

    expect(mockNavigate).toHaveBeenCalledWith({
      search: expect.objectContaining({
        tab: 'trending',
        page: 1,
      }),
      replace: true,
    });
  });

  it('triggers notifyUnavailable on favorite toggle', () => {
    render(<CatalogHomePage />);

    const favBtn = screen.getByTestId('favorite-button-nft-01');
    fireEvent.click(favBtn);

    expect(mockNotify).toHaveBeenCalledWith('Favoritar NFT');
  });

  it('triggers notifyUnavailable on promo CTA click', () => {
    render(<CatalogHomePage />);

    const promoCard = screen.getByTestId('promo-card-promo-genesis');
    const button = promoCard.querySelector('button');
    expect(button).toBeDefined();
    fireEvent.click(button!);

    expect(mockNotify).toHaveBeenCalledWith('Lançamentos promocionais');
  });
});
