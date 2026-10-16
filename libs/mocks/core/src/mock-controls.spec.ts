import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  resolveActiveScenario,
  createMockControls,
  exposeMockControls,
  SCENARIO_STORAGE_KEY,
} from './mock-controls';
import {
  getMockDatabase,
  resetMockDatabase,
  setStorageAdapter,
} from './database';
import { MemoryStorageAdapter } from './storage';
import { scenarioRegistry } from './scenarios';

describe('Scenario Selection Precedence & MockControls', () => {
  let memoryStorage: MemoryStorageAdapter;

  beforeEach(() => {
    memoryStorage = new MemoryStorageAdapter();
    setStorageAdapter(memoryStorage);
    resetMockDatabase();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Precedence & URL Sanitization', () => {
    it('prioritizes URL parameter over storage, sanitizing URL with replaceState', () => {
      // Storage has 'empty'
      memoryStorage.setItem(SCENARIO_STORAGE_KEY, 'empty');

      // Mock window location and history
      const originalLocation = window.location;
      const originalHistory = window.history;

      const replaceStateSpy = vi.fn();
      Object.defineProperty(window, 'location', {
        value: new URL('http://localhost:3000/?scenario=slow-network&reset=1&tab=nfts'),
        writable: true,
      });
      Object.defineProperty(window, 'history', {
        value: { replaceState: replaceStateSpy, state: {} },
        writable: true,
      });

      const { scenarioId, resetRequested } = resolveActiveScenario();

      expect(scenarioId).toBe('slow-network');
      expect(resetRequested).toBe(true);
      expect(replaceStateSpy).toHaveBeenCalledWith(
        {},
        '',
        '/?tab=nfts'
      );


      // Restore
      window.location = originalLocation;
      window.history = originalHistory;
    });

    it('falls back to stored scenario when URL parameter is missing', () => {
      memoryStorage.setItem(SCENARIO_STORAGE_KEY, 'variable-latency');

      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        value: new URL('http://localhost:3000/?tab=nfts'),
        writable: true,
      });

      const { scenarioId } = resolveActiveScenario();
      expect(scenarioId).toBe('variable-latency');

      window.location = originalLocation;
    });

    it('falls back to default scenario when storage and URL are empty', () => {
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        value: new URL('http://localhost:3000/'),
        writable: true,
      });

      const { scenarioId } = resolveActiveScenario();
      expect(scenarioId).toBe('default');

      window.location = originalLocation;
    });
  });

  describe('MockControls Manipulation', () => {
    it('provides complete control interface on window.__mocks', () => {
      const controls = createMockControls();
      exposeMockControls(controls);

      const win = window as unknown as { __mocks: typeof controls };
      expect(win.__mocks).toBeDefined();

      // Test scenario switching
      win.__mocks.setScenario('empty');
      expect(win.__mocks.getScenario()).toBe('empty');
      expect(win.__mocks.getState().nfts.length).toBe(0);

      // Test reset
      win.__mocks.reset();
      expect(win.__mocks.getState().scenarioId).toBe('empty');

      // Test network profile
      win.__mocks.setNetworkProfile({
        id: 'custom',
        name: 'Custom',
        rules: [],
      });
      expect(win.__mocks.getNetworkProfile().id).toBe('custom');

      // Test expireSession
      const db = getMockDatabase();
      db.sessions.push({
        token: 'active_token',
        user: db.users[0]!,
        expiresAt: '2099-01-01T00:00:00.000Z',
      });
      win.__mocks.expireSession();
      const updatedSession = getMockDatabase().sessions[0];
      expect(new Date(updatedSession!.expiresAt).getTime()).toBeLessThan(Date.now());

      // Test advanceClock
      const advanced = win.__mocks.advanceClock(60000);
      expect(advanced).toBeInstanceOf(Date);

      // Test runtime flags
      win.__mocks.setFlag('testFlag', true);
      expect(win.__mocks.getFlag('testFlag')).toBe(true);

      // Test event bus
      const eventSpy = vi.fn();
      const unsubscribe = win.__mocks.events.subscribe('order:created', eventSpy);
      win.__mocks.events.emit({
        id: 'ev_1',
        event: 'order:created',
        data: { orderId: 'ord_123' },
        timestamp: new Date().toISOString(),
      });
      expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({ id: 'ev_1' }));
      unsubscribe();
    });

    it('contains all 16 required scenario definitions in the registry', () => {
      const requiredScenarios = [
        'default',
        'empty',
        'slow-network',
        'variable-latency',
        'out-of-order',
        'connection-down',
        'http-4xx',
        'http-5xx',
        'recovering-5xx',
        'session-expired',
        'forbidden-access',
        'price-changed-at-checkout',
        'sold-out-at-checkout',
        'order-timeout-after-create',
        'payment-confirmed',
        'payment-rejected',
      ];

      for (const id of requiredScenarios) {
        expect(scenarioRegistry[id as keyof typeof scenarioRegistry]).toBeDefined();
        const def = scenarioRegistry[id as keyof typeof scenarioRegistry];
        expect(def.id).toBe(id);
        expect(typeof def.name).toBe('string');
        expect(typeof def.description).toBe('string');
      }
    });
  });
});
