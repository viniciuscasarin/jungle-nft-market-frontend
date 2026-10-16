import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createRealtimeClient,
  normalizeRealtimeEnvelope,
  type Socket,
  type RealtimeEnvelope,
  type ConnectionState,
} from './index';

interface MockSocketListenerMap {
  [event: string]: ((...args: unknown[]) => void)[];
}

function createMockSocket(): Socket & {
  trigger(event: string, ...args: unknown[]): void;
} {
  const listeners: MockSocketListenerMap = {};
  let isConnected = false;

  const mockSocket = {
    get connected() {
      return isConnected;
    },
    set connected(val: boolean) {
      isConnected = val;
    },
    auth: {} as Record<string, unknown>,
    connect: vi.fn(() => {
      isConnected = true;
      mockSocket.trigger('connect');
      return mockSocket;
    }),
    disconnect: vi.fn(() => {
      isConnected = false;
      mockSocket.trigger('disconnect');
      return mockSocket;
    }),
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event]?.push(handler);
      return mockSocket;
    }),
    off: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      if (listeners[event]) {
        listeners[event] = listeners[event]?.filter((h) => h !== handler);
      }
      return mockSocket;
    }),
    emit: vi.fn(() => {
      return mockSocket;
    }),
    trigger(event: string, ...args: unknown[]) {
      const handlers = listeners[event];
      if (handlers) {
        for (const handler of [...handlers]) {
          handler(...args);
        }
      }
    },
  } as unknown as Socket & {
    trigger(event: string, ...args: unknown[]): void;
  };

  return mockSocket;
}

describe('RealtimeClient Unit Tests (@nft/shared-realtime)', () => {
  let mockSocket: ReturnType<typeof createMockSocket>;

  beforeEach(() => {
    mockSocket = createMockSocket();
  });

  describe('Envelope Normalization', () => {
    it('normalizes standard RealtimeEnvelopeSchema', () => {
      const input = {
        id: 'evt_1',
        type: 'nft.updated',
        resource: 'nft',
        resourceId: 'nft-01',
        version: 2,
        timestamp: '2026-01-01T00:00:00.000Z',
        payload: { nftId: 'nft-01', price: '1.50' },
      };
      const result = normalizeRealtimeEnvelope(input);
      expect(result).toEqual(input);
    });

    it('tolerantly normalizes alternate envelope with resource object and occurredAt', () => {
      const alternate = {
        id: 'evt_alt_1',
        type: 'nft.updated',
        resource: { kind: 'nft', id: 'nft-02' },
        version: 3,
        occurredAt: '2026-01-01T01:00:00.000Z',
        payload: { nftId: 'nft-02', price: '2.00' },
      };
      const result = normalizeRealtimeEnvelope(alternate);
      expect(result).toMatchObject({
        id: 'evt_alt_1',
        type: 'nft.updated',
        resource: 'nft',
        resourceId: 'nft-02',
        version: 3,
        timestamp: '2026-01-01T01:00:00.000Z',
        payload: { nftId: 'nft-02', price: '2.00' },
      });
    });

    it('returns null for invalid envelopes', () => {
      expect(normalizeRealtimeEnvelope(null)).toBeNull();
      expect(normalizeRealtimeEnvelope({})).toBeNull();
      expect(normalizeRealtimeEnvelope({ type: 'unknown.type' })).toBeNull();
    });
  });

  describe('Connection on demand & state machine', () => {
    it('connects on demand when subscribe is called even without token (visitor support)', () => {
      const client = createRealtimeClient({ socket: mockSocket });
      expect(client.subscriptionCount).toBe(0);
      expect(client.connectionState).toBe('disconnected');

      const handler = vi.fn();
      client.subscribe('nft.updated', handler);

      expect(client.subscriptionCount).toBe(1);
      expect(mockSocket.connect).toHaveBeenCalledTimes(1);
      expect(client.connectionState).toBe('connected');
    });

    it('emits connection state changes across lifecycle', () => {
      const client = createRealtimeClient({ socket: mockSocket });
      const states: ConnectionState[] = [];
      client.onConnectionStateChange((state) => states.push(state));

      expect(states).toEqual(['disconnected']);

      client.subscribe('nft.updated', vi.fn());
      expect(states).toContain('connected');

      mockSocket.trigger('reconnect_attempt');
      expect(client.connectionState).toBe('reconnecting');

      mockSocket.trigger('reconnect');
      expect(client.connectionState).toBe('connected');

      client.disconnect();
      expect(client.connectionState).toBe('disconnected');
    });

    it('invokes onReconnect callbacks upon socket reconnection', () => {
      const client = createRealtimeClient({ socket: mockSocket });
      const reconnectSpy = vi.fn();
      client.onReconnect(reconnectSpy);

      mockSocket.trigger('reconnect');
      expect(reconnectSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Deduplication, Monotonic Versioning and User Isolation', () => {
    it('dispatches valid nft.updated event to subscribers', () => {
      const client = createRealtimeClient({ socket: mockSocket });
      const handler = vi.fn();
      client.subscribe('nft.updated', handler);

      const event: RealtimeEnvelope = {
        id: 'ev_nft_1',
        type: 'nft.updated',
        resource: 'nft',
        resourceId: 'nft-01',
        version: 2,
        timestamp: '2026-01-01T00:00:00.000Z',
        payload: { nftId: 'nft-01', price: '3.00' },
      };

      mockSocket.trigger('nft.updated', event);
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(event);
    });

    it('discards duplicate events with the same event.id', () => {
      const client = createRealtimeClient({ socket: mockSocket });
      const handler = vi.fn();
      client.subscribe('nft.updated', handler);

      const event: RealtimeEnvelope = {
        id: 'ev_dup_1',
        type: 'nft.updated',
        resource: 'nft',
        resourceId: 'nft-01',
        version: 2,
        timestamp: '2026-01-01T00:00:00.000Z',
        payload: { nftId: 'nft-01', price: '3.00' },
      };

      mockSocket.trigger('nft.updated', event);
      mockSocket.trigger('nft.updated', event);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('discards stale events where version <= last applied version for the resource', () => {
      const client = createRealtimeClient({ socket: mockSocket });
      const handler = vi.fn();
      client.subscribe('nft.updated', handler);

      const eventV3: RealtimeEnvelope = {
        id: 'ev_v3',
        type: 'nft.updated',
        resource: 'nft',
        resourceId: 'nft-01',
        version: 3,
        timestamp: '2026-01-01T00:00:00.000Z',
        payload: { nftId: 'nft-01', price: '3.00' },
      };

      const eventV2: RealtimeEnvelope = {
        id: 'ev_v2',
        type: 'nft.updated',
        resource: 'nft',
        resourceId: 'nft-01',
        version: 2,
        timestamp: '2026-01-01T00:01:00.000Z',
        payload: { nftId: 'nft-01', price: '2.50' },
      };

      mockSocket.trigger('nft.updated', eventV3);
      mockSocket.trigger('nft.updated', eventV2);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(eventV3);
    });

    it('isolates private order.updated events when user is anonymous or userId does not match', () => {
      const client = createRealtimeClient({ socket: mockSocket });
      const handler = vi.fn();
      client.subscribe('order.updated', handler);

      const orderEvent: RealtimeEnvelope = {
        id: 'ev_ord_1',
        type: 'order.updated',
        resource: 'order',
        resourceId: 'ord_1',
        version: 2,
        timestamp: '2026-01-01T00:00:00.000Z',
        userId: 'usr_collector_01',
        payload: { orderId: 'ord_1', userId: 'usr_collector_01', status: 'confirmed' },
      };

      // 1. Discard when anonymous (no user session)
      mockSocket.trigger('order.updated', orderEvent);
      expect(handler).not.toHaveBeenCalled();

      // 2. Discard when authenticated as a different user
      client.setAuthToken('token_other', 'usr_other');
      mockSocket.trigger('order.updated', orderEvent);
      expect(handler).not.toHaveBeenCalled();

      // 3. Accept when authenticated as matching userId
      client.setAuthToken('token_collector', 'usr_collector_01');
      mockSocket.trigger('order.updated', orderEvent);
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(orderEvent);
    });
  });

  describe('Cleanup and Logout Lifecycle', () => {
    it('disconnects and resets when last subscription unsubscribes', () => {
      const client = createRealtimeClient({ socket: mockSocket });
      const unsub1 = client.subscribe('nft.updated', vi.fn());
      const unsub2 = client.subscribe('nft.updated', vi.fn());

      expect(client.subscriptionCount).toBe(2);

      unsub1();
      expect(client.subscriptionCount).toBe(1);
      expect(mockSocket.disconnect).not.toHaveBeenCalled();

      unsub2();
      expect(client.subscriptionCount).toBe(0);
      expect(mockSocket.disconnect).toHaveBeenCalledTimes(1);
      expect(client.connectionState).toBe('disconnected');
    });

    it('disconnects and clears state on client.disconnect() and logout', () => {
      const client = createRealtimeClient({
        socket: mockSocket,
        token: 'token_1',
        userId: 'usr_1',
      });

      client.subscribe('nft.updated', vi.fn());
      expect(client.subscriptionCount).toBe(1);

      client.setAuthToken(null);
      expect(client.subscriptionCount).toBe(0);
      expect(client.getAuthToken()).toBeNull();
      expect(client.getUserId()).toBeNull();
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });
});
