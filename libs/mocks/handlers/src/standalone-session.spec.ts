import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { createHttpClient } from '@nft/shared-http';
import { ApiError } from '@nft/shared-contracts';
import {
  resetMockDatabase,
  resetClock,
  authenticateStandaloneDevSession,
  DEFAULT_STANDALONE_DEV_CREDENTIALS,
} from '@nft/mocks-core';
import { authHandlers } from './auth';

const server = setupServer(...authHandlers);

describe('authenticateStandaloneDevSession Integration (@nft/mocks-handlers)', () => {
  const httpClient = createHttpClient('http://localhost');

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    resetMockDatabase();
    resetClock('2026-01-01T12:00:00.000Z');
    server.resetHandlers();
    delete process.env.VITE_ENABLE_MOCKS;
    vi.unstubAllEnvs();
  });

  it('authenticates deterministically using default fixture credentials (Alice)', async () => {
    const result = await authenticateStandaloneDevSession(httpClient);

    expect(result.isDevelopment).toBe(true);
    expect(result.token).toMatch(/^tok_/);
    expect(result.user.id).toBe('user_alice');
    expect(result.user.email).toBe(DEFAULT_STANDALONE_DEV_CREDENTIALS.identifier);
    expect(result.user.displayName).toBe('Alice Silva');
    expect(result.session.token).toBe(result.token);
  });

  it('authenticates with custom valid credentials from fixtures (Bob)', async () => {
    const result = await authenticateStandaloneDevSession(httpClient, {
      identifier: 'bob@example.com',
      password: 'Password123!',
    });

    expect(result.isDevelopment).toBe(true);
    expect(result.user.id).toBe('user_bob');
    expect(result.user.username).toBe('bob');
    expect(result.token).toMatch(/^tok_/);
  });

  it('rejects invalid password with 401 UNAUTHENTICATED via MSW handlers', async () => {
    await expect(
      authenticateStandaloneDevSession(httpClient, {
        identifier: 'alice@example.com',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(ApiError);

    try {
      await authenticateStandaloneDevSession(httpClient, {
        identifier: 'alice@example.com',
        password: 'WrongPassword!',
      });
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiError);
      const apiError = err as ApiError;
      expect(apiError.code).toBe('UNAUTHENTICATED');
      expect(apiError.retryable).toBe(false);
    }
  });

  it('rejects nonexistent user with 401 UNAUTHENTICATED via MSW handlers', async () => {
    try {
      await authenticateStandaloneDevSession(httpClient, {
        identifier: 'nonexistent@example.com',
        password: 'Password123!',
      });
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiError);
      const apiError = err as ApiError;
      expect(apiError.code).toBe('UNAUTHENTICATED');
    }
  });

  it('handles API unavailability (503 TRANSIENT) with retryable ApiError', async () => {
    server.use(
      http.post('*/api/auth/login', () => {
        return HttpResponse.json(
          { code: 'TRANSIENT', message: 'Serviço temporariamente indisponível.', retryable: true },
          { status: 503 },
        );
      }),
    );

    try {
      await authenticateStandaloneDevSession(httpClient);
      expect.unreachable('Should have thrown an error');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiError);
      const apiError = err as ApiError;
      expect(apiError.code).toBe('TRANSIENT');
      expect(apiError.retryable).toBe(true);
    }
  });

  it('refuses to authenticate automatically when mocks are disabled (VITE_ENABLE_MOCKS=false)', async () => {
    vi.stubEnv('VITE_ENABLE_MOCKS', 'false');

    await expect(authenticateStandaloneDevSession(httpClient)).rejects.toThrow(
      'Autenticação de desenvolvimento indisponível com mocks desabilitados. Utilize o Shell integrado para efetuar login.',
    );
  });

  it('refuses to authenticate automatically in production environment (NODE_ENV=production)', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    await expect(authenticateStandaloneDevSession(httpClient)).rejects.toThrow(
      'Autenticação automática de desenvolvimento é restrita ao ambiente de desenvolvimento.',
    );
  });
});
