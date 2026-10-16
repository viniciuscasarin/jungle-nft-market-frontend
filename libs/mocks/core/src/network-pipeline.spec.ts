import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse } from 'msw';
import { z } from 'zod';
import { ApiErrorCode } from '@nft/shared-contracts';
import {
  defineHandler,
  mocksPingHandler,
  parseBody,
  requireSession,
} from './handler-helpers';

import {
  setNetworkProfile,
  resetNetworkProfile,
  failTimes,
} from './network-profile';
import {
  getMockDatabase,
  resetMockDatabase,
  transaction,
} from './database';

const SampleOrderInputSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  amount: z.number().positive('Quantidade deve ser positiva'),
});

let testOrders: Array<{ id: string; title: string }> = [];

const testHandlers = [
  mocksPingHandler,

  defineHandler('POST', '/test/orders', async ({ request }) => {
    const parsed = await parseBody(request, SampleOrderInputSchema);
    if (!parsed.success) {
      return parsed.response;
    }

    transaction((db) => {
      const order = { id: `order_${Date.now()}`, title: parsed.data.title };
      testOrders.push(order);
      db.orders.push({
        id: order.id,
        userId: 'user_alice',
        quoteId: 'quote_1',
        idempotencyKey: 'idemp_1',
        status: 'confirmed',
        collector: {
          fullName: 'Alice',
          email: 'alice@example.com',
          walletAddress: '0x1111111111111111111111111111111111111111',
          network: 'ethereum-mainnet',
          useSecondaryWallet: false,
        },
        items: [],
        subtotal: '1.0',
        discount: '0.0',
        networkFee: '0.01',
        total: '1.01',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    return HttpResponse.json({ success: true, count: testOrders.length }, { status: 201 });
  }),

  defineHandler('GET', '/test/protected', ({ request }) => {
    const sessionCheck = requireSession(request);
    if (sessionCheck.response) {
      return sessionCheck.response;
    }
    return HttpResponse.json({ secret: 'classified', user: sessionCheck.session?.user.displayName });
  }),

  defineHandler('GET', '/test/recovering', () => {
    return HttpResponse.json({ status: 'recovered' }, { status: 200 });
  }),
];

const server = setupServer(...testHandlers);

describe('Network Pipeline & Handlers MSW Integration', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());

  beforeEach(() => {
    server.resetHandlers(...testHandlers);
    resetNetworkProfile();
    resetMockDatabase();
    testOrders = [];
  });


  it('serves diagnostic endpoint GET /api/__mocks/ping with active scenario and status ok', async () => {
    const response = await fetch('http://localhost/api/__mocks/ping');
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.scenarioId).toBe('default');
  });

  it('returns 422 with fieldErrors on malformed body via parseBody', async () => {
    const response = await fetch('http://localhost/api/test/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '', amount: -1 }),
    });

    expect(response.status).toBe(422);
    const err = await response.json();
    expect(err.code).toBe(ApiErrorCode.VALIDATION_ERROR);
    expect(err.fieldErrors?.title).toBeDefined();
    expect(err.fieldErrors?.amount).toBeDefined();
  });

  it('validates session and rejects expired or missing tokens via requireSession', async () => {
    // 1. Missing token
    const resNoToken = await fetch('http://localhost/api/test/protected');
    expect(resNoToken.status).toBe(401);
    const errNoToken = await resNoToken.json();
    expect(errNoToken.code).toBe(ApiErrorCode.UNAUTHENTICATED);

    // 2. Expired token
    const db = getMockDatabase();
    db.sessions.push({
      token: 'expired_tok',
      user: db.users[0]!,
      expiresAt: '2020-01-01T00:00:00.000Z',
    });

    const resExpired = await fetch('http://localhost/api/test/protected', {
      headers: { Authorization: 'Bearer expired_tok' },
    });
    expect(resExpired.status).toBe(401);
    const errExpired = await resExpired.json();
    expect(errExpired.code).toBe(ApiErrorCode.SESSION_EXPIRED);
  });

  it('executes phase: "before" rule to abort request before domain execution', async () => {
    setNetworkProfile({
      id: 'blocked',
      name: 'Blocked',
      rules: [
        {
          phase: 'before',
          pathPattern: '/api/test/orders',
          behavior: {
            type: 'httpError',
            status: 403,
            code: ApiErrorCode.FORBIDDEN,
            message: 'Acesso bloqueado pelo pipeline',
          },
        },
      ],
    });

    const response = await fetch('http://localhost/api/test/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'NFT', amount: 1 }),
    });

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.code).toBe(ApiErrorCode.FORBIDDEN);
    // Domain code was NOT executed
    expect(testOrders.length).toBe(0);
    expect(getMockDatabase().orders.length).toBe(0);
  });

  it('executes phase: "after" with timeout, persisting to DB before connection failure', async () => {
    setNetworkProfile({
      id: 'timeout-after-create',
      name: 'Timeout After Create',
      rules: [
        {
          phase: 'after',
          pathPattern: '/api/test/orders',
          behavior: {
            type: 'timeout',
            delayMs: 10,
          },
        },
      ],
    });

    // The request will throw/fail at network level due to HttpResponse.error()
    await expect(
      fetch('http://localhost/api/test/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Exclusive Ape', amount: 2 }),
      })
    ).rejects.toThrow();

    // Verify critical guarantee: database persisted the mutation before the timeout failure!
    expect(testOrders.length).toBe(1);
    expect(testOrders[0]?.title).toBe('Exclusive Ape');
    expect(getMockDatabase().orders.length).toBe(1);
  });

  it('recovers on 3rd attempt when configured with failTimes(2, 503)', async () => {
    setNetworkProfile({
      id: 'recovering',
      name: 'Recovering Profile',
      rules: [
        {
          phase: 'before',
          pathPattern: '/api/test/recovering',
          behavior: failTimes(2, {
            type: 'httpError',
            status: 503,
            code: ApiErrorCode.TRANSIENT,
            message: 'Service busy',
          }),
        },
      ],
    });

    // Attempt 1: 503
    const res1 = await fetch('http://localhost/api/test/recovering');
    expect(res1.status).toBe(503);
    const err1 = await res1.json();
    expect(err1.code).toBe(ApiErrorCode.TRANSIENT);

    // Attempt 2: 503
    const res2 = await fetch('http://localhost/api/test/recovering');
    expect(res2.status).toBe(503);

    // Attempt 3: 200 Recovered!
    const res3 = await fetch('http://localhost/api/test/recovering');
    expect(res3.status).toBe(200);
    const successData = await res3.json();
    expect(successData.status).toBe('recovered');
  });
});
