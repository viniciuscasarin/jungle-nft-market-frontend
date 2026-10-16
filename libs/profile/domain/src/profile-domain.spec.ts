import { describe, it, expect } from 'vitest';
import {
  ProfileFormSchema,
  PasswordFormSchema,
  profileToFormData,
  formDataToUpdateInput,
} from './index';

describe('Profile Domain (@nft/profile-domain)', () => {
  describe('ProfileFormSchema', () => {
    it('accepts valid profile form data', () => {
      const valid = {
        displayName: 'Alice Silva',
        username: 'alice_01',
        email: 'alice@example.com',
        ensName: 'alice',
        ensDomain: '.eth' as const,
        walletNickname: 'Carteira Principal',
        bio: 'Collector of fine NFTs',
      };
      const parsed = ProfileFormSchema.parse(valid);
      expect(parsed).toEqual(valid);
    });

    it('rejects ENS names with .eth or .xyz suffix', () => {
      expect(() =>
        ProfileFormSchema.parse({
          displayName: 'Alice',
          username: 'alice',
          email: 'alice@example.com',
          ensName: 'alice.eth',
          ensDomain: '.eth',
          walletNickname: 'Main',
        })
      ).toThrow(/não deve conter extensão/);

      expect(() =>
        ProfileFormSchema.parse({
          displayName: 'Alice',
          username: 'alice',
          email: 'alice@example.com',
          ensName: 'alice.xyz',
          ensDomain: '.xyz',
          walletNickname: 'Main',
        })
      ).toThrow(/não deve conter extensão/);
    });

    it('rejects invalid email and invalid username', () => {
      expect(() =>
        ProfileFormSchema.parse({
          displayName: 'Alice',
          username: 'al!',
          email: 'invalid-email',
          ensName: 'alice',
          ensDomain: '.eth',
          walletNickname: 'Main',
        })
      ).toThrow();
    });
  });

  describe('PasswordFormSchema', () => {
    it('accepts valid password change payload', () => {
      const valid = {
        currentPassword: 'OldPassword123!',
        newPassword: 'BrandNewPassword123!',
        confirmPassword: 'BrandNewPassword123!',
      };
      expect(PasswordFormSchema.parse(valid)).toEqual(valid);
    });

    it('rejects when new password equals current password', () => {
      expect(() =>
        PasswordFormSchema.parse({
          currentPassword: 'SamePassword123!',
          newPassword: 'SamePassword123!',
          confirmPassword: 'SamePassword123!',
        })
      ).toThrow(/A nova senha deve ser diferente da senha atual/);
    });

    it('rejects when confirmPassword differs from newPassword', () => {
      expect(() =>
        PasswordFormSchema.parse({
          currentPassword: 'OldPassword123!',
          newPassword: 'NewPassword123!',
          confirmPassword: 'DifferentPassword123!',
        })
      ).toThrow(/A confirmação de senha não confere/);
    });

    it('rejects new password without letter or number or shorter than 8', () => {
      expect(() =>
        PasswordFormSchema.parse({
          currentPassword: 'OldPassword123!',
          newPassword: '12345',
          confirmPassword: '12345',
        })
      ).toThrow(/no mínimo 8 caracteres/);
    });
  });

  describe('Conversion utilities', () => {
    it('converts profile to form data and form data to update input', () => {
      const formData = profileToFormData({
        displayName: 'Bob Santos',
        username: 'bob',
        email: 'bob@example.com',
      });
      expect(formData.displayName).toBe('Bob Santos');
      expect(formData.walletNickname).toBe('Carteira Principal');

      const updateInput = formDataToUpdateInput(formData);
      expect(updateInput.displayName).toBe('Bob Santos');
      expect(updateInput.username).toBe('bob');
      expect(updateInput.email).toBe('bob@example.com');
    });
  });
});
