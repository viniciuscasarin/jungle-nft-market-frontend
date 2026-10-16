import { describe, it, expect } from 'vitest';
import {
  SignUpInputSchema,
  SignInInputSchema,
  SessionSchema,
  UserSchema,
  WalletSchema,
  WalletAddressSchema,
  EnsNameSchema,
  ChangePasswordInputSchema,
} from './index';

describe('Auth, Session, Profile and Wallets Contracts (@nft/shared-contracts)', () => {
  describe('SignUpInputSchema', () => {
    it('accepts valid registration input', () => {
      const valid = {
        displayName: 'Alice Cooper',
        username: 'alice_01',
        email: 'alice@example.com',
        password: 'securePassword123',
      };
      const parsed = SignUpInputSchema.parse(valid);
      expect(parsed).toEqual(valid);
    });

    it('rejects passwords shorter than 8 characters', () => {
      const invalid = {
        displayName: 'Alice',
        username: 'alice',
        email: 'alice@example.com',
        password: 'sh1',
      };
      expect(() => SignUpInputSchema.parse(invalid)).toThrow(/no mínimo 8 caracteres/);
    });

    it('rejects passwords without any letters', () => {
      const invalid = {
        displayName: 'Alice',
        username: 'alice',
        email: 'alice@example.com',
        password: '1234567890',
      };
      expect(() => SignUpInputSchema.parse(invalid)).toThrow(/pelo menos uma letra/);
    });

    it('rejects passwords without any numbers', () => {
      const invalid = {
        displayName: 'Alice',
        username: 'alice',
        email: 'alice@example.com',
        password: 'passwordWithoutNumber',
      };
      expect(() => SignUpInputSchema.parse(invalid)).toThrow(/pelo menos um número/);
    });

    it('rejects invalid email formats', () => {
      const invalid = {
        displayName: 'Alice',
        username: 'alice',
        email: 'not-an-email',
        password: 'securePassword123',
      };
      expect(() => SignUpInputSchema.parse(invalid)).toThrow();
    });
  });

  describe('SignInInputSchema', () => {
    it('accepts valid sign in input', () => {
      const valid = {
        identifier: 'alice@example.com',
        password: 'myPassword123',
      };
      const parsed = SignInInputSchema.parse(valid);
      expect(parsed.identifier).toBe('alice@example.com');
    });

    it('rejects empty identifier or password', () => {
      expect(() => SignInInputSchema.parse({ identifier: '', password: '123' })).toThrow();
      expect(() => SignInInputSchema.parse({ identifier: 'alice', password: '' })).toThrow();
    });
  });

  describe('SessionSchema & UserSchema (Password Exposure Prevention)', () => {
    it('validates legitimate session payload with token, user and expiresAt', () => {
      const session = {
        token: 'jwt-token-12345',
        user: {
          id: 'usr-1',
          displayName: 'Alice Cooper',
          username: 'alice_cooper',
          email: 'alice@example.com',
          avatarUrl: 'https://example.com/avatar.png',
          bio: 'Digital art enthusiast',
          createdAt: '2026-01-01T00:00:00Z',
        },
        expiresAt: '2026-01-02T00:00:00Z',
      };
      const parsed = SessionSchema.parse(session);
      expect(parsed.token).toBe('jwt-token-12345');
      expect(parsed.user.id).toBe('usr-1');
    });

    it('guarantees UserSchema definition has no password or passwordHash keys', () => {
      const shape = UserSchema.shape;
      expect('password' in shape).toBe(false);
      expect('passwordHash' in shape).toBe(false);
      expect('credentials' in shape).toBe(false);
    });

    it('strips unknown credential fields if passed in backend payload', () => {
      const rawPayload = {
        id: 'usr-1',
        displayName: 'Alice',
        username: 'alice',
        email: 'alice@example.com',
        createdAt: '2026-01-01T00:00:00Z',
        password: 'leakedPasswordHash',
        passwordHash: 'argon2id$12345',
      };

      const parsed = UserSchema.parse(rawPayload);
      expect('password' in parsed).toBe(false);
      expect('passwordHash' in parsed).toBe(false);
    });
  });

  describe('Wallets & ENS Validation', () => {
    it('validates legitimate wallet object', () => {
      const wallet = {
        id: 'wal-1',
        address: '0x1234567890123456789012345678901234567890',
        network: 'ethereum-mainnet',
        ensName: 'vitalik',
        isPrimary: true,
      };
      const parsed = WalletSchema.parse(wallet);
      expect(parsed.address).toBe('0x1234567890123456789012345678901234567890');
      expect(parsed.ensName).toBe('vitalik');
    });

    it('rejects wallet address that does not match 42 hex characters (0x...)', () => {
      expect(() =>
        WalletAddressSchema.parse('0x123')
      ).toThrow();
      expect(() =>
        WalletAddressSchema.parse('1234567890123456789012345678901234567890')
      ).toThrow();
      expect(() =>
        WalletAddressSchema.parse('0xZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ')
      ).toThrow();
    });

    it('rejects ENS names containing .eth suffix', () => {
      expect(() => EnsNameSchema.parse('vitalik.eth')).toThrow(
        /Nome ENS não deve conter o sufixo \.eth/
      );
      expect(() => EnsNameSchema.parse('SATOSHI.ETH')).toThrow(
        /Nome ENS não deve conter o sufixo \.eth/
      );
    });

    it('accepts valid ENS name without .eth', () => {
      expect(EnsNameSchema.parse('vitalik')).toBe('vitalik');
    });
  });

  describe('ChangePasswordInputSchema', () => {
    it('accepts different new password', () => {
      const valid = {
        currentPassword: 'oldPassword123',
        newPassword: 'newSuperPassword123',
      };
      expect(ChangePasswordInputSchema.parse(valid)).toEqual(valid);
    });

    it('rejects when new password is the same as current password', () => {
      const invalid = {
        currentPassword: 'samePassword123',
        newPassword: 'samePassword123',
      };
      expect(() => ChangePasswordInputSchema.parse(invalid)).toThrow(
        /A nova senha deve ser diferente da senha atual/
      );
    });
  });
});
