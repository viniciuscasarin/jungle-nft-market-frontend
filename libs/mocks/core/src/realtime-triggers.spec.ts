import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RealtimeEnvelopeSchema } from '@nft/shared-contracts';
import { getMockDatabase, resetMockDatabase, setStorageAdapter } from './database';
import { MemoryStorageAdapter } from './storage';
import { getMockEventBus } from './event-bus';
import {
  emitNftUpdated,
  emitOrderUpdated,
  emitDuplicateEvent,
  emitStaleEvent,
  resetRealtimeTriggerState,
  simulateSocketDisconnect,
  simulateSocketReconnect,
} from './realtime-triggers';
import { createMockControls, exposeMockControls } from './mock-controls';

describe('realtime-triggers & MockControls integration', () => {
  beforeEach(() => {
    setStorageAdapter(new MemoryStorageAdapter());
    resetMockDatabase();
    resetRealtimeTriggerState();
    getMockEventBus().clear();
  });

  it('emitNftUpdated mutates MockDatabaseState atomically, increments version, and emits valid RealtimeEnvelope on MockEventBus', () => {
    const listener = vi.fn();
    getMockEventBus().subscribe('nft.updated', listener);

    const initialNft = getMockDatabase().nfts.find((n) => n.id === 'nft-01')!;
    const initialVersion = initialNft.version;

    const event = emitNftUpdated({
      nftId: 'nft-01',
      price: '3.75',
      availableSupply: 2,
    });

    const parsed = RealtimeEnvelopeSchema.safeParse(event);
    expect(parsed.success).toBe(true);
    expect(event.type).toBe('nft.updated');
    expect(event.resource).toBe('nft');
    expect(event.resourceId).toBe('nft-01');
    expect(event.version).toBeGreaterThan(initialVersion);
    expect(event.payload).toMatchObject({
      nftId: 'nft-01',
      price: '3.75',
      availableSupply: 2,
    });

    const updatedNft = getMockDatabase().nfts.find((n) => n.id === 'nft-01')!;
    expect(updatedNft.price).toBe('3.75');
    expect(updatedNft.version).toBe(event.version);
    expect(updatedNft.editions[0]?.price).toBe('3.75');
    expect(updatedNft.editions[0]?.availableSupply).toBe(2);
    expect(updatedNft.editions[0]?.version).toBe(event.version);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        id: event.id,
        event: 'nft.updated',
        data: event,
        version: event.version,
      })
    );
  });

  it('emitOrderUpdated updates order status in MockDatabaseState, clears user cart on confirmed, and emits OrderUpdatedEvent', () => {
    const db = getMockDatabase();
    const userId = db.users[0]!.id;
    db.orders.push({
      id: 'ord_test_1',
      userId,
      quoteId: 'qt_1',
      idempotencyKey: 'idem_1',
      status: 'pending',
      collector: {
        fullName: 'Alice Collector',
        email: 'alice@example.com',
        walletAddress: '0x1111111111111111111111111111111111111111',
        walletType: 'coinbase',
        network: 'ethereum-mainnet',
        useSecondaryWallet: false,
      },
      items: [
        {
          nftId: 'nft-01',
          editionId: 'edition_nft-01_1',
          title: 'Alpha Primate',
          imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800',
          unitPrice: '1.00',
          quantity: 1,
          subtotal: '1.00',
        },
      ],
      subtotal: '1.00',
      discount: '0',
      networkFee: '0.005',
      total: '1.005',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    const listener = vi.fn();
    getMockEventBus().subscribe('order.updated', listener);

    const event = emitOrderUpdated({
      orderId: 'ord_test_1',
      userId,
      status: 'confirmed',
    });

    const parsed = RealtimeEnvelopeSchema.safeParse(event);
    expect(parsed.success).toBe(true);
    expect(event.type).toBe('order.updated');
    expect(event.userId).toBe(userId);
    expect(event.payload.status).toBe('confirmed');
    expect(event.payload.transactionHash).toMatch(/^0x[a-fA-F0-9]{64}$/);

    const updatedOrder = getMockDatabase().orders.find((o) => o.id === 'ord_test_1')!;
    expect(updatedOrder.status).toBe('confirmed');

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        id: event.id,
        event: 'order.updated',
        userId,
        data: event,
      })
    );
  });

  it('emitDuplicateEvent re-emits the exact same envelope ID and version without mutating the database', () => {
    const first = emitNftUpdated({ nftId: 'nft-01', price: '4.20' });
    const dbVersionAfterFirst = getMockDatabase().version;

    const listener = vi.fn();
    getMockEventBus().subscribe('nft.updated', listener);

    const duplicate = emitDuplicateEvent();
    expect(duplicate).toEqual(first);
    expect(getMockDatabase().version).toBe(dbVersionAfterFirst);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        id: first.id,
        data: first,
      })
    );
  });

  it('emitStaleEvent emits an envelope with version <= current without mutating database state', () => {
    const fresh = emitNftUpdated({ nftId: 'nft-01', price: '5.00' });
    expect(fresh.version).toBe(2);

    const stale = emitStaleEvent({ nftId: 'nft-01', price: '0.50' });
    expect(stale.id).not.toBe(fresh.id);
    expect(stale.version).toBeLessThan(fresh.version);

    const nftInDb = getMockDatabase().nfts.find((n) => n.id === 'nft-01')!;
    expect(nftInDb.price).toBe('5.00');
    expect(nftInDb.version).toBe(2);
  });

  it('exposes all triggers on window.__mocks and window.__NFT_MOCK_CONTROL__', () => {
    const controls = createMockControls();
    exposeMockControls(controls);

    const win = window as unknown as {
      __mocks?: typeof controls;
      __NFT_MOCK_CONTROL__?: typeof controls;
    };

    expect(win.__mocks).toBe(controls);
    expect(win.__NFT_MOCK_CONTROL__).toBe(controls);

    const disconnectSpy = vi.fn();
    const reconnectSpy = vi.fn();
    controls.events.subscribe('socket.disconnect', disconnectSpy);
    controls.events.subscribe('socket.reconnect', reconnectSpy);

    simulateSocketDisconnect();
    simulateSocketReconnect();

    expect(disconnectSpy).toHaveBeenCalledTimes(1);
    expect(reconnectSpy).toHaveBeenCalledTimes(1);
  });
});
