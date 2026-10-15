export const SINGLETON_PROBE_KEY = Symbol.for('nft.singleton.probe');

export interface ProbeEvent {
  caller: string;
  count: number;
}

export interface SingletonProbe {
  readonly id: symbol;
  increment: (caller?: string) => number;
  getCount: () => number;
  reset: () => void;
  getEvents: () => ReadonlyArray<ProbeEvent>;
}

const globalRef =
  typeof globalThis !== 'undefined'
    ? (globalThis as typeof globalThis & Record<symbol, SingletonProbe>)
    : undefined;

const existingProbe = globalRef ? globalRef[SINGLETON_PROBE_KEY] : undefined;

let count = 0;
const events: ProbeEvent[] = [];

const localProbe: SingletonProbe = {
  id: SINGLETON_PROBE_KEY,
  increment(caller = 'anonymous'): number {
    count += 1;
    events.push({ caller, count });
    return count;
  },
  getCount(): number {
    return count;
  },
  reset(): void {
    count = 0;
    events.length = 0;
  },
  getEvents(): ReadonlyArray<ProbeEvent> {
    return [...events];
  },
};

export const singletonProbe: SingletonProbe = existingProbe ?? localProbe;

if (globalRef && !existingProbe) {
  globalRef[SINGLETON_PROBE_KEY] = singletonProbe;
}

