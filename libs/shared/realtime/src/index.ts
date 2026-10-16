import { io, type Socket } from 'socket.io-client';
import {
  RealtimeEnvelopeSchema,
  isDuplicate,
  isStale,
  type RealtimeEnvelope,
  type NftUpdatedEvent,
  type OrderUpdatedEvent,
} from '@nft/shared-contracts';

export type RealtimeEventHandler<T = unknown> = (data: T) => void;

export type ConnectionState =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected';

export interface RealtimeClient {
  readonly socket: Socket;
  readonly subscriptionCount: number;
  readonly connected: boolean;
  readonly connectionState: ConnectionState;
  auth: { token?: string | null; userId?: string | null; [key: string]: unknown };
  setAuthToken(token: string | null, userId?: string | null): void;
  getAuthToken(): string | null;
  getUserId(): string | null;
  subscribe<T = unknown>(event: string, handler: RealtimeEventHandler<T>): () => void;
  onConnectionStateChange(listener: (state: ConnectionState) => void): () => void;
  onReconnect(listener: () => void): () => void;
  connect(): void;
  disconnect(): void;
  on(event: string, listener: (...args: unknown[]) => void): this;
  off(event: string, listener: (...args: unknown[]) => void): this;
  emit(event: string, ...args: unknown[]): this;
}

export interface RealtimeConfig {
  url?: string;
  autoConnect?: boolean;
  token?: string | null;
  userId?: string | null;
  socket?: Socket;
}

/**
 * Normalizes incoming payloads tolerantly to match RealtimeEnvelopeSchema.
 * Supports legacy/alternate format: { resource: { kind, id }, occurredAt }.
 */
export function normalizeRealtimeEnvelope(raw: unknown): RealtimeEnvelope | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const candidate = { ...(raw as Record<string, unknown>) };

  if (
    candidate['resource'] &&
    typeof candidate['resource'] === 'object' &&
    candidate['resource'] !== null
  ) {
    const resObj = candidate['resource'] as { kind?: string; id?: string };
    if (resObj.kind) {
      candidate['resource'] = resObj.kind;
    }
    if (resObj.id && !candidate['resourceId']) {
      candidate['resourceId'] = resObj.id;
    }
  }

  if (candidate['occurredAt'] && !candidate['timestamp']) {
    candidate['timestamp'] = candidate['occurredAt'];
  }

  const parsed = RealtimeEnvelopeSchema.safeParse(candidate);
  if (parsed.success) {
    return parsed.data;
  }

  return null;
}

export function createRealtimeClient(config: RealtimeConfig = {}): RealtimeClient {
  const socketUrl =
    config.url ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4200');

  let currentToken: string | null = config.token ?? null;
  let currentUserId: string | null = config.userId ?? null;
  let subscriptionCount = 0;
  let connectionState: ConnectionState = 'disconnected';

  const processedEventIds = new Set<string>();
  const resourceVersionMap = new Map<string, number>();

  const stateChangeListeners = new Set<(state: ConnectionState) => void>();
  const reconnectListeners = new Set<() => void>();
  const registeredHandlers = new Map<string, Set<RealtimeEventHandler<unknown>>>();
  const socketEventWrappers = new Map<string, (...args: unknown[]) => void>();

  function setConnectionState(newState: ConnectionState): void {
    if (connectionState === newState) return;
    connectionState = newState;
    for (const listener of stateChangeListeners) {
      try {
        listener(newState);
      } catch {
        // Ignore listener error
      }
    }
  }

  const socketOptions = {
    autoConnect: false,
    transports: ['websocket'] as ('websocket')[],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    ...(currentToken ? { auth: { token: currentToken, userId: currentUserId } } : {}),
  };

  const socket: Socket = config.socket ?? io(socketUrl, socketOptions);

  function handleIncomingEnvelope(raw: unknown): void {
    const envelope = normalizeRealtimeEnvelope(raw);
    if (!envelope) {
      return;
    }

    // 1. User Isolation check for private events (order.updated or envelope with userId)
    if (envelope.type === 'order.updated' || 'userId' in envelope) {
      const targetUserId = (envelope as { userId?: string }).userId;
      if (!currentUserId || targetUserId !== currentUserId) {
        return;
      }
    }

    // 2. Deduplication check
    if (isDuplicate(envelope.id, processedEventIds)) {
      return;
    }
    processedEventIds.add(envelope.id);
    if (processedEventIds.size > 2000) {
      const oldest = processedEventIds.values().next().value;
      if (oldest) processedEventIds.delete(oldest);
    }

    // 3. Monotonic Versioning per resource (nft:<id> or order:<id>)
    const resourceKey = `${envelope.resource}:${envelope.resourceId}`;
    const lastVersion = resourceVersionMap.get(resourceKey) ?? -1;

    if (isStale(envelope.version, lastVersion)) {
      return;
    }
    resourceVersionMap.set(resourceKey, envelope.version);

    // 4. Dispatch to subscribers of this event
    const handlers = registeredHandlers.get(envelope.type);
    if (handlers) {
      for (const handler of Array.from(handlers)) {
        try {
          handler(envelope);
        } catch {
          // Ignore subscriber error
        }
      }
    }
  }

  // Bind socket lifecycle listeners
  socket.on('connect', () => {
    setConnectionState('connected');
  });

  socket.on('disconnect', () => {
    setConnectionState('disconnected');
  });

  socket.on('reconnect_attempt', () => {
    setConnectionState('reconnecting');
  });

  socket.on('reconnect', () => {
    setConnectionState('connected');
    for (const listener of reconnectListeners) {
      try {
        listener();
      } catch {
        // Ignore reconnect listener error
      }
    }
  });

  socket.on('connect_error', () => {
    if (connectionState !== 'reconnecting') {
      setConnectionState('disconnected');
    }
  });

  const authTarget: { token?: string | null; userId?: string | null; [key: string]: unknown } = {
    token: currentToken,
    userId: currentUserId,
  };

  const client: RealtimeClient = {
    get socket() {
      return socket;
    },
    get subscriptionCount() {
      return subscriptionCount;
    },
    get connected() {
      return socket.connected;
    },
    get connectionState() {
      return connectionState;
    },
    auth: new Proxy(authTarget, {
      set(target, prop, value) {
        target[prop as string] = value;
        if (prop === 'token') {
          client.setAuthToken(value as string | null, target.userId);
        } else if (prop === 'userId') {
          client.setAuthToken(target.token ?? null, value as string | null);
        }
        return true;
      },
    }),
    setAuthToken(token: string | null, userId?: string | null) {
      const prevUserId = currentUserId;
      currentToken = token;
      currentUserId = userId ?? null;
      authTarget.token = token;
      authTarget.userId = currentUserId;

      if (socket.auth && typeof socket.auth === 'object') {
        const authObj = socket.auth as Record<string, unknown>;
        authObj['token'] = token ?? undefined;
        authObj['userId'] = currentUserId ?? undefined;
      } else {
        socket.auth = { token, userId: currentUserId };
      }

      // If user changed or logged out, clear user isolation tracking
      if (!token || (userId && userId !== prevUserId)) {
        resourceVersionMap.clear();
      }

      if (token) {
        if (subscriptionCount > 0 && !socket.connected) {
          setConnectionState('connecting');
          socket.connect();
        }
      } else {
        // Logout disconnects socket and cleans subscriptions
        client.disconnect();
      }
    },
    getAuthToken() {
      return currentToken;
    },
    getUserId() {
      return currentUserId;
    },
    onConnectionStateChange(listener: (state: ConnectionState) => void) {
      stateChangeListeners.add(listener);
      listener(connectionState);
      return () => {
        stateChangeListeners.delete(listener);
      };
    },
    onReconnect(listener: () => void) {
      reconnectListeners.add(listener);
      return () => {
        reconnectListeners.delete(listener);
      };
    },
    subscribe<T = unknown>(event: string, handler: RealtimeEventHandler<T>): () => void {
      subscriptionCount++;

      let handlers = registeredHandlers.get(event);
      if (!handlers) {
        handlers = new Set();
        registeredHandlers.set(event, handlers);

        const socketWrapper = (raw: unknown) => {
          handleIncomingEnvelope(raw);
        };
        socketEventWrappers.set(event, socketWrapper);
        socket.on(event, socketWrapper);
      }

      const castedHandler = handler as RealtimeEventHandler<unknown>;
      handlers.add(castedHandler);

      // Connect on demand for active subscriptions (including visitors for public events)
      if (!socket.connected) {
        setConnectionState('connecting');
        socket.connect();
      }

      let unsubscribed = false;
      return () => {
        if (unsubscribed) return;
        unsubscribed = true;

        handlers.delete(castedHandler);
        if (handlers.size === 0) {
          registeredHandlers.delete(event);
          const wrapper = socketEventWrappers.get(event);
          if (wrapper) {
            socket.off(event, wrapper);
            socketEventWrappers.delete(event);
          }
        }

        subscriptionCount = Math.max(0, subscriptionCount - 1);

        // Auto disconnect when active subscriptions count reaches zero
        if (subscriptionCount === 0) {
          socket.disconnect();
          setConnectionState('disconnected');
        }
      };
    },
    connect() {
      if (!socket.connected) {
        setConnectionState('connecting');
        socket.connect();
      }
    },
    disconnect() {
      for (const [event, wrapper] of socketEventWrappers.entries()) {
        socket.off(event, wrapper);
      }
      socketEventWrappers.clear();
      registeredHandlers.clear();
      subscriptionCount = 0;
      processedEventIds.clear();
      resourceVersionMap.clear();

      socket.disconnect();
      setConnectionState('disconnected');
    },
    on(event: string, listener: (...args: unknown[]) => void) {
      socket.on(event, listener);
      return this;
    },
    off(event: string, listener: (...args: unknown[]) => void) {
      socket.off(event, listener);
      return this;
    },
    emit(event: string, ...args: unknown[]) {
      socket.emit(event, ...args);
      return this;
    },
  };

  // If explicit autoConnect was set to true, connect initially
  if (config.autoConnect) {
    setConnectionState('connecting');
    socket.connect();
  }

  return client;
}

export type { Socket, RealtimeEnvelope, NftUpdatedEvent, OrderUpdatedEvent };
