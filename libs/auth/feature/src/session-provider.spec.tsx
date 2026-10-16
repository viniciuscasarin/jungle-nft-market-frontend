import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { createQueryClient } from '@nft/shared-query';
import { createHttpClient } from '@nft/shared-http';
import { createRealtimeClient } from '@nft/shared-realtime';
import {
  ShellProvider,
  useSession,
  type ShellContextValue,
} from '@nft/shell-kit';
import type { Session } from '@nft/shared-contracts';
import { SessionController } from './session-controller';
import { SessionProvider, useAuth } from './session-provider';

const mockSessionData: Session = {
  token: 'tok_provider_test',
  user: {
    id: 'user_provider_alice',
    displayName: 'Alice In Provider',
    username: 'alice_provider',
    email: 'alice@provider.test',
    avatarUrl: 'https://avatar.test/alice.png',
    bio: 'Testing provider',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  expiresAt: '2026-01-02T00:00:00.000Z',
};

function TestConsumer() {
  const auth = useAuth();
  const shellSession = useSession();

  return (
    <div>
      <span data-testid="auth-status">{auth.status}</span>
      <span data-testid="shell-user">{shellSession ? shellSession.name : 'anon'}</span>
      <span data-testid="shell-email">{shellSession ? shellSession.email : 'none'}</span>
    </div>
  );
}

describe('SessionProvider (@nft/auth-feature)', () => {
  it('throws an error if useAuth is called outside SessionProvider', () => {
    const Component = () => {
      useAuth();
      return null;
    };
    expect(() => render(<Component />)).toThrow('useAuth must be used within a SessionProvider');
  });

  it('synchronizes SessionController state with useSession in ShellContext', async () => {
    const queryClient = createQueryClient();
    const httpClient = createHttpClient();
    const realtimeClient = createRealtimeClient({ autoConnect: false });

    const controller = new SessionController({
      queryClient,
      realtimeClient,
    });

    const initialShellValue: ShellContextValue = {
      queryClient,
      httpClient,
      realtimeClient,
      session: null,
      navigate: vi.fn(),
    };

    render(
      <ShellProvider value={initialShellValue}>
        <SessionProvider controller={controller}>
          <TestConsumer />
        </SessionProvider>
      </ShellProvider>,
    );

    expect(screen.getByTestId('auth-status').textContent).toBe('loading');
    expect(screen.getByTestId('shell-user').textContent).toBe('anon');

    // Transition to authenticated
    await act(async () => {
      await controller.setSession(mockSessionData);
    });

    expect(screen.getByTestId('auth-status').textContent).toBe('authenticated');
    expect(screen.getByTestId('shell-user').textContent).toBe('Alice In Provider');
    expect(screen.getByTestId('shell-email').textContent).toBe('alice@provider.test');

    // Logout
    await act(async () => {
      await controller.logout();
    });

    expect(screen.getByTestId('auth-status').textContent).toBe('unauthenticated');
    expect(screen.getByTestId('shell-user').textContent).toBe('anon');
    expect(screen.getByTestId('shell-email').textContent).toBe('none');
  });
});
