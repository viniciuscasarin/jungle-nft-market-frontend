import { HttpResponse } from 'msw';
import { ApiErrorCode, type ApiErrorPayload } from '@nft/shared-contracts';
import { getPrng } from './prng';

export type NetworkPhase = 'before' | 'after';

export type LatencyConfig = number | { min: number; max: number };

export interface HttpErrorBehavior {
  type: 'httpError';
  status: number;
  code: ApiErrorCode;
  message: string;
  retryable?: boolean;
  fieldErrors?: Record<string, string>;
  details?: unknown;
}

export interface TimeoutBehavior {
  type: 'timeout';
  delayMs?: number;
}

export interface ConnectionErrorBehavior {
  type: 'connectionError';
}

export interface LatencyBehavior {
  type: 'latency';
  duration: LatencyConfig;
}

export interface OutOfOrderBehavior {
  type: 'outOfOrder';
  delayStepMs?: number;
}

export interface FailTimesBehavior {
  type: 'failTimes';
  times: number;
  remaining: number;
  behavior: Exclude<NetworkBehavior, FailTimesBehavior | SequenceBehavior>;
}

export interface SequenceBehavior {
  type: 'sequence';
  behaviors: NetworkBehavior[];
  currentIndex: number;
}

export type NetworkBehavior =
  | HttpErrorBehavior
  | TimeoutBehavior
  | ConnectionErrorBehavior
  | LatencyBehavior
  | OutOfOrderBehavior
  | FailTimesBehavior
  | SequenceBehavior;

export interface NetworkRule {
  id?: string;
  phase: NetworkPhase;
  method?: string; // 'GET' | 'POST' | 'ALL'
  pathPattern?: string | RegExp;
  behavior: NetworkBehavior;
}

export interface NetworkProfile {
  id: string;
  name: string;
  description?: string;
  defaultLatencyMs?: LatencyConfig;
  rules: NetworkRule[];
}

export function failTimes(
  times: number,
  behavior: Exclude<NetworkBehavior, FailTimesBehavior | SequenceBehavior>
): FailTimesBehavior {
  return {
    type: 'failTimes',
    times,
    remaining: times,
    behavior,
  };
}

export function sequence(behaviors: NetworkBehavior[]): SequenceBehavior {
  return {
    type: 'sequence',
    behaviors: structuredClone(behaviors),
    currentIndex: 0,
  };
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function resolveLatencyMs(config: LatencyConfig): number {
  if (typeof config === 'number') {
    return Math.max(0, config);
  }
  const prng = getPrng();
  return prng.int(config.min, config.max);
}

let activeNetworkProfile: NetworkProfile = {
  id: 'default',
  name: 'Default Network Profile',
  defaultLatencyMs: 0,
  rules: [],
};

export function getNetworkProfile(): NetworkProfile {
  return activeNetworkProfile;
}

export function setNetworkProfile(profile: NetworkProfile): void {
  activeNetworkProfile = structuredClone(profile);
}

export function resetNetworkProfile(): void {
  activeNetworkProfile = {
    id: 'default',
    name: 'Default Network Profile',
    defaultLatencyMs: 0,
    rules: [],
  };
}

export function matchesRule(rule: NetworkRule, phase: NetworkPhase, method: string, pathname: string): boolean {
  if (rule.phase !== phase) return false;

  if (rule.method && rule.method !== 'ALL' && rule.method.toUpperCase() !== method.toUpperCase()) {
    return false;
  }

  if (!rule.pathPattern) return true;

  if (typeof rule.pathPattern === 'string') {
    return pathname.includes(rule.pathPattern);
  }

  if (rule.pathPattern instanceof RegExp) {
    return rule.pathPattern.test(pathname);
  }

  return false;
}

let outOfOrderCounter = 0;

export async function executeBehavior(
  behavior: NetworkBehavior,
  signal?: AbortSignal
): Promise<Response | null> {
  if (signal?.aborted) {
    return HttpResponse.error();
  }

  switch (behavior.type) {
    case 'latency': {
      const ms = resolveLatencyMs(behavior.duration);
      await delay(ms);
      return null;
    }

    case 'timeout': {
      const ms = behavior.delayMs ?? 500;
      await delay(ms);
      // Simulates network abort / connection drop
      return HttpResponse.error();
    }

    case 'connectionError': {
      return HttpResponse.error();
    }

    case 'httpError': {
      const payload: ApiErrorPayload = {
        code: behavior.code,
        message: behavior.message,
        retryable: behavior.retryable ?? (behavior.status >= 500 || behavior.code === ApiErrorCode.TRANSIENT),
        fieldErrors: behavior.fieldErrors,
        details: behavior.details,
      };
      return HttpResponse.json(payload, { status: behavior.status });
    }

    case 'failTimes': {
      if (behavior.remaining > 0) {
        behavior.remaining -= 1;
        return executeBehavior(behavior.behavior, signal);
      }
      return null;
    }

    case 'sequence': {
      if (behavior.currentIndex < behavior.behaviors.length) {
        const item = behavior.behaviors[behavior.currentIndex]!;
        behavior.currentIndex += 1;
        return executeBehavior(item, signal);
      }
      return null;
    }

    case 'outOfOrder': {
      outOfOrderCounter += 1;
      // Invert order: first request gets higher delay, second gets lower delay
      const step = behavior.delayStepMs ?? 150;
      const isOdd = outOfOrderCounter % 2 === 1;
      const ms = isOdd ? step * 2 : 10;
      await delay(ms);
      return null;
    }

    default:
      return null;
  }
}
