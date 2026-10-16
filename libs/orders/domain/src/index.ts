import type {
  CreateOrderInput,
  OrderStatus,
} from '@nft/shared-contracts';

/**
 * Checks if an order status is terminal (confirmed or rejected).
 * Terminal statuses cannot undergo any further state transition.
 */
export function isTerminalOrderStatus(status: OrderStatus): boolean {
  return status === 'confirmed' || status === 'rejected';
}

/**
 * Validates whether a state transition from `currentStatus` to `nextStatus` is allowed.
 * - confirmed and rejected are terminal: no further transitions permitted.
 * - pending can transition to confirmed, rejected, or remain pending.
 */
export function canTransitionOrderStatus(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus
): boolean {
  if (isTerminalOrderStatus(currentStatus)) {
    return false;
  }
  // From pending, only valid transitions are to pending, confirmed or rejected
  return nextStatus === 'pending' || nextStatus === 'confirmed' || nextStatus === 'rejected';
}

/**
 * Compares two CreateOrderInput payloads to determine if they match exactly.
 * Used for idempotency verification: matching key with matching payload returns the existing order,
 * while matching key with conflicting payload results in IDEMPOTENCY_CONFLICT (409).
 */
export function areOrderPayloadsEqual(
  a: CreateOrderInput,
  b: CreateOrderInput
): boolean {
  if (a.quoteId !== b.quoteId) {
    return false;
  }

  const colA = a.collector;
  const colB = b.collector;

  if (
    colA.fullName !== colB.fullName ||
    colA.email !== colB.email ||
    colA.walletAddress.toLowerCase() !== colB.walletAddress.toLowerCase() ||
    colA.walletType !== colB.walletType ||
    colA.network !== colB.network ||
    (colA.ensName ?? '') !== (colB.ensName ?? '') ||
    Boolean(colA.useSecondaryWallet) !== Boolean(colB.useSecondaryWallet)
  ) {
    return false;
  }

  if (colA.useSecondaryWallet) {
    if (
      colA.secondaryWallet?.address.toLowerCase() !==
      colB.secondaryWallet?.address.toLowerCase()
    ) {
      return false;
    }
    if (colA.secondaryWallet?.network !== colB.secondaryWallet?.network) {
      return false;
    }
  }

  return true;
}

/**
 * Generates or derives a deterministic or client-side idempotency key for an order attempt.
 */
export function createIdempotencyKey(prefix = 'idem'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const ORDERS_DOMAIN_MODULE = '@nft/orders-domain';
