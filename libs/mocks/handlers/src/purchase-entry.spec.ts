import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { applyScenario, getClock, getMockDatabase, resetClock } from '@nft/mocks-core';
import { createHttpClient } from '@nft/shared-http';
import { createCheckoutQuote } from '@nft/checkout-data-access';
import { CartSchema, OrderSchema, type Collector } from '@nft/shared-contracts';
import { clearGeneratedQuotes } from './orders';
import { handlers } from './index';

const server = setupServer(...handlers);
const collector: Collector = {
  fullName: 'Alice Silva', email: 'alice@example.com',
  walletAddress: '0x1234567890123456789012345678901234567890',
  walletType: 'metamask', network: 'ethereum-mainnet', useSecondaryWallet: false,
};
const client = createHttpClient({ baseURL: 'http://localhost', getAuthToken: () => 'purchase-entry' });

describe('payment entry uses a quote of the selected cart', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  beforeEach(() => {
    server.resetHandlers(); resetClock(); applyScenario('default', true); clearGeneratedQuotes();
    const user = getMockDatabase().users[0];
    if (!user) throw new Error('Missing user');
    getMockDatabase().sessions.push({ token: 'purchase-entry', user, expiresAt: '2026-12-31T00:00:00Z' });
  });

  async function selection() {
    const db = getMockDatabase();
    const nft = db.nfts[0];
    const edition = nft?.editions[0];
    if (!nft || !edition) throw new Error('Missing edition');
    edition.availableSupply = 10;
    edition.price = '1.123456789';
    const quote = await createCheckoutQuote(client, {
      items: [{ nftId: nft.id, editionId: edition.id, quantity: 2 }],
    });
    return { quote, nft, edition };
  }

  it('returns authoritative decimal line totals matching edition and quantity', async () => {
    const { quote, nft, edition } = await selection();
    expect(quote.itemsAvailability).toMatchObject([{
      nftId: nft.id, editionId: edition.id, requestedQuantity: 2,
      currentPrice: '1.123456789', lineSubtotal: '2.246913578',
    }]);
    expect(quote.subtotal).toBe('2.246913578');
  });

  it('persists a valid coupon, rejects invalid/expired codes without changing the cart, and removes it', async () => {
    const applied = CartSchema.parse((await client.put('/api/cart/coupon', { couponCode: 'jungle10' })).data);
    expect(applied.couponCode).toBe('JUNGLE10');
    for (const couponCode of ['UNKNOWN', 'EXPIRED20']) {
      await expect(client.put('/api/cart/coupon', { couponCode })).rejects.toMatchObject({
        code: 'VALIDATION_ERROR', fieldErrors: { couponCode: expect.any(String) },
      });
      expect(CartSchema.parse((await client.get('/api/cart')).data).couponCode).toBe('JUNGLE10');
    }
    const quote = await createCheckoutQuote(client, {
      items: applied.items.map(({ nftId, editionId, quantity }) => ({ nftId, editionId, quantity })),
      couponCode: applied.couponCode,
    });
    expect(quote.coupon?.isValid).toBe(true);
    expect(quote.discount).not.toBe('0');
    expect(CartSchema.parse((await client.put('/api/cart/coupon', { couponCode: null })).data).couponCode).toBeNull();
  });

  it.each(['expired', 'price', 'stock'])('rejects %s without creating a confirmed order', async reason => {
    const { quote, edition } = await selection();
    if (reason === 'expired') getClock().advance(31 * 60 * 1000);
    if (reason === 'price') edition.price = '2';
    if (reason === 'stock') edition.availableSupply = 0;
    const before = getMockDatabase().orders.length;
    await expect(client.post('/api/orders', { quoteId: quote.quoteId, collector }, {
      headers: { 'Idempotency-Key': 'stale-entry' },
    })).rejects.toMatchObject({ code: reason === 'stock' ? 'AVAILABILITY_CONFLICT' : 'PRICE_CHANGED' });
    expect(getMockDatabase().orders).toHaveLength(before);
  });

  it('preserves unpurchased quantities and other cart items after REST and realtime confirmation', async () => {
    const { quote, nft, edition } = await selection();
    const cart = getMockDatabase().carts.find(candidate => candidate.userId === 'user_alice');
    if (!cart) throw new Error('Missing cart');
    const other = cart.items.find(item => item.nftId !== nft.id);
    if (!other) throw new Error('Missing unrelated cart item');
    cart.items = [{ id: 'selected-item', nftId: nft.id, editionId: edition.id, title: nft.title,
      imageUrl: nft.imageUrl, unitPrice: edition.price, quantity: 5 }, other];
    const response = await client.post<unknown>('/api/orders', { quoteId: quote.quoteId, collector }, {
      headers: { 'Idempotency-Key': 'entry-confirmation' },
    });
    const order = OrderSchema.parse(response.data);
    expect(order.status).toBe('confirmed');
    expect(order.items[0]).toMatchObject({ nftId: nft.id, editionId: edition.id, quantity: 2, subtotal: '2.246913578' });
    expect(cart.items).toEqual([expect.objectContaining({ id: 'selected-item', quantity: 3 }), other]);
    const repeated = await client.post<unknown>('/api/orders', { quoteId: quote.quoteId, collector }, {
      headers: { 'Idempotency-Key': 'entry-confirmation' },
    });
    expect(OrderSchema.parse(repeated.data).id).toBe(order.id);
    expect(cart.items[0]?.quantity).toBe(3);
  });
});
