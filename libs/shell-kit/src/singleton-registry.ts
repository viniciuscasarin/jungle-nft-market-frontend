export const SINGLETON_REGISTRY_KEY = Symbol.for('nft.singleton.registry');

export type SingletonKey =
  | 'queryClient'
  | 'httpClient'
  | 'realtimeClient'
  | 'serviceWorker'
  | (string & {});

export interface SingletonRegistry {
  readonly id: symbol;
  register: <T>(key: SingletonKey, instance: T) => T;
  assertSingleton: <T>(key: SingletonKey, instance: T) => T;
  get: <T>(key: SingletonKey) => T | undefined;
  has: (key: SingletonKey) => boolean;
  getAll: () => ReadonlyMap<string, unknown>;
  verify: () => { valid: boolean; keys: string[] };
  reset: () => void;
}

const instances = new Map<string, unknown>();

const localRegistry: SingletonRegistry = {
  id: SINGLETON_REGISTRY_KEY,
  register<T>(key: SingletonKey, instance: T): T {
    return this.assertSingleton(key, instance);
  },
  assertSingleton<T>(key: SingletonKey, instance: T): T {
    const existing = instances.get(key);
    if (existing !== undefined && existing !== instance) {
      throw new Error(
        `Duplicate singleton detected for "${key}". Exactly one instance is allowed in the runtime.`,
      );
    }
    if (existing === undefined) {
      instances.set(key, instance);
    }
    return instance;
  },
  get<T>(key: SingletonKey): T | undefined {
    return instances.get(key) as T | undefined;
  },
  has(key: SingletonKey): boolean {
    return instances.has(key);
  },
  getAll(): ReadonlyMap<string, unknown> {
    return new Map(instances);
  },
  verify(): { valid: boolean; keys: string[] } {
    return {
      valid: true,
      keys: Array.from(instances.keys()),
    };
  },
  reset(): void {
    instances.clear();
  },
};

const globalRef =
  typeof globalThis !== 'undefined'
    ? (globalThis as typeof globalThis & Record<symbol, SingletonRegistry>)
    : undefined;

const existingRegistry = globalRef ? globalRef[SINGLETON_REGISTRY_KEY] : undefined;

export const singletonRegistry: SingletonRegistry =
  existingRegistry ?? localRegistry;

if (globalRef && !existingRegistry) {
  globalRef[SINGLETON_REGISTRY_KEY] = singletonRegistry;
}
