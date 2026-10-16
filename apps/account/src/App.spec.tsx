import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  ShellProvider,
  type ShellContextValue,
  ShellPageChromeProvider,
  singletonProbe,
  singletonRegistry,
  StandaloneSessionExpired,
} from '@nft/shell-kit';
import {
  createQueryClient,
  QueryClientProvider,
  queryKeys,
  clearPrivateCache,
} from '@nft/shared-query';
import { createHttpClient } from '@nft/shared-http';
import { createRealtimeClient } from '@nft/shared-realtime';
import App, { App as NamedApp } from './App';
import { ProfilePage } from './ProfilePage';
import { WalletsPage } from './WalletsPage';

const mockNavigate = vi.fn();

vi.mock('@nft/shared-router', () => ({
  useNavigate: () => mockNavigate,
  useSearch: () => ({}),
  ROUTES: {
    HOME: '/',
    PROFILE: '/perfil',
    WALLETS: '/carteiras',
  },
}));

const mockProfile = {
  id: 'user_alice',
  displayName: 'Alice Silva',
  username: 'alice',
  email: 'alice@example.com',
  ensName: 'alice',
  walletNickname: 'Vault Principal',
  avatarUrl: null,
  bio: 'Colecionadora de NFTs na Jungle.',
  createdAt: '2026-01-01T00:00:00Z',
};

const mockWallets = {
  primary: {
    id: 'wal-1',
    address: '0x1111111111111111111111111111111111111111',
    network: 'ethereum-mainnet',
    walletType: 'metamask',
    ensName: 'alice',
    label: 'Primary Vault',
    displayName: 'Minha MetaMask',
    isPrimary: true,
  },
  secondary: null,
};

let currentProfile = { ...mockProfile };
let currentWallets = { ...mockWallets };

const BASE_URL = 'http://localhost:4203';

const server = setupServer(
  http.get(`${BASE_URL}/api/profile`, () => {
    return HttpResponse.json(currentProfile);
  }),
  http.put(`${BASE_URL}/api/profile`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    currentProfile = { ...currentProfile, ...body };
    return HttpResponse.json(currentProfile);
  }),
  http.get(`${BASE_URL}/api/wallets`, () => {
    return HttpResponse.json(currentWallets);
  }),
  http.put(`${BASE_URL}/api/wallets`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    if (currentWallets.primary) {
      currentWallets.primary = { ...currentWallets.primary, ...body };
    }
    return HttpResponse.json(currentWallets.primary);
  }),
);

describe('Account Standalone Remote (apps/account)', () => {
  let queryClient: ReturnType<typeof createQueryClient>;
  let httpClient: ReturnType<typeof createHttpClient>;
  let realtimeClient: ReturnType<typeof createRealtimeClient>;
  const mockFeedback = {
    notify: vi.fn(),
    announce: vi.fn(),
  };

  beforeAll(() => {
    window.fetch = globalThis.fetch;
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    currentProfile = { ...mockProfile };
    currentWallets = { ...mockWallets };
    singletonProbe.reset();
    singletonRegistry.reset();
    queryClient = createQueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    httpClient = createHttpClient({ baseURL: 'http://localhost:4203' });
    realtimeClient = createRealtimeClient({ autoConnect: false });
    mockNavigate.mockReset();
    mockFeedback.notify.mockReset();
    mockFeedback.announce.mockReset();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(() => {
    server.resetHandlers();
    queryClient.clear();
    vi.restoreAllMocks();
  });

  function renderWithShell(
    ui: React.ReactNode,
    sessionOverride?: ShellContextValue['session'],
  ) {
    singletonProbe.increment('apps/account');
    singletonRegistry.register('queryClient', queryClient);
    singletonRegistry.register('httpClient', httpClient);
    singletonRegistry.register('realtimeClient', realtimeClient);

    const contextValue: ShellContextValue = {
      queryClient,
      httpClient,
      realtimeClient,
      session:
        sessionOverride !== undefined
          ? sessionOverride
          : {
              userId: 'user_alice',
              name: 'Alice Silva',
              email: 'alice@example.com',
            },
      navigate: mockNavigate,
      feedback: mockFeedback,
    };

    return render(
      <QueryClientProvider client={queryClient}>
        <ShellProvider value={contextValue}>
          <ShellPageChromeProvider>{ui}</ShellPageChromeProvider>
        </ShellProvider>
      </QueryClientProvider>,
    );
  }

  it('exposes ProfilePage component as App', () => {
    expect(App).toBe(ProfilePage);
    expect(NamedApp).toBe(ProfilePage);
  });

  it('preserves singletons on mount in apps/account', () => {
    renderWithShell(<App />);

    expect(singletonProbe.getCount()).toBeGreaterThanOrEqual(1);
    expect(singletonProbe.getEvents().some((e) => e.caller === 'apps/account')).toBe(true);
    expect(singletonRegistry.get('queryClient')).toBe(queryClient);
    expect(singletonRegistry.get('httpClient')).toBe(httpClient);
  });

  it('renders ProfilePage and loads authenticated profile data via MSW', async () => {
    renderWithShell(<ProfilePage />);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Perfil do colecionador' }),
    ).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/nome de exibição/i);
    expect(nameInput).toHaveValue('Alice Silva');
    expect(screen.getByLabelText(/nome de usuário/i)).toHaveValue('alice');
  });

  it('performs profile mutation successfully via MSW PUT /api/profile', async () => {
    renderWithShell(<ProfilePage />);

    const nameInput = await screen.findByLabelText(/nome de exibição/i);
    fireEvent.change(nameInput, { target: { value: 'Alice Jungle Pro' } });

    const saveButton = screen.getByRole('button', { name: /^salvar$/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(currentProfile.displayName).toBe('Alice Jungle Pro');
    });
  });

  it('renders WalletsPage and displays primary wallet information via MSW', async () => {
    renderWithShell(<WalletsPage />);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Carteira principal' }),
    ).toBeInTheDocument();

    const addressInput = screen.getByLabelText(/endereço da carteira/i);
    expect(addressInput).toHaveValue('0x1111111111111111111111111111111111111111');
    expect(screen.getByLabelText(/nome de exibição/i)).toHaveValue('Minha MetaMask');
  });

  it('triggers local navigation between /perfil and /carteiras', async () => {
    renderWithShell(<ProfilePage />);

    await screen.findByRole('heading', { level: 1, name: 'Perfil do colecionador' });

    const walletsNavBtn = screen.getByRole('button', { name: /^carteiras$/i });
    expect(walletsNavBtn).toBeInTheDocument();
    fireEvent.click(walletsNavBtn);

    expect(mockNavigate).toHaveBeenCalledWith({ href: '/carteiras' });
  });

  it('handles session expiration, clears private cache and renders recovery UI', async () => {
    let onReconnectCalled = false;
    const { rerender } = renderWithShell(<ProfilePage />);

    await screen.findByRole('heading', { level: 1, name: 'Perfil do colecionador' });
    expect(queryClient.getQueryData(queryKeys.user('user_alice', 'profile'))).toBeDefined();

    // Trigger session expired cleanup
    clearPrivateCache(queryClient, 'user_alice');
    void queryClient.cancelQueries();
    realtimeClient.setAuthToken(null, null);

    // Private cache must be wiped
    expect(queryClient.getQueryData(queryKeys.user('user_alice', 'profile'))).toBeUndefined();

    // Render StandaloneSessionExpired alert
    rerender(
      <StandaloneSessionExpired
        shellOrigin="http://localhost:4200"
        onReconnect={() => {
          onReconnectCalled = true;
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Sessão Expirada' })).toBeInTheDocument();
    const reconnectBtn = screen.getByRole('button', { name: /Reconectar Sessão Dev/i });
    expect(reconnectBtn).toBeInTheDocument();

    fireEvent.click(reconnectBtn);
    expect(onReconnectCalled).toBe(true);
  });
});
