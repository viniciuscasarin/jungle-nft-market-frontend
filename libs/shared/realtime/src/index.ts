import { io, type Socket } from 'socket.io-client';

export type RealtimeClient = Socket;

export interface RealtimeConfig {
  url?: string;
  autoConnect?: boolean;
}

export function createRealtimeClient(config: RealtimeConfig = {}): RealtimeClient {
  const socketUrl =
    config.url || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4200');
  return io(socketUrl, {
    autoConnect: config.autoConnect ?? true,
    transports: ['websocket', 'polling'],
  });
}

export type { Socket };
