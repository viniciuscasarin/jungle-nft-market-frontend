import { z } from 'zod';

export const EthAmountSchema = z.string().regex(/^\d+(\.\d+)?$/, 'Invalid ETH decimal amount');

export interface ApiErrorPayload {
  code: string;
  message: string;
  retryable: boolean;
  fieldErrors?: Record<string, string> | undefined;
}

export class ApiError extends Error {
  readonly code: string;
  readonly retryable: boolean;
  readonly fieldErrors?: Record<string, string> | undefined;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiError';
    this.code = payload.code;
    this.retryable = payload.retryable;
    if (payload.fieldErrors !== undefined) {
      this.fieldErrors = payload.fieldErrors;
    }
  }
}

export * from './env';
