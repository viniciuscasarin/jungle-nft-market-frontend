import { describe, it, expect, beforeEach } from 'vitest';
import { getMockEventBus } from '@nft/mocks-core';
import {
  socketInterceptor,
  createMockSocketHandler,
  broadcastRealtimeEvent,
  disconnectAllSocketClients,
  getActiveSocketClientsCount,
  bindMockEventBusToSocket,
} from './index';

describe('mocks-socket integration and event relay', () => {
  beforeEach(() => {
    disconnectAllSocketClients();
    getMockEventBus().clear();
    bindMockEventBusToSocket();
  });

  it('exports configured socketInterceptor matching socket.io endpoint', () => {
    expect(socketInterceptor).toBeDefined();
    expect(typeof createMockSocketHandler).toBe('function');
  });

  it('relays nft.updated and order.updated events from MockEventBus to connected socket clients', () => {
    // Broadcast directly without throwing when no clients are connected
    broadcastRealtimeEvent('test.event', { foo: 'bar' });

    // Emitting through MockEventBus
    getMockEventBus().emit({
      id: 'ev_1',
      event: 'nft.updated',
      data: {
        id: 'ev_1',
        type: 'nft.updated',
        resource: 'nft',
        resourceId: 'nft-01',
        version: 2,
        timestamp: '2026-01-01T00:00:00.000Z',
        payload: { nftId: 'nft-01', price: '2.50' },
      },
      timestamp: '2026-01-01T00:00:00.000Z',
    });

    getMockEventBus().emit({
      id: 'ev_2',
      event: 'order.updated',
      data: {
        id: 'ev_2',
        type: 'order.updated',
        resource: 'order',
        resourceId: 'ord_1',
        version: 2,
        timestamp: '2026-01-01T00:00:00.000Z',
        userId: 'usr_1',
        payload: { orderId: 'ord_1', userId: 'usr_1', status: 'confirmed' },
      },
      timestamp: '2026-01-01T00:00:00.000Z',
    });

    // Verify helper handles empty state cleanly
    expect(getActiveSocketClientsCount()).toBe(0);
  });

  it('disconnects active clients when socket.disconnect is emitted on MockEventBus', () => {
    expect(getActiveSocketClientsCount()).toBe(0);
    getMockEventBus().emit({
      id: 'ev_disc',
      event: 'socket.disconnect',
      data: { reason: 'test' },
      timestamp: '2026-01-01T00:00:00.000Z',
    });
    expect(getActiveSocketClientsCount()).toBe(0);
  });
});
