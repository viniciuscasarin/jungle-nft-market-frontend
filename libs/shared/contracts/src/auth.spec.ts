import { describe, it, expect } from 'vitest';
import {
  SignUpInputSchema,
  SignInInputSchema,
  SessionSchema,
  UserSchema,
  ProfileSchema,
  UpdateProfileInputSchema,
  UploadAvatarInputSchema,
  WalletSchema,
  CreateWalletInputSchema,
  WalletTypeSchema,
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

  describe('ProfileSchema, UpdateProfileInputSchema & UploadAvatarInputSchema', () => {
    it('accepts profile with ensName and walletNickname', () => {
      const parsed = ProfileSchema.parse({
        id: 'usr-1',
        displayName: 'Alice Silva',
        username: 'alice',
        email: 'alice@example.com',
        ensName: 'alice',
        walletNickname: 'Carteira Principal',
        avatarUrl: null,
        bio: null,
        createdAt: '2026-01-01T00:00:00Z',
      });
      expect(parsed.ensName).toBe('alice');
      expect(parsed.walletNickname).toBe('Carteira Principal');
    });

    it('validates UpdateProfileInputSchema with username, email, ensName and walletNickname', () => {
      const parsed = UpdateProfileInputSchema.parse({
        displayName: 'Alice Updated',
        username: 'alice_new',
        email: 'alice.new@example.com',
        ensName: 'alicenew',
        walletNickname: 'Hot Wallet',
      });
      expect(parsed.username).toBe('alice_new');
      expect(parsed.email).toBe('alice.new@example.com');
    });

    it('validates UploadAvatarInputSchema with URL and Data URL', () => {
      expect(
        UploadAvatarInputSchema.parse({ avatarUrl: 'https://example.com/avatar.png' })
      ).toEqual({ avatarUrl: 'https://example.com/avatar.png' });
      expect(
        UploadAvatarInputSchema.parse({
          avatarUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        }).avatarUrl
      ).toContain('data:image/png;base64');
    });
  });

  describe('Wallets & ENS Validation', () => {
    it('validates legitimate wallet object and extended wallet fields', () => {
      const wallet = {
        id: 'wal-1',
        address: '0x1234567890123456789012345678901234567890',
        network: 'ethereum-mainnet',
        walletType: 'metamask',
        ensName: 'vitalik',
        label: 'MetaMask Hot Wallet',
        displayName: 'Minha MetaMask',
        email: 'vitalik@example.com',
        referralCode: 'JUNGLE2026',
        notes: 'Backup vault',
        isPrimary: true,
      };
      const parsed = WalletSchema.parse(wallet);
      expect(parsed.address).toBe('0x1234567890123456789012345678901234567890');
      expect(parsed.ensName).toBe('vitalik');
      expect(parsed.walletType).toBe('metamask');
      expect(parsed.displayName).toBe('Minha MetaMask');
    });

    it('validates CreateWalletInputSchema and WalletTypeSchema', () => {
      expect(WalletTypeSchema.parse('coinbase')).toBe('coinbase');
      const created = CreateWalletInputSchema.parse({
        address: '0x1234567890123456789012345678901234567890',
        network: 'polygon',
        walletType: 'walletconnect',
        label: 'Polygon Vault',
        displayName: 'Polygon Principal',
        email: 'collector@example.com',
        referralCode: 'REF01',
        notes: 'Secondary',
        isPrimary: false,
      });
      expect(created.walletType).toBe('walletconnect');
      expect(created.label).toBe('Polygon Vault');
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

    it('rejects when confirmPassword is provided and does not match newPassword', () => {
      expect(() =>
        ChangePasswordInputSchema.parse({
          currentPassword: 'oldPassword123',
          newPassword: 'newSuperPassword123',
          confirmPassword: 'differentPassword123',
        })
      ).toThrow(/A confirmação de senha não confere/);
    });
  });
});

