import { describe, it, expect, vi } from 'vitest';
import axios, { type InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '@nft/shared-contracts';
import { createHttpClient } from './index';

const dummyConfig = { headers: new axios.AxiosHeaders() } as unknown as InternalAxiosRequestConfig;

describe('createHttpClient (@nft/shared-http)', () => {
  it('creates client with default baseURL', () => {
    const client = createHttpClient();
    expect(client.defaults.baseURL).toBe('');
  });

  it('creates client with custom baseURL string', () => {
    const client = createHttpClient('https://api.jungle.test');
    expect(client.defaults.baseURL).toBe('https://api.jungle.test');
  });

  it('creates client with config object baseURL', () => {
    const client = createHttpClient({ baseURL: 'https://api.jungle.test' });
    expect(client.defaults.baseURL).toBe('https://api.jungle.test');
  });

  describe('Request Interceptor (Auth & Guest Tokens)', () => {
    it('injects Authorization: Bearer <token> when getAuthToken returns a token', async () => {
      const getAuthToken = vi.fn().mockReturnValue('mock-jwt-token');
      const getGuestId = vi.fn().mockReturnValue('mock-guest-id');

      const client = createHttpClient({ getAuthToken, getGuestId });

      client.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
        return {
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      };

      const response = await client.get('/test');
      expect(response.config.headers.Authorization).toBe('Bearer mock-jwt-token');
      expect(response.config.headers['X-Session-Id']).toBeUndefined();
    });

    it('injects X-Session-Id: <guestId> when getAuthToken is null but getGuestId returns an id', async () => {
      const getAuthToken = vi.fn().mockReturnValue(null);
      const getGuestId = vi.fn().mockReturnValue('guest-uuid-1234');

      const client = createHttpClient({ getAuthToken, getGuestId });

      client.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
        return {
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      };

      const response = await client.get('/test');
      expect(response.config.headers.Authorization).toBeUndefined();
      expect(response.config.headers['X-Session-Id']).toBe('guest-uuid-1234');
    });

    it('does not inject Authorization or X-Session-Id when both callbacks return null', async () => {
      const getAuthToken = vi.fn().mockReturnValue(null);
      const getGuestId = vi.fn().mockReturnValue(null);

      const client = createHttpClient({ getAuthToken, getGuestId });

      client.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
        return {
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      };

      const response = await client.get('/test');
      expect(response.config.headers.Authorization).toBeUndefined();
      expect(response.config.headers['X-Session-Id']).toBeUndefined();
    });
  });

  describe('Response Interceptor (SESSION_EXPIRED & ApiError Mapping)', () => {
    it('triggers onSessionExpired callback on 401 with code SESSION_EXPIRED', async () => {
      const onSessionExpired = vi.fn();
      const client = createHttpClient({ onSessionExpired });

      client.defaults.adapter = async () => {
        const error = new axios.AxiosError(
          'Session Expired',
          '401',
          undefined,
          undefined,
          {
            status: 401,
            statusText: 'Unauthorized',
            data: {
              code: 'SESSION_EXPIRED',
              message: 'Your session has expired',
              retryable: false,
            },
            headers: {},
            config: dummyConfig,
          },
        );
        throw error;
      };

      await expect(client.get('/protected')).rejects.toThrow(ApiError);
      expect(onSessionExpired).toHaveBeenCalledTimes(1);
    });

    it('does not trigger onSessionExpired on 401 with other code (e.g. UNAUTHENTICATED)', async () => {
      const onSessionExpired = vi.fn();
      const client = createHttpClient({ onSessionExpired });

      client.defaults.adapter = async () => {
        const error = new axios.AxiosError(
          'Unauthenticated',
          '401',
          undefined,
          undefined,
          {
            status: 401,
            statusText: 'Unauthorized',
            data: {
              code: 'UNAUTHENTICATED',
              message: 'Invalid credentials',
              retryable: false,
            },
            headers: {},
            config: dummyConfig,
          },
        );
        throw error;
      };

      await expect(client.get('/auth/login')).rejects.toThrow(ApiError);
      expect(onSessionExpired).not.toHaveBeenCalled();
    });

    it('maps fieldErrors and retryable correctly from API error payload', async () => {
      const client = createHttpClient();

      client.defaults.adapter = async () => {
        const error = new axios.AxiosError(
          'Validation failed',
          '400',
          undefined,
          undefined,
          {
            status: 400,
            statusText: 'Bad Request',
            data: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid fields',
              retryable: false,
              fieldErrors: { email: 'Email already exists' },
            },
            headers: {},
            config: dummyConfig,
          },
        );
        throw error;
      };

      try {
        await client.post('/register', {});
        expect.unreachable('Should have thrown ApiError');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;
        expect(apiError.code).toBe('VALIDATION_ERROR');
        expect(apiError.fieldErrors).toEqual({ email: 'Email already exists' });
        expect(apiError.retryable).toBe(false);
      }
    });

    it('converts network errors to ApiError with NETWORK_ERROR code and retryable true', async () => {
      const client = createHttpClient();

      client.defaults.adapter = async () => {
        throw new Error('Network disconnected');
      };

      try {
        await client.get('/status');
        expect.unreachable('Should have thrown ApiError');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;
        expect(apiError.code).toBe('NETWORK_ERROR');
        expect(apiError.retryable).toBe(true);
      }
    });
  });
});
