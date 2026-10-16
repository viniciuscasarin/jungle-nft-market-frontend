import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import {
  resetMockDatabase,
  getMockDatabase,
  resetClock,
  verifyPassword,
} from '@nft/mocks-core';
import { authHandlers } from './auth';
import { profileHandlers } from './profile';
import { walletsHandlers } from './wallets';

const server = setupServer(...authHandlers, ...profileHandlers, ...walletsHandlers);

describe('Profile and Wallets Handlers Integration (@nft/mocks-handlers)', () => {
  let aliceToken: string;
  let bobToken: string;

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(async () => {
    resetMockDatabase();
    resetClock('2026-01-01T12:00:00.000Z');
    server.resetHandlers();

    // Authenticate Alice
    const aliceRes = await fetch('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'alice@example.com',
        password: 'Password123!',
      }),
    });
    const aliceData = await aliceRes.json();
    aliceToken = aliceData.token;

    // Authenticate Bob
    const bobRes = await fetch('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'bob@example.com',
        password: 'Password123!',
      }),
    });
    const bobData = await bobRes.json();
    bobToken = bobData.token;
  });

  describe('Profile Handlers (/api/profile)', () => {
    it('GET /api/profile returns authenticated user profile with isolation', async () => {
      const aliceProfileRes = await fetch('http://localhost/api/profile', {
        headers: { Authorization: `Bearer ${aliceToken}` },
      });
      expect(aliceProfileRes.status).toBe(200);
      const aliceProfile = await aliceProfileRes.json();
      expect(aliceProfile.id).toBe('user_alice');
      expect(aliceProfile.email).toBe('alice@example.com');

      const bobProfileRes = await fetch('http://localhost/api/profile', {
        headers: { Authorization: `Bearer ${bobToken}` },
      });
      expect(bobProfileRes.status).toBe(200);
      const bobProfile = await bobProfileRes.json();
      expect(bobProfile.id).toBe('user_bob');
      expect(bobProfile.email).toBe('bob@example.com');
    });

    it('PUT/PATCH /api/profile updates profile and syncs user session', async () => {
      const updateRes = await fetch('http://localhost/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aliceToken}`,
        },
        body: JSON.stringify({
          displayName: 'Alice In Wonderland',
          ensName: 'alicewonder',
          walletNickname: 'Main Ledger',
          bio: 'Curating decentralized art.',
        }),
      });

      expect(updateRes.status).toBe(200);
      const updated = await updateRes.json();
      expect(updated.displayName).toBe('Alice In Wonderland');
      expect(updated.ensName).toBe('alicewonder');
      expect(updated.walletNickname).toBe('Main Ledger');

      // Verify db persistence
      const db = getMockDatabase();
      const profileInDb = db.profiles.find((p) => p.id === 'user_alice');
      expect(profileInDb?.displayName).toBe('Alice In Wonderland');
      expect(profileInDb?.ensName).toBe('alicewonder');

      // Verify session user was also updated
      const session = db.sessions.find((s) => s.token === aliceToken);
      expect(session?.user.displayName).toBe('Alice In Wonderland');
    });

    it('rejects update when email or username conflicts with another user (409 CONFLICT)', async () => {
      // Alice tries to use Bob's email
      const conflictRes = await fetch('http://localhost/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aliceToken}`,
        },
        body: JSON.stringify({
          email: 'bob@example.com',
        }),
      });

      expect(conflictRes.status).toBe(409);
      const data = await conflictRes.json();
      expect(data.code).toBe('CONFLICT');
      expect(data.fieldErrors.email).toBeDefined();

      // Alice tries to use Bob's username
      const conflictUserRes = await fetch('http://localhost/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aliceToken}`,
        },
        body: JSON.stringify({
          username: 'bob',
        }),
      });

      expect(conflictUserRes.status).toBe(409);
      const userConflictData = await conflictUserRes.json();
      expect(userConflictData.code).toBe('CONFLICT');
      expect(userConflictData.fieldErrors.username).toBeDefined();
    });

    it('POST /api/profile/avatar and DELETE /api/profile/avatar updates and removes avatar', async () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

      const uploadRes = await fetch('http://localhost/api/profile/avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aliceToken}`,
        },
        body: JSON.stringify({ avatarUrl: dataUrl }),
      });

      expect(uploadRes.status).toBe(200);
      const uploaded = await uploadRes.json();
      expect(uploaded.avatarUrl).toBe(dataUrl);

      // Verify db persistence
      const db = getMockDatabase();
      expect(db.profiles.find((p) => p.id === 'user_alice')?.avatarUrl).toBe(dataUrl);

      // Remove avatar
      const deleteRes = await fetch('http://localhost/api/profile/avatar', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${aliceToken}` },
      });

      expect(deleteRes.status).toBe(200);
      const removed = await deleteRes.json();
      expect(removed.avatarUrl).toBeNull();
      expect(db.profiles.find((p) => p.id === 'user_alice')?.avatarUrl).toBeNull();
    });

    it('POST /api/profile/password verifies PBKDF2 hash, rejects bad current password and updates password', async () => {
      // Wrong current password
      const wrongRes = await fetch('http://localhost/api/profile/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aliceToken}`,
        },
        body: JSON.stringify({
          currentPassword: 'IncorrectPassword!',
          newPassword: 'BrandNewPassword123!',
        }),
      });

      expect(wrongRes.status).toBe(400);
      const wrongData = await wrongRes.json();
      expect(wrongData.code).toBe('VALIDATION_ERROR');
      expect(wrongData.fieldErrors.currentPassword).toBeDefined();

      // Correct current password
      const successRes = await fetch('http://localhost/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aliceToken}`,
        },
        body: JSON.stringify({
          currentPassword: 'Password123!',
          newPassword: 'BrandNewPassword123!',
          confirmPassword: 'BrandNewPassword123!',
        }),
      });

      expect(successRes.status).toBe(200);
      expect((await successRes.json()).success).toBe(true);

      // Verify Alice can log in with new password and fails with old
      const db = getMockDatabase();
      const aliceStored = db.users.find((u) => u.id === 'user_alice')!;
      expect(
        await verifyPassword('BrandNewPassword123!', aliceStored.passwordHash, aliceStored.passwordSalt)
      ).toBe(true);

      const oldLoginRes = await fetch('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'alice@example.com',
          password: 'Password123!',
        }),
      });
      expect(oldLoginRes.status).toBe(401);

      const newLoginRes = await fetch('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'alice@example.com',
          password: 'BrandNewPassword123!',
        }),
      });
      expect(newLoginRes.status).toBe(200);
    });
  });

  describe('Wallets Handlers (/api/wallets)', () => {
    it('GET /api/wallets returns primary and secondary wallets for authenticated user', async () => {
      const aliceWalletsRes = await fetch('http://localhost/api/wallets', {
        headers: { Authorization: `Bearer ${aliceToken}` },
      });
      expect(aliceWalletsRes.status).toBe(200);
      const aliceWallets = await aliceWalletsRes.json();
      expect(aliceWallets.primary.address).toBe('0x1111111111111111111111111111111111111111');
      expect(aliceWallets.primary.isPrimary).toBe(true);
      expect(aliceWallets.secondary.address).toBe('0x2222222222222222222222222222222222222222');
      expect(aliceWallets.secondary.isPrimary).toBe(false);

      // Verify Bob's isolation
      const bobWalletsRes = await fetch('http://localhost/api/wallets', {
        headers: { Authorization: `Bearer ${bobToken}` },
      });
      expect(bobWalletsRes.status).toBe(200);
      const bobWallets = await bobWalletsRes.json();
      expect(bobWallets.primary.address).toBe('0x3333333333333333333333333333333333333333');
      expect(bobWallets.primary.userId).toBe('user_bob');
    });

    it('POST/PUT /api/wallets updates primary wallet and respects 0x+40 hex validation', async () => {
      // Invalid address
      const invalidRes = await fetch('http://localhost/api/wallets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aliceToken}`,
        },
        body: JSON.stringify({
          address: 'invalid-address',
          network: 'ethereum-mainnet',
          isPrimary: true,
        }),
      });
      expect(invalidRes.status).toBe(422);

      // Valid update
      const validRes = await fetch('http://localhost/api/wallets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aliceToken}`,
        },
        body: JSON.stringify({
          address: '0x9999999999999999999999999999999999999999',
          network: 'polygon',
          walletType: 'coinbase',
          ensName: 'alicevault',
          label: 'Updated Alice Vault',
          displayName: 'Alice Vault',
          email: 'alice.vault@example.com',
          referralCode: 'REFALICE',
          notes: 'Hardware wallet',
          isPrimary: true,
        }),
      });

      expect(validRes.status).toBe(200);
      const updated = await validRes.json();
      expect(updated.address).toBe('0x9999999999999999999999999999999999999999');
      expect(updated.walletType).toBe('coinbase');
      expect(updated.label).toBe('Updated Alice Vault');

      // Verify GET returns the updated primary wallet
      const getRes = await fetch('http://localhost/api/wallets', {
        headers: { Authorization: `Bearer ${aliceToken}` },
      });
      const data = await getRes.json();
      expect(data.primary.address).toBe('0x9999999999999999999999999999999999999999');
      expect(data.primary.network).toBe('polygon');
    });

    it('PUT /api/wallets/:role allows updating secondary wallet specifically', async () => {
      const res = await fetch('http://localhost/api/wallets/secondary', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aliceToken}`,
        },
        body: JSON.stringify({
          address: '0x8888888888888888888888888888888888888888',
          network: 'arbitrum',
          walletType: 'walletconnect',
          isPrimary: false,
        }),
      });

      expect(res.status).toBe(200);
      const updated = await res.json();
      expect(updated.address).toBe('0x8888888888888888888888888888888888888888');
      expect(updated.isPrimary).toBe(false);

      const getRes = await fetch('http://localhost/api/wallets', {
        headers: { Authorization: `Bearer ${aliceToken}` },
      });
      const data = await getRes.json();
      expect(data.secondary.address).toBe('0x8888888888888888888888888888888888888888');
    });
  });
});
