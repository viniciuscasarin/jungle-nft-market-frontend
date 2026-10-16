export interface MockEventEnvelope<T = unknown> {
  id: string;
  event: string;
  data: T;
  timestamp: string;
  userId?: string;
  version?: number;
}

export type MockEventListener<T = unknown> = (envelope: MockEventEnvelope<T>) => void;

export interface MockEventBus {
  emit<T = unknown>(envelope: MockEventEnvelope<T>): void;
  subscribe<T = unknown>(event: string, listener: MockEventListener<T>): () => void;
  clear(): void;
}

export class InMemoryMockEventBus implements MockEventBus {
  private listeners = new Map<string, Set<MockEventListener<unknown>>>();

  emit<T = unknown>(envelope: MockEventEnvelope<T>): void {
    const handlers = this.listeners.get(envelope.event);
    if (handlers) {
      for (const listener of handlers) {
        try {
          listener(envelope as MockEventEnvelope<unknown>);
        } catch (err) {
          console.error(`[MockEventBus] Error in listener for event "${envelope.event}":`, err);
        }
      }
    }
  }

  subscribe<T = unknown>(event: string, listener: MockEventListener<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const handlers = this.listeners.get(event)!;
    const castedListener = listener as MockEventListener<unknown>;
    handlers.add(castedListener);

    return () => {
      handlers.delete(castedListener);
      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  clear(): void {
    this.listeners.clear();
  }
}

let activeEventBus: MockEventBus = new InMemoryMockEventBus();

export function getMockEventBus(): MockEventBus {
  return activeEventBus;
}

export function setMockEventBus(bus: MockEventBus): void {
  activeEventBus = bus;
}
