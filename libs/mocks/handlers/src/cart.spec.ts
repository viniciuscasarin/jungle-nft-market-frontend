import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import {
  applyScenario,
  getClock,
  getMockDatabase,
  MemoryStorageAdapter,
  resetClock,
  setStorageAdapter,
} from '@nft/mocks-core';
import { ApiErrorSchema, CartSchema } from '@nft/shared-contracts';
import { handlers } from './index';

const server = setupServer(...handlers);
const guestHeaders = { 'x-session-id': 'guest-cart-test', 'Content-Type': 'application/json' };

function requestCart(method = 'GET', path = '', body?: unknown, headers = guestHeaders) {
  return fetch(`http://localhost/api/cart${path}`, {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

function selectedEdition() {
  const nft = getMockDatabase().nfts[0];
  const edition = nft?.editions[0];
  if (!nft || !edition) throw new Error('Missing catalog fixture');
  edition.availableSupply = 6;
  return { nft, edition, input: { nftId: nft.id, editionId: edition.id, quantity: 2 } };
}

async function addItem() {
  const { input } = selectedEdition();
  const response = await requestCart('POST', '/items', input);
  expect(response.status).toBe(200);
  const cart = CartSchema.parse(await response.json());
  const item = cart.items[0];
  if (!item) throw new Error('Missing added item');
  return { cart, item };
}

describe('Cart REST handlers', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  beforeEach(() => {
    server.resetHandlers();
    setStorageAdapter(new MemoryStorageAdapter());
    resetClock();
    applyScenario('default', true);
  });

  it('returns an empty guest cart without mutating the database', async () => {
    const snapshot = structuredClone(getMockDatabase());
    const response = await requestCart();
    expect(response.status).toBe(200);
    expect(CartSchema.parse(await response.json())).toMatchObject({
      userId: null,
      sessionId: guestHeaders['x-session-id'],
      items: [],
      updatedAt: getClock().toISOString(),
    });
    expect(getMockDatabase()).toEqual(snapshot);
  });

  it('adds, merges with a stock cap, and persists items on the canonical API path', async () => {
    const { nft, edition, input } = selectedEdition();
    const { item } = await addItem();
    expect(item).toMatchObject({
      editionNumber: edition.editionNumber,
      unitPrice: edition.price,
      quantity: 2,
    });
    getClock().advance(1000);
    const response = await requestCart('POST', '/items', { ...input, quantity: 5 });
    const cart = CartSchema.parse(await response.json());
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]).toMatchObject({
      id: item.id,
      nftId: nft.id,
      quantity: 6,
      maxAvailable: 6,
    });
    expect(cart.updatedAt).toBe(getClock().toISOString());
    expect(CartSchema.parse(await (await requestCart()).json())).toEqual(cart);
  });

  it('updates, removes, and clears items with deterministic timestamps', async () => {
    const { item } = await addItem();
    getClock().advance(2000);
    const update = await requestCart('PUT', `/items/${item.id}`, { quantity: 3 });
    expect(update.status).toBe(200);
    expect(CartSchema.parse(await update.json())).toMatchObject({
      items: [{ quantity: 3 }],
      updatedAt: getClock().toISOString(),
    });
    const remove = await requestCart('DELETE', `/items/${item.id}`);
    expect(remove.status).toBe(200);
    expect(CartSchema.parse(await remove.json()).items).toEqual([]);
    await addItem();
    const clear = await requestCart('DELETE');
    expect(clear.status).toBe(200);
    expect(CartSchema.parse(await clear.json()).items).toEqual([]);
    expect(CartSchema.parse(await (await requestCart('DELETE')).json()).items).toEqual([]);
  });

  it('clears a nonexistent cart without creating one', async () => {
    const snapshot = structuredClone(getMockDatabase());
    const response = await requestCart('DELETE');
    expect(response.status).toBe(200);
    expect(CartSchema.parse(await response.json()).items).toEqual([]);
    expect(getMockDatabase()).toEqual(snapshot);
  });

  it.each([
    { nftId: 'missing', editionId: 'missing', quantity: 1 },
    { nftId: 'nft-01', editionId: 'missing', quantity: 1 },
  ])('rejects missing catalog entities without creating a cart: %j', async input => {
    const snapshot = structuredClone(getMockDatabase());
    const response = await requestCart('POST', '/items', input);
    expect(response.status).toBe(404);
    expect(ApiErrorSchema.parse(await response.json()).code).toBe('NOT_FOUND');
    expect(getMockDatabase()).toEqual(snapshot);
  });

  it.each([0, -1, 1.5])('validates quantity %s through the shared schema', async quantity => {
    const { input } = selectedEdition();
    const response = await requestCart('POST', '/items', { ...input, quantity });
    expect(response.status).toBe(422);
    expect(ApiErrorSchema.parse(await response.json())).toMatchObject({
      code: 'VALIDATION_ERROR',
      retryable: false,
      fieldErrors: { quantity: expect.any(String) },
    });
  });

  it('validates malformed JSON and update payloads', async () => {
    const { item } = await addItem();
    const response = await fetch('http://localhost/api/cart/items', {
      method: 'POST',
      headers: guestHeaders,
      body: '{',
    });
    expect(response.status).toBe(422);
    expect((await requestCart('PUT', `/items/${item.id}`, { quantity: 0 })).status).toBe(422);
  });

  it('rejects requests over stock without mutating the cart', async () => {
    const { input } = selectedEdition();
    const snapshot = structuredClone(getMockDatabase());
    const response = await requestCart('POST', '/items', { ...input, quantity: 7 });
    expect(response.status).toBe(409);
    expect(ApiErrorSchema.parse(await response.json())).toMatchObject({
      code: 'AVAILABILITY_CONFLICT',
      retryable: false,
    });
    expect(getMockDatabase()).toEqual(snapshot);
  });

  it('checks current stock when updating, including zero despite a stale maxAvailable', async () => {
    const { item } = await addItem();
    const { edition, input } = selectedEdition();
    edition.availableSupply = 0;
    const snapshot = structuredClone(getMockDatabase());
    expect((await requestCart('PUT', `/items/${item.id}`, { quantity: 1 })).status).toBe(409);
    expect((await requestCart('POST', '/items', input)).status).toBe(409);
    expect(getMockDatabase()).toEqual(snapshot);
  });

  it.each(['PUT', 'DELETE'])('returns 404 for a missing item on %s', async method => {
    expect(
      (await requestCart(method, '/items/missing', method === 'PUT' ? { quantity: 1 } : undefined))
        .status,
    ).toBe(404);
    await addItem();
    expect(
      (await requestCart(method, '/items/missing', method === 'PUT' ? { quantity: 1 } : undefined))
        .status,
    ).toBe(404);
  });

  it('isolates guests and authenticated carts and rejects foreign item mutations', async () => {
    const { item, cart } = await addItem();
    const otherHeaders = { ...guestHeaders, 'x-session-id': 'another-guest' };
    expect(
      CartSchema.parse(await (await requestCart('GET', '', undefined, otherHeaders)).json()).items,
    ).toEqual([]);
    expect((await requestCart('DELETE', `/items/${item.id}`, undefined, otherHeaders)).status).toBe(
      404,
    );
    const user = getMockDatabase().users[0];
    if (!user) throw new Error('Missing user fixture');
    getMockDatabase().sessions.push({
      token: 'cart-token',
      user,
      expiresAt: '2026-12-31T00:00:00.000Z',
    });
    const authHeaders = { ...guestHeaders, Authorization: 'Bearer cart-token' };
    const aliceResponse = await requestCart('GET', '', undefined, authHeaders);
    expect(CartSchema.parse(await aliceResponse.json()).userId).toBe(user.id);
    expect(
      (await requestCart('PUT', `/items/${item.id}`, { quantity: 1 }, authHeaders)).status,
    ).toBe(404);
    const { input } = selectedEdition();
    expect((await requestCart('POST', '/items', input, authHeaders)).status).toBe(200);
    expect((await requestCart('DELETE', '', undefined, authHeaders)).status).toBe(200);
    expect(CartSchema.parse(await (await requestCart()).json())).toEqual(cart);
  });

  it.each(['GET', 'POST', 'PUT', 'DELETE'])(
    'requires an owner and rejects expired tokens without guest fallback on %s',
    async method => {
      const { input } = selectedEdition();
      const path = method === 'POST' ? '/items' : method === 'PUT' ? '/items/missing' : '';
      expect(
        (
          await requestCart(method, path, method === 'GET' ? undefined : input, {
            'x-session-id': '',
            'Content-Type': 'application/json',
          })
        ).status,
      ).toBe(401);
      const user = getMockDatabase().users[0];
      if (!user) throw new Error('Missing user fixture');
      getMockDatabase().sessions.push({
        token: 'expired-cart',
        user,
        expiresAt: '2025-01-01T00:00:00.000Z',
      });
      const response = await requestCart(method, path, method === 'GET' ? undefined : input, {
        ...guestHeaders,
        Authorization: 'Bearer expired-cart',
      });
      expect(response.status).toBe(401);
      expect(ApiErrorSchema.parse(await response.json()).code).toBe('SESSION_EXPIRED');
      expect(
        (
          await requestCart(method, path, method === 'GET' ? undefined : input, {
            ...guestHeaders,
            Authorization: 'Bearer invalid',
          })
        ).status,
      ).toBe(401);
    },
  );

  it('uses the existing deterministic network failure scenarios', async () => {
    applyScenario('http-5xx', true);
    const response = await requestCart();
    expect(response.status).toBe(500);
    expect(ApiErrorSchema.parse(await response.json()).retryable).toBe(true);
    applyScenario('connection-down', true);
    await expect(requestCart()).rejects.toThrow();
  });
});
