import { describe, it, expect } from 'vitest';
import { validateEnv, EnvValidationError } from './env';

describe('validateEnv module', () => {
  const validMockEnv = {
    VITE_ENABLE_MOCKS: 'true',
    VITE_DEFAULT_SCENARIO: 'default',
    VITE_API_BASE_URL: 'http://localhost:4200/api',
    VITE_SOCKET_URL: 'ws://localhost:4200',
    VITE_REMOTE_STOREFRONT_URL: 'http://localhost:4201',
    VITE_REMOTE_CHECKOUT_URL: 'http://localhost:4202',
    VITE_REMOTE_ACCOUNT_URL: 'http://localhost:4203',
  };

  it('validates and returns parsed configuration when all required variables are present', () => {
    const config = validateEnv(validMockEnv);

    expect(config.VITE_ENABLE_MOCKS).toBe(true);
    expect(config.VITE_DEFAULT_SCENARIO).toBe('default');
    expect(config.VITE_API_BASE_URL).toBe('http://localhost:4200/api');
    expect(config.VITE_SOCKET_URL).toBe('ws://localhost:4200');
    expect(config.VITE_REMOTE_STOREFRONT_URL).toBe('http://localhost:4201');
    expect(config.VITE_REMOTE_CHECKOUT_URL).toBe('http://localhost:4202');
    expect(config.VITE_REMOTE_ACCOUNT_URL).toBe('http://localhost:4203');
  });

  it('transforms string "false" or "0" to boolean false for VITE_ENABLE_MOCKS', () => {
    const configFalse = validateEnv({ ...validMockEnv, VITE_ENABLE_MOCKS: 'false' });
    expect(configFalse.VITE_ENABLE_MOCKS).toBe(false);

    const configZero = validateEnv({ ...validMockEnv, VITE_ENABLE_MOCKS: '0' });
    expect(configZero.VITE_ENABLE_MOCKS).toBe(false);
  });

  it('throws an explicit EnvValidationError when mandatory variables are missing', () => {
    expect(() => validateEnv({})).toThrow(EnvValidationError);

    try {
      validateEnv({});
    } catch (err) {
      expect(err).toBeInstanceOf(EnvValidationError);
      const validationError = err as EnvValidationError;
      expect(validationError.missingOrInvalidKeys).toContain('VITE_API_BASE_URL');
      expect(validationError.missingOrInvalidKeys).toContain('VITE_SOCKET_URL');
      expect(validationError.missingOrInvalidKeys).toContain('VITE_REMOTE_STOREFRONT_URL');
      expect(validationError.message).toContain('VITE_API_BASE_URL é obrigatória');
      expect(validationError.message).toContain('.env.example');
    }
  });

  it('throws an explicit EnvValidationError when URL format is invalid', () => {
    expect(() =>
      validateEnv({
        ...validMockEnv,
        VITE_REMOTE_STOREFRONT_URL: 'not-a-valid-url',
      }),
    ).toThrow(EnvValidationError);
  });
});
