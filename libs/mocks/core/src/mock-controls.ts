import type {
  NftUpdatedEvent,
  OrderUpdatedEvent,
  RealtimeEnvelope,
} from '@nft/shared-contracts';
import {
  type MockDatabaseState,
  getMockDatabase,
  resetMockDatabase,
  transaction,
  getStorageAdapter,
} from './database';
import {
  type ScenarioId,
  isValidScenarioId,
  applyScenario,
} from './scenarios';
import {
  type NetworkProfile,
  getNetworkProfile,
  setNetworkProfile,
} from './network-profile';
import { getClock } from './clock';
import { getMockEventBus, type MockEventBus } from './event-bus';
import {
  type EmitNftUpdatedInput,
  type EmitOrderUpdatedInput,
  type EmitStaleEventInput,
  emitNftUpdated,
  emitOrderUpdated,
  emitDuplicateEvent,
  emitStaleEvent,
  resetRealtimeTriggerState,
  simulateSocketDisconnect,
  simulateSocketReconnect,
} from './realtime-triggers';

export const SCENARIO_STORAGE_KEY = 'nft-mocks:v1:scenario';

export interface MockControls {
  getState(): MockDatabaseState;
  getScenario(): ScenarioId;
  setScenario(scenarioId: ScenarioId): void;
  reset(): void;
  setNetworkProfile(profile: NetworkProfile): void;
  getNetworkProfile(): NetworkProfile;
  expireSession(): void;
  advanceClock(ms: number): Date;
  setFlag(flag: string, value: boolean): void;
  getFlag(flag: string): boolean | undefined;
  emitNftUpdated(input?: EmitNftUpdatedInput): NftUpdatedEvent;
  emitOrderUpdated(input?: EmitOrderUpdatedInput): OrderUpdatedEvent;
  emitDuplicateEvent(customEnvelope?: RealtimeEnvelope): RealtimeEnvelope;
  emitStaleEvent(input?: EmitStaleEventInput): RealtimeEnvelope;
  simulateSocketDisconnect(): void;
  simulateSocketReconnect(): void;
  events: MockEventBus;
}

const runtimeFlags = new Map<string, boolean>();

export function resolveActiveScenario(): { scenarioId: ScenarioId; resetRequested: boolean } {
  let urlScenario: ScenarioId | null = null;
  let resetRequested = false;

  // 1. Check URL parameters
  if (typeof window !== 'undefined' && window.location) {
    try {
      const url = new URL(window.location.href);
      const scenarioParam = url.searchParams.get('scenario');
      if (scenarioParam && isValidScenarioId(scenarioParam)) {
        urlScenario = scenarioParam;
      }

      if (url.searchParams.get('reset') === '1' || url.searchParams.get('reset') === 'true') {
        resetRequested = true;
      }

      // Sanitization: clean ?scenario and ?reset from URL via history.replaceState
      if (scenarioParam || url.searchParams.has('reset')) {
        url.searchParams.delete('scenario');
        url.searchParams.delete('reset');
        const cleanSearch = url.searchParams.toString();
        const cleanUrl = `${url.pathname}${cleanSearch ? `?${cleanSearch}` : ''}${url.hash}`;
        window.history.replaceState(window.history.state, '', cleanUrl);
      }
    } catch {
      // In non-browser / mock environment where URL parsing might fail
    }
  }

  if (urlScenario) {
    try {
      getStorageAdapter().setItem(SCENARIO_STORAGE_KEY, urlScenario);
    } catch {
      // Storage unavailable
    }
    return { scenarioId: urlScenario, resetRequested };
  }

  // 2. Persisted runtime selection in storage
  try {
    const stored = getStorageAdapter().getItem(SCENARIO_STORAGE_KEY);
    if (stored && isValidScenarioId(stored)) {
      return { scenarioId: stored, resetRequested };
    }
  } catch {
    // Ignore storage read error
  }

  // 3. VITE_DEFAULT_SCENARIO env variable
  let envScenario: string | undefined;
  if (typeof process !== 'undefined' && process.env?.['VITE_DEFAULT_SCENARIO']) {
    envScenario = process.env['VITE_DEFAULT_SCENARIO'];
  } else if (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: { VITE_DEFAULT_SCENARIO?: string } }).env?.VITE_DEFAULT_SCENARIO) {
    envScenario = (import.meta as unknown as { env: { VITE_DEFAULT_SCENARIO: string } }).env.VITE_DEFAULT_SCENARIO;
  }

  if (envScenario && isValidScenarioId(envScenario)) {
    return { scenarioId: envScenario, resetRequested };
  }

  // 4. Default fallback
  return { scenarioId: 'default', resetRequested };
}

export function createMockControls(): MockControls {
  return {
    getState: () => getMockDatabase(),
    getScenario: () => getMockDatabase().scenarioId as ScenarioId,
    setScenario: (scenarioId: ScenarioId) => {
      applyScenario(scenarioId);
      resetRealtimeTriggerState();
      try {
        getStorageAdapter().setItem(SCENARIO_STORAGE_KEY, scenarioId);
      } catch {
        // Storage unavailable
      }
    },
    reset: () => {
      resetMockDatabase();
      resetRealtimeTriggerState();
    },
    setNetworkProfile: (profile: NetworkProfile) => setNetworkProfile(profile),
    getNetworkProfile: () => getNetworkProfile(),
    expireSession: () => {
      transaction((db) => {
        for (const s of db.sessions) {
          s.expiresAt = new Date(Date.now() - 1000).toISOString();
        }
      });
    },
    advanceClock: (ms: number) => getClock().advance(ms),
    setFlag: (flag: string, value: boolean) => {
      runtimeFlags.set(flag, value);
    },
    getFlag: (flag: string) => runtimeFlags.get(flag),
    emitNftUpdated: (input?: EmitNftUpdatedInput) => emitNftUpdated(input),
    emitOrderUpdated: (input?: EmitOrderUpdatedInput) => emitOrderUpdated(input),
    emitDuplicateEvent: (customEnvelope?: RealtimeEnvelope) => emitDuplicateEvent(customEnvelope),
    emitStaleEvent: (input?: EmitStaleEventInput) => emitStaleEvent(input),
    simulateSocketDisconnect: () => simulateSocketDisconnect(),
    simulateSocketReconnect: () => simulateSocketReconnect(),
    events: getMockEventBus(),
  };
}

export function exposeMockControls(controls?: MockControls): MockControls {
  const activeControls = controls ?? createMockControls();
  if (typeof window !== 'undefined') {
    const win = window as unknown as {
      __mocks?: MockControls;
      __NFT_MOCK_CONTROL__?: MockControls;
    };
    win.__mocks = activeControls;
    win.__NFT_MOCK_CONTROL__ = activeControls;
  }
  return activeControls;
}

