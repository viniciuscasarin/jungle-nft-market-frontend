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

  it('provides safe demonstration defaults when initialized with empty object', () => {
    const config = validateEnv({});

    expect(config.VITE_ENABLE_MOCKS).toBe(true);
    expect(config.VITE_DEFAULT_SCENARIO).toBe('default');
    expect(config.VITE_API_BASE_URL).toBe('/api');
    expect(config.VITE_SOCKET_URL).toBe('');
    expect(config.VITE_REMOTE_STOREFRONT_URL).toBe('/remotes/storefront/remoteEntry.js');
    expect(config.VITE_REMOTE_CHECKOUT_URL).toBe('/remotes/checkout/remoteEntry.js');
    expect(config.VITE_REMOTE_ACCOUNT_URL).toBe('/remotes/account/remoteEntry.js');
  });

  it('accepts valid relative paths for remote endpoints', () => {
    const config = validateEnv({
      VITE_REMOTE_STOREFRONT_URL: '/custom/storefront/remoteEntry.js',
      VITE_REMOTE_CHECKOUT_URL: './checkout/remoteEntry.js',
      VITE_REMOTE_ACCOUNT_URL: '/remotes/account/remoteEntry.js',
    });

    expect(config.VITE_REMOTE_STOREFRONT_URL).toBe('/custom/storefront/remoteEntry.js');
    expect(config.VITE_REMOTE_CHECKOUT_URL).toBe('./checkout/remoteEntry.js');
    expect(config.VITE_REMOTE_ACCOUNT_URL).toBe('/remotes/account/remoteEntry.js');
  });

  it('throws an explicit EnvValidationError when URL format is invalid', () => {
    expect(() =>
      validateEnv({
        ...validMockEnv,
        VITE_REMOTE_STOREFRONT_URL: 'not-a-valid-url',
      }),
    ).toThrow(EnvValidationError);

    try {
      validateEnv({
        ...validMockEnv,
        VITE_REMOTE_STOREFRONT_URL: 'not-a-valid-url',
      });
    } catch (err) {
      expect(err).toBeInstanceOf(EnvValidationError);
      const validationError = err as EnvValidationError;
      expect(validationError.missingOrInvalidKeys).toContain('VITE_REMOTE_STOREFRONT_URL');
      expect(validationError.message).toContain('VITE_REMOTE_STOREFRONT_URL');
    }
  });
});
