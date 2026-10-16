import { describe, it, expect, beforeEach } from 'vitest';
import {
  createControlledClock,
  createSystemClock,
  createClock,
  getClock,
  setClock,
  resetClock,
  DEFAULT_CONTROLLED_START,
} from './clock';

describe('Clock abstraction', () => {
  beforeEach(() => {
    resetClock();
  });

  describe('controlled clock', () => {
    it('initializes with default start date when none provided', () => {
      const clock = createControlledClock();
      expect(clock.mode).toBe('controlled');
      expect(clock.toISOString()).toBe(DEFAULT_CONTROLLED_START);
      expect(clock.now().toISOString()).toBe(DEFAULT_CONTROLLED_START);
      expect(clock.nowMs()).toBe(new Date(DEFAULT_CONTROLLED_START).getTime());
    });

    it('initializes with custom start date', () => {
      const customStart = '2026-06-15T12:00:00.000Z';
      const clock = createControlledClock(customStart);
      expect(clock.toISOString()).toBe(customStart);
      expect(clock.nowMs()).toBe(new Date(customStart).getTime());
    });

    it('advances time deterministically by specified ms', () => {
      const clock = createControlledClock('2026-01-01T00:00:00.000Z');
      const advanced = clock.advance(5000);
      expect(advanced.toISOString()).toBe('2026-01-01T00:00:05.000Z');
      expect(clock.now().toISOString()).toBe('2026-01-01T00:00:05.000Z');
      expect(clock.nowMs()).toBe(new Date('2026-01-01T00:00:05.000Z').getTime());
    });

    it('sets time to explicit date or timestamp', () => {
      const clock = createControlledClock('2026-01-01T00:00:00.000Z');
      const target = '2026-12-31T23:59:59.000Z';
      const result = clock.set(target);
      expect(result.toISOString()).toBe(target);
      expect(clock.toISOString()).toBe(target);
    });
  });

  describe('system clock', () => {
    it('creates system clock with system mode and tracks current time', () => {
      const clock = createSystemClock();
      expect(clock.mode).toBe('system');
      const now = Date.now();
      expect(Math.abs(clock.nowMs() - now)).toBeLessThan(100);
    });

    it('supports advance and set on system clock via offset', () => {
      const clock = createSystemClock();
      const initialMs = clock.nowMs();
      clock.advance(10000);
      expect(clock.nowMs() - initialMs).toBeGreaterThanOrEqual(9900);
    });
  });

  describe('global clock management', () => {
    it('provides getClock, setClock, and resetClock', () => {
      const custom = createControlledClock('2025-01-01T00:00:00.000Z');
      setClock(custom);
      expect(getClock().toISOString()).toBe('2025-01-01T00:00:00.000Z');

      resetClock();
      expect(getClock().toISOString()).toBe(DEFAULT_CONTROLLED_START);
    });

    it('createClock factory creates controlled and system clocks', () => {
      const controlled = createClock('controlled', '2026-02-01T00:00:00.000Z');
      expect(controlled.mode).toBe('controlled');
      expect(controlled.toISOString()).toBe('2026-02-01T00:00:00.000Z');

      const system = createClock('system');
      expect(system.mode).toBe('system');
    });
  });
});
