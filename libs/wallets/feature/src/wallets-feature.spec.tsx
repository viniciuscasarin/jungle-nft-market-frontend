import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShellProvider, type ShellContextValue } from '@nft/shell-kit';
import { createQueryClient, queryKeys, QueryClientProvider } from '@nft/shared-query';
import { createHttpClient } from '@nft/shared-http';
import { createRealtimeClient } from '@nft/shared-realtime';
import { WalletsFeaturePage } from './WalletsFeaturePage';

describe('WalletsFeaturePage (@nft/wallets-feature)', () => {
  function renderWithShell(initialData?: unknown, isPending = false, isError = false) {
    const queryClient = createQueryClient({ defaultOptions: { queries: { retry: false } } });
    const httpClient = createHttpClient();
    const feedback = {
      notify: vi.fn(),
      announce: vi.fn(),
    };
    const navigate = vi.fn();

    if (initialData) {
      queryClient.setQueryData(queryKeys.user('user_alice', 'wallets'), initialData);
    }

    if (isPending) {
      vi.spyOn(httpClient, 'get').mockReturnValue(new Promise(() => {}));
    } else if (isError) {
      vi.spyOn(httpClient, 'get').mockRejectedValue(new Error('Network error'));
    } else if (!initialData) {
      vi.spyOn(httpClient, 'get').mockResolvedValue({
        data: {
          primary: {
            id: 'wal-1',
            address: '0x1111111111111111111111111111111111111111',
            network: 'ethereum-mainnet',
            walletType: 'metamask',
            ensName: 'alice',
            label: 'Main Vault',
            displayName: 'Minha MetaMask',
            isPrimary: true,
          },
          secondary: null,
        },
      } as never);
    }

    const contextValue: ShellContextValue = {
      queryClient,
      httpClient,
      realtimeClient: createRealtimeClient({ autoConnect: false }),
      session: {
        userId: 'user_alice',
        name: 'Alice Silva',
        email: 'alice@example.com',
      },
      navigate,
      feedback,
    };

    const utils = render(
      <QueryClientProvider client={queryClient}>
        <ShellProvider value={contextValue}>
          <WalletsFeaturePage />
        </ShellProvider>
      </QueryClientProvider>
    );

    return { ...utils, queryClient, httpClient, feedback, navigate };
  }

  it('renders loading skeleton with aria-busy="true" while loading wallets', () => {
    renderWithShell(undefined, true);
    const skeleton = screen.getByTestId('wallets-loading-skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
  });

  it('renders error state and retries on clicking Tentar novamente', async () => {
    const { httpClient } = renderWithShell(undefined, false, true);

    await waitFor(() => {
      expect(screen.getByTestId('wallets-error-state')).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /tentar novamente/i });
    fireEvent.click(retryBtn);
    expect(httpClient.get).toHaveBeenCalled();
  });

  it('renders WalletsPageContent and triggers useUnavailable on out-of-scope items', () => {
    const { feedback } = renderWithShell({
      primary: {
        id: 'wal-1',
        address: '0x1111111111111111111111111111111111111111',
        network: 'ethereum-mainnet',
        walletType: 'metamask',
        ensName: 'alice',
        label: 'Main Vault',
        displayName: 'Minha MetaMask',
        isPrimary: true,
      },
      secondary: null,
    });

    expect(screen.getByLabelText(/nome de exibição/i)).toHaveValue('Minha MetaMask');

    // Click on Suporte (out of scope)
    const supportBtn = screen.getByRole('button', { name: /suporte/i });
    fireEvent.click(supportBtn);

    expect(feedback.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('indisponível nesta demonstração'),
      })
    );
  });
});
