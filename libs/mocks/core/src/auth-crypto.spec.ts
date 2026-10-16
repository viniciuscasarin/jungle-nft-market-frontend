import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  generateSaltHex,
  demoCredentials,
} from './auth-crypto';

describe('Auth Crypto & Demo Credentials', () => {
  it('generates random hex salt with correct length', () => {
    const salt16 = generateSaltHex(16);
    expect(salt16).toHaveLength(32);
    expect(salt16).toMatch(/^[0-9a-f]{32}$/);

    const salt8 = generateSaltHex(8);
    expect(salt8).toHaveLength(16);
  });

  it('hashes and successfully verifies a password with matching salt', async () => {
    const password = 'SuperSecretPassword!';
    const { passwordHash, passwordSalt } = await hashPassword(password);

    expect(passwordHash).toMatch(/^[0-9a-f]{64}$/);
    expect(passwordSalt).toMatch(/^[0-9a-f]{32}$/);

    const isValid = await verifyPassword(password, passwordHash, passwordSalt);
    expect(isValid).toBe(true);

    const isWrongValid = await verifyPassword('WrongPassword!', passwordHash, passwordSalt);
    expect(isWrongValid).toBe(false);
  });

  it('verifies demo credentials for Alice against precomputed hash and salt', async () => {
    const alice = demoCredentials.alice;
    const isValid = await verifyPassword(
      alice.plaintextPassword,
      alice.passwordHash,
      alice.passwordSalt
    );
    expect(isValid).toBe(true);

    const isInvalid = await verifyPassword(
      'IncorrectPassword',
      alice.passwordHash,
      alice.passwordSalt
    );
    expect(isInvalid).toBe(false);
  });

  it('verifies demo credentials for Bob against precomputed hash and salt', async () => {
    const bob = demoCredentials.bob;
    const isValid = await verifyPassword(
      bob.plaintextPassword,
      bob.passwordHash,
      bob.passwordSalt
    );
    expect(isValid).toBe(true);

    const isInvalid = await verifyPassword(
      'IncorrectPassword',
      bob.passwordHash,
      bob.passwordSalt
    );
    expect(isInvalid).toBe(false);
  });
});
