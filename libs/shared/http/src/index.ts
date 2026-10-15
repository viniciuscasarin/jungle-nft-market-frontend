import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { ApiError } from '@nft/shared-contracts';

export type HttpClient = AxiosInstance;

export function createHttpClient(baseURL = ''): HttpClient {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
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
          message: error.message || 'Network request failed',
          retryable: true,
        }),
      );
    },
  );

  return client;
}

export type { AxiosRequestConfig };
