export interface Prng {
  readonly seed: number;
  next(): number;
  int(min: number, max: number): number;
  pick<T>(array: readonly T[]): T;
  uuid(): string;
  token(length?: number): string;
  txHash(): string;
  address(): string;
  reseed(seed: number): void;
}

export const DEFAULT_PRNG_SEED = 0x6d2b79f5;

export function createMulberry32(initialSeed: number = DEFAULT_PRNG_SEED): Prng {
  let currentSeed = initialSeed >>> 0;

  function next(): number {
    let t = (currentSeed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function int(min: number, max: number): number {
    const low = Math.ceil(min);
    const high = Math.floor(max);
    return Math.floor(next() * (high - low + 1)) + low;
  }

  function pick<T>(array: readonly T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot pick an element from an empty array');
    }
    const index = int(0, array.length - 1);
    const item = array[index];
    if (item === undefined) {
      throw new Error(`Failed to pick item at index ${index}`);
    }
    return item;
  }

  function hex(length: number): string {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[int(0, 15)];
    }
    return result;
  }

  function uuid(): string {
    const s4 = () => hex(4);
    const s8 = () => hex(8);
    const s12 = () => hex(12);

    const clockSeqHi = ((int(0, 15) & 0x3) | 0x8).toString(16);
    const clockSeqLow = hex(3);

    return `${s8()}-${s4()}-4${hex(3)}-${clockSeqHi}${clockSeqLow}-${s12()}`;
  }

  function token(length = 32): string {
    return hex(length);
  }

  function txHash(): string {
    return `0x${hex(64)}`;
  }

  function address(): string {
    return `0x${hex(40)}`;
  }

  function reseed(newSeed: number): void {
    currentSeed = newSeed >>> 0;
  }

  return {
    get seed() {
      return currentSeed;
    },
    next,
    int,
    pick,
    uuid,
    token,
    txHash,
    address,
    reseed,
  };
}

let activePrng: Prng = createMulberry32();

export function getPrng(): Prng {
  return activePrng;
}

export function setPrng(prng: Prng): void {
  activePrng = prng;
}

export function resetPrng(seed: number = DEFAULT_PRNG_SEED): void {
  activePrng = createMulberry32(seed);
}
