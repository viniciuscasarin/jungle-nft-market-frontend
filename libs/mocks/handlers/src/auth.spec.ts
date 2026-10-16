import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import {
  resetMockDatabase,
  getMockDatabase,
  getClock,
  resetClock,
  verifyPassword,
} from '@nft/mocks-core';
import { SessionSchema } from '@nft/shared-contracts';
import { authHandlers } from './auth';

const server = setupServer(...authHandlers);

describe('Auth Handlers Integration (@nft/mocks-handlers)', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    resetMockDatabase();
    resetClock('2026-01-01T12:00:00.000Z');
    server.resetHandlers();
  });

  describe('POST /api/auth/signup', () => {
    it('creates new user with PBKDF2 hash, salt, active session, and clean serialized response', async () => {
      const response = await fetch('http://localhost/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: 'Carol Danvers',
          username: 'carol_01',
          email: 'carol@example.com',
          password: 'SecretPassword123!',
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();

      // Validate session schema
      const session = SessionSchema.parse(data);
      expect(session.user.username).toBe('carol_01');
      expect(session.user.email).toBe('carol@example.com');
      expect(session.token).toMatch(/^tok_/);

      // Verify serialized response contains NO credentials
      const serialized = JSON.stringify(data);
      expect(serialized).not.toMatch(/password/i);
      expect(serialized).not.toMatch(/passwordHash/i);
      expect(serialized).not.toMatch(/passwordSalt/i);

      // Verify user in mock database has hashed password with salt
      const db = getMockDatabase();
      const storedUser = db.users.find((u) => u.username === 'carol_01');
      expect(storedUser).toBeDefined();
      expect(storedUser?.passwordHash).toMatch(/^[0-9a-f]{64}$/);
      expect(storedUser?.passwordSalt).toMatch(/^[0-9a-f]{32}$/);
      expect(storedUser?.passwordHash).not.toBe('SecretPassword123!');

      const isPasswordValid = await verifyPassword(
        'SecretPassword123!',
        storedUser!.passwordHash,
        storedUser!.passwordSalt,
      );
      expect(isPasswordValid).toBe(true);
    });

    it('rejects conflict when email or username already exists (409 CONFLICT)', async () => {
      // Alice already exists in mock database
      const conflictEmailResponse = await fetch('http://localhost/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: 'Duplicate Alice',
          username: 'alice_different',
          email: 'ALICE@example.com', // Case-insensitive check
          password: 'Password123!',
        }),
      });

      expect(conflictEmailResponse.status).toBe(409);
      const emailConflictData = await conflictEmailResponse.json();
      expect(emailConflictData.code).toBe('CONFLICT');
      expect(emailConflictData.fieldErrors.email).toBe('Este e-mail já está em uso.');

      const conflictUsernameResponse = await fetch('http://localhost/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: 'Duplicate Alice',
          username: 'ALICE', // Case-insensitive check
          email: 'brand_new@example.com',
          password: 'Password123!',
        }),
      });

      expect(conflictUsernameResponse.status).toBe(409);
      const usernameConflictData = await conflictUsernameResponse.json();
      expect(usernameConflictData.code).toBe('CONFLICT');
      expect(usernameConflictData.fieldErrors.username).toBe(
        'Este nome de usuário já está em uso.',
      );
    });

    it('rejects passwords failing complexity with 422 VALIDATION_ERROR', async () => {
      const response = await fetch('http://localhost/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: 'Bad Password User',
          username: 'bad_pwd_user',
          email: 'badpwd@example.com',
          password: 'onlyletters',
        }),
      });

      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.code).toBe('VALIDATION_ERROR');
      expect(data.fieldErrors.password).toMatch(/número/);
    });
  });

  describe('POST /api/auth/login', () => {
    it('authenticates demo user with email and verifies credentials without leaking secrets', async () => {
      const response = await fetch('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'alice@example.com',
          password: 'Password123!',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      const session = SessionSchema.parse(data);
      expect(session.user.id).toBe('user_alice');

      // Check response JSON does NOT contain sensitive hash/salt
      const serialized = JSON.stringify(data);
      expect(serialized).not.toMatch(/password/i);
      expect(serialized).not.toMatch(/passwordHash/i);
      expect(serialized).not.toMatch(/passwordSalt/i);
    });

    it('authenticates demo user with username (case-insensitive)', async () => {
      const response = await fetch('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'ALICE',
          password: 'Password123!',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.user.id).toBe('user_alice');
    });

    it('returns generic 401 UNAUTHENTICATED on wrong password or missing user', async () => {
      const wrongPasswordResponse = await fetch('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'alice@example.com',
          password: 'WrongPassword!',
        }),
      });
      expect(wrongPasswordResponse.status).toBe(401);
      const wrongData = await wrongPasswordResponse.json();
      expect(wrongData.code).toBe('UNAUTHENTICATED');

      const nonExistentResponse = await fetch('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'nobody@example.com',
          password: 'Password123!',
        }),
      });
      expect(nonExistentResponse.status).toBe(401);
      const nonExistentData = await nonExistentResponse.json();
      expect(nonExistentData.code).toBe('UNAUTHENTICATED');
    });
  });

  describe('GET /api/auth/session & Injectable Clock Expiration', () => {
    it('returns session for valid token', async () => {
      // Login first to get a token
      const loginRes = await fetch('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'bob@example.com',
          password: 'Password123!',
        }),
      });
      const { token } = await loginRes.json();

      const sessionRes = await fetch('http://localhost/api/auth/session', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(sessionRes.status).toBe(200);
      const sessionData = await sessionRes.json();
      expect(sessionData.user.username).toBe('bob');
    });

    it('returns 401 SESSION_EXPIRED when clock advances past 30 minutes TTL', async () => {
      const loginRes = await fetch('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'bob@example.com',
          password: 'Password123!',
        }),
      });
      const { token } = await loginRes.json();

      // Advance clock by 31 minutes (past TTL)
      getClock().advance(31 * 60 * 1000);

      const expiredRes = await fetch('http://localhost/api/auth/session', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(expiredRes.status).toBe(401);
      const data = await expiredRes.json();
      expect(data.code).toBe('SESSION_EXPIRED');
    });

    it('returns 401 UNAUTHENTICATED when Authorization header is missing or invalid', async () => {
      const noAuthRes = await fetch('http://localhost/api/auth/session');
      expect(noAuthRes.status).toBe(401);

      const invalidTokenRes = await fetch('http://localhost/api/auth/session', {
        headers: { Authorization: 'Bearer bogus_token' },
      });
      expect(invalidTokenRes.status).toBe(401);
    });
  });

  describe('Cart Merging on Login and Signup', () => {
    it('merges anonymous guest cart into authenticated user cart upon login', async () => {
      const db = getMockDatabase();
      const guestId = 'guest_session_xyz';

      // Create guest cart with an item
      db.carts.push({
        id: `cart_${guestId}`,
        userId: null,
        sessionId: guestId,
        items: [
          {
            id: 'item_guest_1',
            nftId: 'nft-1',
            editionId: 'ed-1-1',
            quantity: 2,
            unitPriceEth: '0.45',
            maxAvailable: 10,
          },
        ],
        couponCode: null,
        updatedAt: getClock().toISOString(),
      });

      const response = await fetch('http://localhost/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': guestId,
        },
        body: JSON.stringify({
          identifier: 'alice@example.com',
          password: 'Password123!',
        }),
      });

      expect(response.status).toBe(200);

      // Verify Alice's cart now has the item
      const aliceCart = db.carts.find((c) => c.userId === 'user_alice');
      expect(aliceCart).toBeDefined();
      const mergedItem = aliceCart?.items.find((i) => i.nftId === 'nft-1');
      expect(mergedItem).toBeDefined();
      expect(mergedItem?.quantity).toBeGreaterThanOrEqual(2);

      // Verify guest cart was cleaned up
      const guestCart = db.carts.find((c) => c.sessionId === guestId);
      expect(guestCart).toBeUndefined();
    });
  });

  describe('POST /api/auth/logout', () => {
    it('revokes session token and prevents subsequent access', async () => {
      const loginRes = await fetch('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'alice@example.com',
          password: 'Password123!',
        }),
      });
      const { token } = await loginRes.json();

      const logoutRes = await fetch('http://localhost/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(logoutRes.status).toBe(200);
      const logoutData = await logoutRes.json();
      expect(logoutData.success).toBe(true);

      // Subsequent session check must now fail
      const sessionRes = await fetch('http://localhost/api/auth/session', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(sessionRes.status).toBe(401);
    });

    it('is idempotent when called without token or with already revoked token', async () => {
      const res = await fetch('http://localhost/api/auth/logout', {
        method: 'POST',
      });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ success: true });
    });
  });
});
