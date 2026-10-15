import { ws } from 'msw';
import { toSocketIo } from '@mswjs/socket.io-binding';

export interface MockRealtimeEvent<T = unknown> {
  id: string;
  type: string;
  resource: { kind: string; id: string };
  version: number;
  occurredAt: string;
  userId?: string;
  payload: T;
}

export const socketInterceptor = ws.link('wss://*');

export function createMockSocketHandler(
  onConnection?: (socketIo: ReturnType<typeof toSocketIo>) => void,
) {
  return socketInterceptor.addEventListener('connection', (connection) => {
    const socketIo = toSocketIo(connection);
    onConnection?.(socketIo);
  });
}
