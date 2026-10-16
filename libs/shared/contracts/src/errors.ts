import { z } from 'zod';

export const ApiErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  AVAILABILITY_CONFLICT: 'AVAILABILITY_CONFLICT',
  PRICE_CHANGED: 'PRICE_CHANGED',
  IDEMPOTENCY_CONFLICT: 'IDEMPOTENCY_CONFLICT',
  TRANSIENT: 'TRANSIENT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode] | (string & {});

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  retryable: z.boolean(),
  fieldErrors: z.record(z.string(), z.string()).optional(),
  details: z.unknown().optional(),
});

export type ApiErrorPayload = z.infer<typeof ApiErrorSchema>;

export class ApiError extends Error {
  readonly code: string;
  readonly retryable: boolean;
  readonly fieldErrors?: Record<string, string> | undefined;
  readonly details?: unknown;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiError';
    this.code = payload.code;
    this.retryable = payload.retryable;
    if (payload.fieldErrors !== undefined) {
      this.fieldErrors = payload.fieldErrors;
    }
    if (payload.details !== undefined) {
      this.details = payload.details;
    }
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
