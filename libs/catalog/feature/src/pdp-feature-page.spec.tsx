import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PdpFeaturePage } from './pdp-feature-page';
import { createQueryClient, QueryClientProvider } from '@nft/shared-query';

function renderPdp() {
  const client = createQueryClient();
  return render(
    <QueryClientProvider client={client}>
      <PdpFeaturePage />
    </QueryClientProvider>,
  );
}

const mockNavigate = vi.fn();
vi.mock('@nft/shared-router', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ nftId: 'nft-01' }),
}));

const mockNotify = vi.fn();
const mockUsePageChrome = vi.fn();
vi.mock('@nft/shell-kit', () => ({
  useShell: () => ({ httpClient: {} }),
  usePageChrome: (options: unknown) => mockUsePageChrome(options),
  useUnavailable: () => ({ notifyUnavailable: mockNotify }),
}));

const mockRefetch = vi.fn();
let detailResult: Record<string, unknown> = {};
vi.mock('@nft/catalog-data-access', () => ({
  useCatalogDetailQuery: () => detailResult,
  useCatalogListQuery: () => ({
    data: {
      items: [
        { id: 'nft-01', title: 'Alpha Primate', price: '1.50', imageUrl: '/a.png' },
        { id: 'nft-02', title: 'Beta Primate', price: '2.00', imageUrl: '/b.png' },
      ],
    },
  }),
}));

const nft = {
  id: 'nft-01',
  title: 'Alpha Primate',
  description: 'Descricao do NFT',
  imageUrl: '/a.png',
  creator: { id: 'c1', name: 'Kurio', verified: true },
  collectionName: 'Cyber Jungle',
  tags: ['raro'],
  price: '1.50',
  rating: { average: 4.5, count: 3 },
  editions: [
    { id: 'e1', editionNumber: 1, maxSupply: 10, availableSupply: 3, price: '1.50', version: 1 },
  ],
};

describe('PdpFeaturePage (@nft/catalog-feature)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    detailResult = {
      data: nft,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    };
  });

  it('renders NFT details from the API and sets the shell breadcrumb', () => {
    renderPdp();
    expect(screen.getByTestId('pdp-product-title').textContent).toBe('Alpha Primate');
    expect(screen.getByTestId('pdp-price-eth').textContent).toBe('1,5000 ETH');
    expect(mockUsePageChrome).toHaveBeenCalledWith({ breadcrumbLabel: 'Alpha Primate' });
  });

  it('lists related items excluding the current NFT and navigates on select', () => {
    renderPdp();
    expect(screen.queryByTestId('pdp-related-item-nft-01')).toBeNull();
    fireEvent.click(screen.getByTestId('pdp-related-item-nft-02'));
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/nft/$nftId', params: { nftId: 'nft-02' } });
  });

  it('shows an aria-busy skeleton while loading', () => {
    detailResult = {
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: mockRefetch,
    };
    renderPdp();
    expect(screen.getByTestId('pdp-loading').getAttribute('aria-busy')).toBe('true');
  });

  it('shows not-found state with a way back to the catalog', () => {
    detailResult = {
      data: undefined,
      isLoading: false,
      isError: true,
      error: { code: 'NOT_FOUND' },
      refetch: mockRefetch,
    };
    renderPdp();
    expect(screen.getByTestId('pdp-not-found')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /voltar ao catálogo/i }));
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
  });

  it('shows error state and retries the query', () => {
    detailResult = {
      data: undefined,
      isLoading: false,
      isError: true,
      error: { code: 'INTERNAL' },
      refetch: mockRefetch,
    };
    renderPdp();
    fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});
