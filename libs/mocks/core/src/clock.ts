export type ClockMode = 'system' | 'controlled';

export interface Clock {
  readonly mode: ClockMode;
  now(): Date;
  nowMs(): number;
  toISOString(): string;
  advance(ms: number): Date;
  set(date: Date | string | number): Date;
}

export const DEFAULT_CONTROLLED_START = '2026-01-01T00:00:00.000Z';

export function createControlledClock(start: Date | string | number = DEFAULT_CONTROLLED_START): Clock {
  let currentMs = new Date(start).getTime();

  return {
    mode: 'controlled',
    now: () => new Date(currentMs),
    nowMs: () => currentMs,
    toISOString: () => new Date(currentMs).toISOString(),
    advance: (ms: number) => {
      currentMs += ms;
      return new Date(currentMs);
    },
    set: (date: Date | string | number) => {
      currentMs = new Date(date).getTime();
      return new Date(currentMs);
    },
  };
}

export function createSystemClock(): Clock {
  let offsetMs = 0;
  return {
    mode: 'system',
    now: () => new Date(Date.now() + offsetMs),
    nowMs: () => Date.now() + offsetMs,
    toISOString: () => new Date(Date.now() + offsetMs).toISOString(),
    advance: (ms: number) => {
      offsetMs += ms;
      return new Date(Date.now() + offsetMs);
    },
    set: (date: Date | string | number) => {
      const targetMs = new Date(date).getTime();
      offsetMs = targetMs - Date.now();
      return new Date(Date.now() + offsetMs);
    },
  };
}

export function createClock(mode: ClockMode = 'controlled', start?: Date | string | number): Clock {
  if (mode === 'system') {
    return createSystemClock();
  }
  return createControlledClock(start);
}

let activeClock: Clock = createControlledClock();

export function getClock(): Clock {
  return activeClock;
}

export function setClock(clock: Clock): void {
  activeClock = clock;
}

export function resetClock(start: Date | string | number = DEFAULT_CONTROLLED_START): void {
  activeClock = createControlledClock(start);
}
