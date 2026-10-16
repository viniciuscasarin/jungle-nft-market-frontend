import { ws } from 'msw';
import { toSocketIo } from '@mswjs/socket.io-binding';
import { getMockEventBus } from '@nft/mocks-core';

export interface MockRealtimeEvent<T = unknown> {
  id: string;
  type: string;
  resource: { kind: string; id: string };
  version: number;
  occurredAt: string;
  userId?: string;
  payload: T;
}

export interface ConnectedSocketIoClient {
  client: ReturnType<typeof toSocketIo>['client'];
  rawClient: ReturnType<typeof toSocketIo>['rawClient'];
}

export const socketInterceptor = ws.link(/\/socket\.io\//);

const connectedClients = new Set<ConnectedSocketIoClient>();
let unsubscribeEventBus: (() => void) | null = null;

export function getActiveSocketClientsCount(): number {
  return connectedClients.size;
}

export function disconnectAllSocketClients(
  code = 1000,
  reason = 'Simulated disconnect'
): void {
  for (const entry of Array.from(connectedClients)) {
    try {
      entry.rawClient.close(code, reason);
    } catch {
      // Ignore already closed connections
    }
    connectedClients.delete(entry);
  }
}

export function broadcastRealtimeEvent(event: string, payload: unknown): void {
  for (const entry of Array.from(connectedClients)) {
    try {
      entry.client.emit(event, payload);
    } catch {
      // Ignore broadcast errors on dead connections
    }
  }
}

export function bindMockEventBusToSocket(): () => void {
  if (unsubscribeEventBus) {
    return unsubscribeEventBus;
  }

  const bus = getMockEventBus();
  const unsubs = [
    bus.subscribe('nft.updated', (envelope) => {
      broadcastRealtimeEvent('nft.updated', envelope.data ?? envelope);
    }),
    bus.subscribe('order.updated', (envelope) => {
      broadcastRealtimeEvent('order.updated', envelope.data ?? envelope);
    }),
    bus.subscribe('socket.disconnect', () => {
      disconnectAllSocketClients(1000, 'Simulated socket disconnect');
    }),
  ];

  unsubscribeEventBus = () => {
    for (const unsub of unsubs) {
      unsub();
    }
    unsubscribeEventBus = null;
  };

  return unsubscribeEventBus;
}

export function createMockSocketHandler(
  onConnection?: (socketIo: ReturnType<typeof toSocketIo>) => void
) {
  bindMockEventBusToSocket();

  return socketInterceptor.addEventListener('connection', (connection) => {
    const duplex = toSocketIo(connection);
    const entry: ConnectedSocketIoClient = {
      client: duplex.client,
      rawClient: duplex.rawClient,
    };
    connectedClients.add(entry);

    duplex.rawClient.addEventListener('close', () => {
      connectedClients.delete(entry);
    });

    onConnection?.(duplex);
  });
}

// Automatically bind default socket connection listener and event bus relay
export const socketHandler = createMockSocketHandler();
