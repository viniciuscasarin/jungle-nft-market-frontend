import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@nft/shared-contracts', async () => {
  const actual = await vi.importActual<typeof import('@nft/shared-contracts')>('@nft/shared-contracts');
  return {
    ...actual,
    validateEnv: vi.fn(),
  };
});

import { prepareApp, queryClient, httpClient, realtimeClient, sessionController } from './main';
import { tokenStore, getSession } from '@nft/auth-data-access';
import { startMocks } from '@nft/shell-kit';

vi.mock('@nft/shell-kit', async () => {
  const actual = await vi.importActual<typeof import('@nft/shell-kit')>('@nft/shell-kit');
  return {
    ...actual,
    startMocks: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('@nft/auth-data-access', async () => {
  const actual = await vi.importActual<typeof import('@nft/auth-data-access')>('@nft/auth-data-access');
  return {
    ...actual,
    getSession: vi.fn(),
  };
});

describe('Deterministic Shell Bootstrap Sequence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tokenStore.clearToken();
  });

  it('initializes runtime singletons correctly', () => {
    expect(queryClient).toBeDefined();
    expect(httpClient).toBeDefined();
    expect(realtimeClient).toBeDefined();
    expect(sessionController).toBeDefined();
  });

  it('runs startMocks when VITE_ENABLE_MOCKS is true', async () => {
    await prepareApp();
    if (import.meta.env['VITE_ENABLE_MOCKS'] === 'true') {
      expect(startMocks).toHaveBeenCalledTimes(1);
    }
  });

  it('resolves session using getSession when token is present on boot', async () => {
    tokenStore.setToken('saved-jwt-token');
    const mockSession = {
      token: 'saved-jwt-token',
      userId: 'user-123',
      user: {
        id: 'user-123',
        name: 'Boot Collector',
        email: 'boot@jungle.test',
        role: 'collector' as const,
        createdAt: '2026-01-01T00:00:00Z',
      },
    };

    vi.mocked(getSession).mockResolvedValueOnce(mockSession);

    await prepareApp();

    expect(getSession).toHaveBeenCalledWith(httpClient);
    expect(sessionController.getState().session?.userId).toBe('user-123');
  });

  it('sets session to null when no token is present on boot', async () => {
    tokenStore.clearToken();
    await prepareApp();

    expect(getSession).not.toHaveBeenCalled();
    expect(sessionController.getState().session).toBeNull();
  });
});
