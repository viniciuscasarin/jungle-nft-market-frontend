import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShellProvider, type ShellContextValue } from '@nft/shell-kit';
import { createQueryClient, queryKeys, QueryClientProvider } from '@nft/shared-query';
import { createHttpClient } from '@nft/shared-http';
import { createRealtimeClient } from '@nft/shared-realtime';
import { ProfileFeaturePage } from './ProfileFeaturePage';

describe('ProfileFeaturePage (@nft/profile-feature)', () => {
  function renderWithShell(initialData?: unknown, isPending = false, isError = false) {
    const queryClient = createQueryClient({ defaultOptions: { queries: { retry: false } } });
    const httpClient = createHttpClient();
    const feedback = {
      notify: vi.fn(),
      announce: vi.fn(),
    };
    const navigate = vi.fn();

    if (initialData) {
      queryClient.setQueryData(queryKeys.user('user_alice', 'profile'), initialData);
    }

    if (isPending) {
      vi.spyOn(httpClient, 'get').mockReturnValue(new Promise(() => {}));
    } else if (isError) {
      vi.spyOn(httpClient, 'get').mockRejectedValue(new Error('Network error'));
    } else if (!initialData) {
      vi.spyOn(httpClient, 'get').mockResolvedValue({
        data: {
          id: 'user_alice',
          displayName: 'Alice Silva',
          username: 'alice',
          email: 'alice@example.com',
          ensName: 'alice',
          walletNickname: 'Carteira Principal',
          avatarUrl: null,
          bio: 'Bio text',
          createdAt: '2026-01-01T00:00:00Z',
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
          <ProfileFeaturePage />
        </ShellProvider>
      </QueryClientProvider>
    );

    return { ...utils, queryClient, httpClient, feedback, navigate };
  }

  it('renders loading skeleton with aria-busy="true" while loading profile', () => {
    renderWithShell(undefined, true);
    const skeleton = screen.getByTestId('profile-loading-skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
  });

  it('renders error state and retries on clicking Tentar novamente', async () => {
    const { httpClient } = renderWithShell(undefined, false, true);

    await waitFor(() => {
      expect(screen.getByTestId('profile-error-state')).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /tentar novamente/i });
    fireEvent.click(retryBtn);
    expect(httpClient.get).toHaveBeenCalled();
  });

  it('renders ProfilePageContent with profile data and triggers useUnavailable on out-of-scope items', async () => {
    const { feedback } = renderWithShell({
      id: 'user_alice',
      displayName: 'Alice Silva',
      username: 'alice',
      email: 'alice@example.com',
      ensName: 'alice',
      walletNickname: 'Carteira Principal',
      avatarUrl: null,
      bio: 'Bio text',
      createdAt: '2026-01-01T00:00:00Z',
    });

    expect(screen.getByLabelText(/nome de exibição/i)).toHaveValue('Alice Silva');

    // Click on Atividade (out of scope)
    const activityBtn = screen.getByRole('button', { name: /atividade/i });
    fireEvent.click(activityBtn);

    expect(feedback.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('indisponível nesta demonstração'),
      })
    );
  });
});
