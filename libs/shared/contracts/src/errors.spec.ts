import { describe, it, expect } from 'vitest';
import { ApiError, ApiErrorCode, ApiErrorSchema } from './errors';

describe('ApiError and ApiErrorSchema (@nft/shared-contracts)', () => {
  it('parses valid ApiError payloads with ApiErrorSchema', () => {
    const raw = {
      code: ApiErrorCode.VALIDATION_ERROR,
      message: 'Invalid payload',
      retryable: false,
      fieldErrors: { email: 'Invalid email' },
    };

    const parsed = ApiErrorSchema.parse(raw);
    expect(parsed.code).toBe(ApiErrorCode.VALIDATION_ERROR);
    expect(parsed.message).toBe('Invalid payload');
    expect(parsed.retryable).toBe(false);
    expect(parsed.fieldErrors).toEqual({ email: 'Invalid email' });
  });

  it('instantiates ApiError with correct properties and prototype inheritance', () => {
    const err = new ApiError({
      code: ApiErrorCode.AVAILABILITY_CONFLICT,
      message: 'Edition sold out',
      retryable: false,
      details: { editionId: 'ed-123' },
    });

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.name).toBe('ApiError');
    expect(err.code).toBe(ApiErrorCode.AVAILABILITY_CONFLICT);
    expect(err.retryable).toBe(false);
    expect(err.details).toEqual({ editionId: 'ed-123' });
  });

  it('correctly reports retryable flag for transient vs non-transient errors', () => {
    const transientErr = new ApiError({
      code: ApiErrorCode.TRANSIENT,
      message: 'Temporary network glitch',
      retryable: true,
    });
    expect(transientErr.retryable).toBe(true);

    const validationErr = new ApiError({
      code: ApiErrorCode.VALIDATION_ERROR,
      message: 'Invalid input',
      retryable: false,
    });
    expect(validationErr.retryable).toBe(false);
  });
});
