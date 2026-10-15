export type MockScenario =
  | 'default'
  | 'empty'
  | 'latency'
  | 'error'
  | 'session-expired'
  | 'unauthorized'
  | 'conflict'
  | 'payment-confirmed'
  | 'payment-rejected'
  | 'price-changed'
  | 'sold-out';

export interface MockState {
  scenario: MockScenario;
  latencyMs: number;
  isOffline: boolean;
  version: number;
}

export const initialMockState: MockState = {
  scenario: 'default',
  latencyMs: 150,
  isOffline: false,
  version: 1,
};

let currentState: MockState = { ...initialMockState };

export function getMockState(): MockState {
  return { ...currentState };
}

export function setMockScenario(scenario: MockScenario): void {
  currentState.scenario = scenario;
}

export function setMockLatency(latencyMs: number): void {
  currentState.latencyMs = latencyMs;
}

export function resetMockState(): void {
  currentState = { ...initialMockState };
}
