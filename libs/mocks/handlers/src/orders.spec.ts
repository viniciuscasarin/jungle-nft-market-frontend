import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { applyScenario, getMockDatabase } from '@nft/mocks-core';
import { OrderSchema, QuoteSchema, type CreateOrderInput } from '@nft/shared-contracts';
import { orderHandlers, clearGeneratedQuotes } from './orders';

const server = setupServer(...orderHandlers);

describe('Order & Checkout Handlers Integration (@nft/mocks-handlers)', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    clearGeneratedQuotes();
    applyScenario('default', true);
    server.resetHandlers();

    // Ensure session for test user
    const db = getMockDatabase();
    db.sessions.push({
      token: 'test_token_alice',
      user: {
        id: 'user_alice',
        displayName: 'Alice Silva',
        username: 'alice',
        email: 'alice@example.com',
        avatarUrl: null,
        bio: null,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      expiresAt: '2026-12-31T23:59:59.000Z',
    });
  });

  const authHeaders = {
    Authorization: 'Bearer test_token_alice',
    'Content-Type': 'application/json',
  };

  it('generates an authoritative quote via POST /api/checkout/quote', async () => {
    const db = getMockDatabase();
    const nft = db.nfts[0]!;
    const edition = nft.editions[0]!;

    const quoteRes = await fetch('http://localhost/api/checkout/quote', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        items: [
          {
            nftId: nft.id,
            editionId: edition.id,
            quantity: 1,
          },
        ],
        couponCode: 'JUNGLE10',
      }),
    });

    expect(quoteRes.status).toBe(200);
    const quoteJson = await quoteRes.json();
    const parsedQuote = QuoteSchema.parse(quoteJson);

    expect(parsedQuote.quoteId).toBeDefined();
    expect(parsedQuote.coupon?.isValid).toBe(true);
    expect(parsedQuote.itemsAvailability[0]?.isAvailable).toBe(true);
  });

  it('creates confirmed order, debits stock and cleans cart items on success', async () => {
    const db = getMockDatabase();
    const nft = db.nfts[0]!;
    const edition = nft.editions[0]!;
    const initialStock = edition.availableSupply;

    // 1. Create quote
    const quoteRes = await fetch('http://localhost/api/checkout/quote', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        items: [
          {
            nftId: nft.id,
            editionId: edition.id,
            quantity: 1,
          },
        ],
      }),
    });
    const quote = await quoteRes.json();

    // 2. Add item to Alice's cart
    const aliceCart = db.carts.find((c) => c.userId === 'user_alice');
    if (aliceCart) {
      aliceCart.items = [
        {
          id: 'cart_item_1',
          nftId: nft.id,
          editionId: edition.id,
          title: nft.title,
          imageUrl: nft.imageUrl,
          unitPrice: edition.price,
          quantity: 1,
        },
      ];
    }

    // 3. POST /api/orders
    const orderInput: CreateOrderInput = {
      quoteId: quote.quoteId,
      collector: {
        fullName: 'Alice Silva',
        email: 'alice@example.com',
        walletAddress: '0x1111111111111111111111111111111111111111',
        walletType: 'metamask',
        network: 'ethereum-mainnet',
        ensName: 'alice',
        useSecondaryWallet: false,
        secondaryWallet: null,
      },
    };

    const orderRes = await fetch('http://localhost/api/orders', {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Idempotency-Key': 'idem_key_001',
      },
      body: JSON.stringify(orderInput),
    });

    expect(orderRes.status).toBe(201);
    const orderJson = await orderRes.json();
    const parsedOrder = OrderSchema.parse(orderJson);

    expect(parsedOrder.status).toBe('confirmed');
    expect(parsedOrder.receipt).toBeDefined();
    expect(parsedOrder.receipt?.transactionHash).toBeDefined();

    // Verify stock was debited
    const currentEd = db.nfts.find((n) => n.id === nft.id)?.editions.find((e) => e.id === edition.id);
    expect(currentEd?.availableSupply).toBe(initialStock - 1);

    // Verify Alice's cart was cleaned
    expect(aliceCart?.items.length).toBe(0);

    // 4. Test Idempotency with exact same key and payload
    const repeatRes = await fetch('http://localhost/api/orders', {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Idempotency-Key': 'idem_key_001',
      },
      body: JSON.stringify(orderInput),
    });

    expect(repeatRes.status).toBe(200);
    const repeatJson = await repeatRes.json();
    expect(repeatJson.id).toBe(parsedOrder.id);
    // Stock must NOT be debited again
    expect(currentEd?.availableSupply).toBe(initialStock - 1);

    // 5. Test 409 IDEMPOTENCY_CONFLICT with same key but different payload
    const conflictRes = await fetch('http://localhost/api/orders', {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Idempotency-Key': 'idem_key_001',
      },
      body: JSON.stringify({
        ...orderInput,
        collector: {
          ...orderInput.collector,
          email: 'different@example.com',
        },
      }),
    });

    expect(conflictRes.status).toBe(409);
    const conflictJson = await conflictRes.json();
    expect(conflictJson.code).toBe('IDEMPOTENCY_CONFLICT');
  });

  it('rejects order without debiting stock or clearing cart in payment-rejected scenario', async () => {
    applyScenario('payment-rejected', true);
    const db = getMockDatabase();
    db.sessions.push({
      token: 'test_token_alice',
      user: {
        id: 'user_alice',
        displayName: 'Alice Silva',
        username: 'alice',
        email: 'alice@example.com',
        avatarUrl: null,
        bio: null,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      expiresAt: '2026-12-31T23:59:59.000Z',
    });

    const nft = db.nfts[0]!;
    const edition = nft.editions[0]!;
    const initialStock = edition.availableSupply;

    const aliceCart = db.carts.find((c) => c.userId === 'user_alice');
    if (aliceCart) {
      aliceCart.items = [
        {
          id: 'cart_item_1',
          nftId: nft.id,
          editionId: edition.id,
          title: nft.title,
          imageUrl: nft.imageUrl,
          unitPrice: edition.price,
          quantity: 1,
        },
      ];
    }

    const quoteRes = await fetch('http://localhost/api/checkout/quote', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        items: [{ nftId: nft.id, editionId: edition.id, quantity: 1 }],
      }),
    });
    const quote = await quoteRes.json();

    const orderRes = await fetch('http://localhost/api/orders', {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Idempotency-Key': 'idem_rejected_001',
      },
      body: JSON.stringify({
        quoteId: quote.quoteId,
        collector: {
          fullName: 'Alice Silva',
          email: 'alice@example.com',
          walletAddress: '0x1111111111111111111111111111111111111111',
          walletType: 'metamask',
          network: 'ethereum-mainnet',
          ensName: 'alice',
          useSecondaryWallet: false,
          secondaryWallet: null,
        },
      }),
    });

    expect(orderRes.status).toBe(201);
    const orderJson = await orderRes.json();
    expect(orderJson.status).toBe('rejected');
    expect(orderJson.receipt).toBeNull();
    expect(orderJson.rejectionReason).toBeDefined();

    // Stock must NOT be debited
    expect(edition.availableSupply).toBe(initialStock);
    // Cart must be preserved
    expect(aliceCart?.items.length).toBe(1);
  });

  it('fails with 409 PRICE_CHANGED if NFT price changed after quote', async () => {
    const db = getMockDatabase();
    const nft = db.nfts[0]!;
    const edition = nft.editions[0]!;

    const quoteRes = await fetch('http://localhost/api/checkout/quote', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        items: [{ nftId: nft.id, editionId: edition.id, quantity: 1 }],
      }),
    });
    const quote = await quoteRes.json();

    // Simulate price change on edition
    edition.price = '9.9999';

    const orderRes = await fetch('http://localhost/api/orders', {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Idempotency-Key': 'idem_price_change',
      },
      body: JSON.stringify({
        quoteId: quote.quoteId,
        collector: {
          fullName: 'Alice Silva',
          email: 'alice@example.com',
          walletAddress: '0x1111111111111111111111111111111111111111',
          walletType: 'metamask',
          network: 'ethereum-mainnet',
          ensName: 'alice',
          useSecondaryWallet: false,
          secondaryWallet: null,
        },
      }),
    });

    expect(orderRes.status).toBe(409);
    const json = await orderRes.json();
    expect(json.code).toBe('PRICE_CHANGED');
  });

  it('fails with 409 AVAILABILITY_CONFLICT if NFT is sold out', async () => {
    const db = getMockDatabase();
    const nft = db.nfts[0]!;
    const edition = nft.editions[0]!;

    const quoteRes = await fetch('http://localhost/api/checkout/quote', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        items: [{ nftId: nft.id, editionId: edition.id, quantity: 2 }],
      }),
    });
    const quote = await quoteRes.json();

    // Simulate sold out
    edition.availableSupply = 1;

    const orderRes = await fetch('http://localhost/api/orders', {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Idempotency-Key': 'idem_sold_out',
      },
      body: JSON.stringify({
        quoteId: quote.quoteId,
        collector: {
          fullName: 'Alice Silva',
          email: 'alice@example.com',
          walletAddress: '0x1111111111111111111111111111111111111111',
          walletType: 'metamask',
          network: 'ethereum-mainnet',
          ensName: 'alice',
          useSecondaryWallet: false,
          secondaryWallet: null,
        },
      }),
    });

    expect(orderRes.status).toBe(409);
    const json = await orderRes.json();
    expect(json.code).toBe('AVAILABILITY_CONFLICT');
  });

  it('fetches order by ID via GET /api/orders/:orderId', async () => {
    const db = getMockDatabase();
    db.orders.push({
      id: 'order_test_999',
      userId: 'user_alice',
      quoteId: 'quote_test',
      idempotencyKey: 'idem_test',
      status: 'confirmed',
      collector: {
        fullName: 'Alice Silva',
        email: 'alice@example.com',
        walletAddress: '0x1111111111111111111111111111111111111111',
        walletType: 'metamask',
        network: 'ethereum-mainnet',
        ensName: 'alice',
        useSecondaryWallet: false,
        secondaryWallet: null,
      },
      items: [],
      subtotal: '1.0000',
      discount: '0.0000',
      networkFee: '0.0050',
      total: '1.0050',
      receipt: null,
      rejectionReason: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    const res = await fetch('http://localhost/api/orders/order_test_999', {
      headers: authHeaders,
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe('order_test_999');

    // 404 Not Found for non-existing order
    const notFoundRes = await fetch('http://localhost/api/orders/order_non_existent', {
      headers: authHeaders,
    });
    expect(notFoundRes.status).toBe(404);
    const notFoundJson = await notFoundRes.json();
    expect(notFoundJson.code).toBe('NOT_FOUND');

    // 403 Forbidden when order belongs to different user
    db.orders.push({
      id: 'order_bob_999',
      userId: 'user_bob',
      quoteId: 'quote_bob',
      idempotencyKey: 'idem_bob',
      status: 'confirmed',
      collector: {
        fullName: 'Bob Santos',
        email: 'bob@example.com',
        walletAddress: '0x3333333333333333333333333333333333333333',
        walletType: 'metamask',
        network: 'ethereum-mainnet',
        ensName: 'bob',
        useSecondaryWallet: false,
        secondaryWallet: null,
      },
      items: [],
      subtotal: '1.0000',
      discount: '0.0000',
      networkFee: '0.0050',
      total: '1.0050',
      receipt: null,
      rejectionReason: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    const forbiddenRes = await fetch('http://localhost/api/orders/order_bob_999', {
      headers: authHeaders, // authenticated as user_alice
    });
    expect(forbiddenRes.status).toBe(403);
    const forbiddenJson = await forbiddenRes.json();
    expect(forbiddenJson.code).toBe('FORBIDDEN');
  });
});
