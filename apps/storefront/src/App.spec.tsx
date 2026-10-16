import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  ShellProvider,
  type ShellContextValue,
  ShellPageChromeProvider,
  singletonProbe,
  singletonRegistry,
} from '@nft/shell-kit';
import { createQueryClient, QueryClientProvider } from '@nft/shared-query';
import { createHttpClient } from '@nft/shared-http';
import { createRealtimeClient } from '@nft/shared-realtime';
import App, { App as NamedApp } from './App';
import { HomePage } from './HomePage';

let mockSearch: Record<string, unknown> = {};
const mockNavigate = vi.fn();

vi.mock('@nft/shared-router', () => ({
  useSearch: () => mockSearch,
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

const mockCatalogItems = [
  {
    id: 'nft-1',
    title: 'Cyber Panther #01',
    imageUrl: '/assets/images/nft-01.png',
    creator: { id: 'creator-1', name: 'ApeLab', verified: true },
    price: '2.50',
    rating: { average: 4.8, count: 12 },
    editions: [],
  },
  {
    id: 'nft-2',
    title: 'Neon Ape #42',
    imageUrl: '/assets/images/nft-02.png',
    creator: { id: 'creator-2', name: 'JungleDAO', verified: false },
    price: '1.25',
    rating: { average: 4.5, count: 8 },
    editions: [],
  },
];

const mockCatalogResponse = {
  items: mockCatalogItems,
  total: 2,
  page: 1,
  pageSize: 12,
  totalPages: 1,
  facets: {
    collections: [],
    networks: [],
  },
};

const server = setupServer(
  http.get('*/api/nfts', () => {
    return HttpResponse.json(mockCatalogResponse);
  }),
);

describe('Storefront Standalone Remote (apps/storefront)', () => {
  let queryClient: ReturnType<typeof createQueryClient>;
  let httpClient: ReturnType<typeof createHttpClient>;
  let realtimeClient: ReturnType<typeof createRealtimeClient>;

  beforeAll(() => {
    window.fetch = globalThis.fetch;
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    mockSearch = {};
    mockNavigate.mockReset();
    singletonProbe.reset();
    singletonRegistry.reset();
    queryClient = createQueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    httpClient = createHttpClient({ baseURL: 'http://localhost:4200' });
    realtimeClient = createRealtimeClient({ autoConnect: false });
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(() => {
    server.resetHandlers();
    queryClient.clear();
    vi.restoreAllMocks();
  });

  function renderStorefront(initialContext?: Partial<ShellContextValue>) {
    singletonProbe.increment('apps/storefront');
    singletonRegistry.register('queryClient', queryClient);
    singletonRegistry.register('httpClient', httpClient);
    singletonRegistry.register('realtimeClient', realtimeClient);

    const contextValue: ShellContextValue = {
      queryClient,
      httpClient,
      realtimeClient,
      session: null,
      navigate: () => {},
      ...initialContext,
    };

    return render(
      <QueryClientProvider client={queryClient}>
        <ShellProvider value={contextValue}>
          <ShellPageChromeProvider>
            <App />
          </ShellPageChromeProvider>
        </ShellProvider>
      </QueryClientProvider>,
    );
  }

  it('exposes HomePage component as App', () => {
    expect(App).toBe(HomePage);
    expect(NamedApp).toBe(HomePage);
  });

  it('preserves singletons and records instance tracking on mount', () => {
    renderStorefront();

    expect(singletonProbe.getCount()).toBeGreaterThanOrEqual(1);
    expect(singletonProbe.getEvents().some((e) => e.caller === 'apps/storefront')).toBe(true);
    expect(singletonRegistry.get('queryClient')).toBe(queryClient);
    expect(singletonRegistry.get('httpClient')).toBe(httpClient);
    expect(singletonRegistry.get('realtimeClient')).toBe(realtimeClient);
  });

  it('renders catalog items with prices and title in visitor mode', async () => {
    renderStorefront({ session: null });

    expect(await screen.findByText('Cyber Panther #01')).toBeInTheDocument();
    expect(screen.getByText('Neon Ape #42')).toBeInTheDocument();

    const price1 = screen.getByTestId('catalog-price-nft-1');
    const price2 = screen.getByTestId('catalog-price-nft-2');
    expect(price1).toHaveTextContent(/2[,.]50/);
    expect(price2).toHaveTextContent(/1[,.]25/);
  });

  it('renders empty state when search returns zero results', async () => {
    server.use(
      http.get('*/api/nfts', () => {
        return HttpResponse.json({
          items: [],
          total: 0,
          page: 1,
          pageSize: 12,
          totalPages: 0,
          facets: { collections: [], networks: [] },
        });
      }),
    );

    renderStorefront();

    expect(await screen.findByText(/Nenhum NFT encontrado/i)).toBeInTheDocument();
  });

  it('renders error state and recovers on retry when API fails', async () => {
    let callCount = 0;
    server.use(
      http.get('*/api/nfts', () => {
        callCount += 1;
        if (callCount === 1) {
          return HttpResponse.json(
            { code: 'INTERNAL_ERROR', message: 'Falha temporária ao listar catálogo', retryable: false },
            { status: 500 },
          );
        }
        return HttpResponse.json(mockCatalogResponse);
      }),
    );

    renderStorefront();

    expect(await screen.findByText(/Não foi possível carregar o catálogo/i)).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /Tentar novamente/i });
    expect(retryButton).toBeInTheDocument();
    fireEvent.click(retryButton);

    expect(await screen.findByText('Cyber Panther #01')).toBeInTheDocument();
    expect(screen.getByText('Neon Ape #42')).toBeInTheDocument();
  });
});
