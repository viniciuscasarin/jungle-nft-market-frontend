import { describe, it, expect, beforeEach } from 'vitest';
import {
  getMockState,
  setMockScenario,
  setMockLatency,
  resetMockState,
  initialMockState,
} from './index';

describe('mocks-core public exports', () => {
  beforeEach(() => {
    resetMockState();
  });

  it('exports state management and scenarios functions', () => {
    expect(getMockState()).toEqual(initialMockState);
    setMockScenario('empty');
    expect(getMockState().scenario).toBe('empty');
    setMockLatency(300);
    expect(getMockState().latencyMs).toBe(300);
    resetMockState();
    expect(getMockState()).toEqual(initialMockState);
  });
});
