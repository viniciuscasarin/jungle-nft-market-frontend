import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { ApiError } from '@nft/shared-contracts';

export type HttpClient = AxiosInstance;

export interface HttpClientConfig {
  baseURL?: string;
  getAuthToken?: () => string | null | undefined;
  getGuestId?: () => string | null | undefined;
  onSessionExpired?: () => void;
}

export function createHttpClient(config?: string | HttpClientConfig): HttpClient {
  const options: HttpClientConfig = typeof config === 'string' ? { baseURL: config } : (config ?? {});
  const { baseURL = '', getAuthToken, getGuestId, onSessionExpired } = options;

  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use(requestConfig => {
    const token = getAuthToken?.();
    if (token) {
      if (typeof requestConfig.headers?.set === 'function') {
        requestConfig.headers.set('Authorization', `Bearer ${token}`);
      } else {
        requestConfig.headers = requestConfig.headers || {};
        requestConfig.headers['Authorization'] = `Bearer ${token}`;
      }
    } else {
      const guestId = getGuestId?.();
      if (guestId) {
        if (typeof requestConfig.headers?.set === 'function') {
          requestConfig.headers.set('X-Session-Id', guestId);
        } else {
          requestConfig.headers = requestConfig.headers || {};
          requestConfig.headers['X-Session-Id'] = guestId;
        }
      }
    }
    return requestConfig;
  });

  client.interceptors.response.use(
    response => response,
    error => {
      if (axios.isAxiosError(error) && error.response?.data) {
        const data = error.response.data as {
          code?: string;
          message?: string;
          retryable?: boolean;
          fieldErrors?: Record<string, string>;
        };

        if (error.response.status === 401 && data.code === 'SESSION_EXPIRED') {
          onSessionExpired?.();
        }

        return Promise.reject(
          new ApiError({
            code: data.code || 'UNKNOWN_ERROR',
            message: data.message || error.message,
            retryable: Boolean(data.retryable ?? (error.response.status >= 500)),
            fieldErrors: data.fieldErrors,
          }),
        );
      }
      return Promise.reject(
        new ApiError({
          code: 'NETWORK_ERROR',
          message: error?.message || 'Network request failed',
          retryable: true,
        }),
      );
    },
  );

  return client;
}

export type { AxiosRequestConfig };
