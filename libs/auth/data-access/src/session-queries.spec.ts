import { describe, it, expect } from 'vitest';
import { createHttpClient } from '@nft/shared-http';
import type { Session } from '@nft/shared-contracts';
import {
  getSession,
  sessionQueryOptions,
  login,
  register,
  logout,
} from './session-queries';

const testSession: Session = {
  token: 'jwt-test-token-12345',
  user: {
    id: 'user_alice',
    displayName: 'Alice Silva',
    username: 'alice',
    email: 'alice@example.com',
    avatarUrl: null,
    bio: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  expiresAt: '2026-01-02T00:00:00.000Z',
};

describe('Session Queries and Mutations (@nft/auth-data-access)', () => {
  it('sessionQueryOptions produces correct queryKey and staleTime', () => {
    const client = createHttpClient();
    const options = sessionQueryOptions(client);

    expect(options.queryKey).toEqual(['session']);
    expect(options.staleTime).toBe(30000);
    expect(options.retry).toBe(false);
  });

  it('getSession fetches and validates session payload', async () => {
    const client = createHttpClient();
    client.defaults.adapter = async (config) => {
      expect(config.url).toBe('/api/auth/session');
      expect(config.method).toBe('get');
      return {
        data: testSession,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    };

    const result = await getSession(client);
    expect(result.token).toBe(testSession.token);
    expect(result.user.id).toBe(testSession.user.id);
  });

  it('login posts credentials and returns validated session', async () => {
    const client = createHttpClient();
    const credentials = {
      identifier: 'alice@example.com',
      password: 'Password123!',
    };

    client.defaults.adapter = async (config) => {
      expect(config.url).toBe('/api/auth/login');
      expect(config.method).toBe('post');
      return {
        data: testSession,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    };

    const result = await login(client, credentials);
    expect(result.token).toBe(testSession.token);
  });

  it('register posts valid registration data and returns session', async () => {
    const client = createHttpClient();
    const input = {
      displayName: 'Alice Cooper',
      username: 'alice_cooper',
      email: 'alice@example.com',
      password: 'SecurePassword123!',
    };

    client.defaults.adapter = async (config) => {
      expect(config.url).toBe('/api/auth/signup');
      expect(config.method).toBe('post');
      return {
        data: testSession,
        status: 201,
        statusText: 'Created',
        headers: {},
        config,
      };
    };

    const result = await register(client, input);
    expect(result.token).toBe(testSession.token);
  });

  it('logout posts to /api/auth/logout and returns success', async () => {
    const client = createHttpClient();
    client.defaults.adapter = async (config) => {
      expect(config.url).toBe('/api/auth/logout');
      expect(config.method).toBe('post');
      return {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    };

    const result = await logout(client);
    expect(result.success).toBe(true);
  });
});
