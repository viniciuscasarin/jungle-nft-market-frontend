import type {
  NftUpdatedEvent,
  OrderStatus,
  OrderUpdatedEvent,
  RealtimeEnvelope,
} from '@nft/shared-contracts';
import { getClock } from './clock';
import { bumpVersion, getMockDatabase, transaction } from './database';
import { getMockEventBus } from './event-bus';

export interface EmitNftUpdatedInput {
  id?: string;
  nftId?: string;
  editionId?: string;
  price?: string;
  availableSupply?: number;
  maxSupply?: number;
  version?: number;
  timestamp?: string;
}

export interface EmitOrderUpdatedInput {
  id?: string;
  orderId?: string;
  userId?: string;
  status?: OrderStatus;
  transactionHash?: string;
  rejectionReason?: string;
  confirmedAt?: string;
  version?: number;
  timestamp?: string;
}

export interface EmitStaleEventInput {
  id?: string;
  resource?: 'nft' | 'order';
  nftId?: string;
  editionId?: string;
  price?: string;
  availableSupply?: number;
  orderId?: string;
  userId?: string;
  status?: OrderStatus;
  version?: number;
  timestamp?: string;
}

let eventSequence = 0;
let lastEmittedEnvelope: RealtimeEnvelope | null = null;
const resourceVersionMap = new Map<string, number>();

function nextEventId(prefix: string): string {
  eventSequence += 1;
  return `evt_${prefix}_${String(eventSequence).padStart(4, '0')}`;
}

export function resetRealtimeTriggerState(): void {
  eventSequence = 0;
  lastEmittedEnvelope = null;
  resourceVersionMap.clear();
}

export function getLastEmittedRealtimeEnvelope(): RealtimeEnvelope | null {
  return lastEmittedEnvelope ? structuredClone(lastEmittedEnvelope) : null;
}

export function publishRealtimeEnvelope(envelope: RealtimeEnvelope): RealtimeEnvelope {
  lastEmittedEnvelope = structuredClone(envelope);
  const eventBusEnvelope: {
    id: string;
    event: string;
    data: RealtimeEnvelope;
    timestamp: string;
    userId?: string;
    version?: number;
  } = {
    id: envelope.id,
    event: envelope.type,
    data: envelope,
    timestamp: envelope.timestamp,
    version: envelope.version,
  };

  if (envelope.type === 'order.updated') {
    eventBusEnvelope.userId = envelope.userId;
  }

  getMockEventBus().emit(eventBusEnvelope);
  return envelope;
}

export function emitNftUpdated(input: EmitNftUpdatedInput = {}): NftUpdatedEvent {
  const timestamp = input.timestamp ?? getClock().toISOString();

  const envelope = transaction((db): NftUpdatedEvent => {
    const targetNft = input.nftId
      ? db.nfts.find((n) => n.id === input.nftId)
      : db.nfts[0];

    const nftId = input.nftId ?? targetNft?.id ?? 'nft-01';
    const resourceKey = `nft:${nftId}`;

    let editionId = input.editionId;
    let nextPrice = input.price;
    let nextAvailableSupply = input.availableSupply;
    let nextMaxSupply = input.maxSupply;
    let version: number;

    if (targetNft) {
      const targetEdition = editionId
        ? targetNft.editions.find((e) => e.id === editionId)
        : targetNft.editions[0];

      if (!editionId && targetEdition) {
        editionId = targetEdition.id;
      }

      if (nextPrice !== undefined) {
        targetNft.price = nextPrice;
        if (targetEdition) {
          targetEdition.price = nextPrice;
        }
      } else {
        nextPrice = targetEdition?.price ?? targetNft.price;
      }

      if (nextAvailableSupply !== undefined && targetEdition) {
        targetEdition.availableSupply = nextAvailableSupply;
      } else if (nextAvailableSupply === undefined && targetEdition) {
        nextAvailableSupply = targetEdition.availableSupply;
      }

      if (nextMaxSupply !== undefined && targetEdition) {
        targetEdition.maxSupply = nextMaxSupply;
      } else if (nextMaxSupply === undefined && targetEdition) {
        nextMaxSupply = targetEdition.maxSupply;
      }

      bumpVersion(targetNft);
      const trackedVersion = resourceVersionMap.get(resourceKey) ?? 1;
      const computedVersion = Math.max(targetNft.version, trackedVersion + 1);
      version = input.version ?? computedVersion;
      targetNft.version = version;
      if (targetEdition) {
        targetEdition.version = version;
      }
      targetNft.updatedAt = timestamp;
    } else {
      const trackedVersion = resourceVersionMap.get(resourceKey) ?? 1;
      version = input.version ?? trackedVersion + 1;
    }

    resourceVersionMap.set(resourceKey, version);

    return {
      id: input.id ?? nextEventId('nft'),
      type: 'nft.updated',
      resource: 'nft',
      resourceId: nftId,
      version,
      timestamp,
      payload: {
        nftId,
        ...(editionId !== undefined ? { editionId } : {}),
        ...(nextPrice !== undefined ? { price: nextPrice } : {}),
        ...(nextAvailableSupply !== undefined ? { availableSupply: nextAvailableSupply } : {}),
        ...(nextMaxSupply !== undefined ? { maxSupply: nextMaxSupply } : {}),
      },
    };
  });

  publishRealtimeEnvelope(envelope);
  return envelope;
}

export function emitOrderUpdated(input: EmitOrderUpdatedInput = {}): OrderUpdatedEvent {
  const timestamp = input.timestamp ?? getClock().toISOString();

  const envelope = transaction((db): OrderUpdatedEvent => {
    const targetOrder = input.orderId
      ? db.orders.find((o) => o.id === input.orderId)
      : db.orders[db.orders.length - 1];

    const orderId = input.orderId ?? targetOrder?.id ?? 'ord_mock_0001';
    const activeSessionUser = db.sessions[db.sessions.length - 1]?.user.id;
    const fallbackUser = db.users[0]?.id ?? 'usr_collector_01';
    const userId = input.userId ?? targetOrder?.userId ?? activeSessionUser ?? fallbackUser;
    const status: OrderStatus = input.status ?? 'confirmed';
    const resourceKey = `order:${orderId}`;

    let transactionHash = input.transactionHash;
    let rejectionReason = input.rejectionReason;
    let confirmedAt = input.confirmedAt;

    if (status === 'confirmed') {
      confirmedAt = confirmedAt ?? timestamp;
      transactionHash =
        transactionHash ??
        `0x${orderId.replace(/[^a-fA-F0-9]/g, 'a').padEnd(64, '0').slice(0, 64)}`;
    } else if (status === 'rejected') {
      rejectionReason =
        rejectionReason ?? 'Pagamento recusado ou saldo insuficiente na simulação.';
    }

    if (targetOrder) {
      targetOrder.status = status;
      targetOrder.updatedAt = timestamp;
      if (status === 'rejected' && rejectionReason) {
        targetOrder.rejectionReason = rejectionReason;
      }
      if (status === 'confirmed') {
        const userCart = db.carts.find((c) => c.userId === userId);
        if (userCart) {
          userCart.items = [];
          userCart.couponCode = null;
          userCart.updatedAt = timestamp;
        }
      }
    }

    const trackedVersion = resourceVersionMap.get(resourceKey) ?? 1;
    const version = input.version ?? trackedVersion + 1;
    resourceVersionMap.set(resourceKey, version);

    return {
      id: input.id ?? nextEventId('order'),
      type: 'order.updated',
      resource: 'order',
      resourceId: orderId,
      version,
      timestamp,
      userId,
      payload: {
        orderId,
        userId,
        status,
        ...(transactionHash !== undefined ? { transactionHash } : {}),
        ...(rejectionReason !== undefined ? { rejectionReason } : {}),
        ...(confirmedAt !== undefined ? { confirmedAt } : {}),
      },
    };
  });

  publishRealtimeEnvelope(envelope);
  return envelope;
}

export function emitDuplicateEvent(customEnvelope?: RealtimeEnvelope): RealtimeEnvelope {
  const envelopeToRepeat =
    customEnvelope ?? lastEmittedEnvelope ?? emitNftUpdated();
  return publishRealtimeEnvelope(structuredClone(envelopeToRepeat));
}

export function emitStaleEvent(input: EmitStaleEventInput = {}): RealtimeEnvelope {
  const timestamp = input.timestamp ?? getClock().toISOString();
  const db = getMockDatabase();
  const resource = input.resource ?? (input.orderId ? 'order' : 'nft');

  if (resource === 'order') {
    const orderId = input.orderId ?? db.orders[db.orders.length - 1]?.id ?? 'ord_mock_0001';
    const resourceKey = `order:${orderId}`;
    const currentVersion = resourceVersionMap.get(resourceKey) ?? 1;
    const staleVersion = input.version ?? Math.max(0, currentVersion - 1);
    const activeSessionUser = db.sessions[db.sessions.length - 1]?.user.id;
    const userId = input.userId ?? activeSessionUser ?? db.users[0]?.id ?? 'usr_collector_01';
    const status: OrderStatus = input.status ?? 'pending';

    const envelope: OrderUpdatedEvent = {
      id: input.id ?? nextEventId('stale_order'),
      type: 'order.updated',
      resource: 'order',
      resourceId: orderId,
      version: staleVersion,
      timestamp,
      userId,
      payload: {
        orderId,
        userId,
        status,
      },
    };

    getMockEventBus().emit({
      id: envelope.id,
      event: envelope.type,
      data: envelope,
      timestamp: envelope.timestamp,
      userId: envelope.userId,
      version: envelope.version,
    });
    return envelope;
  }

  const targetNft = input.nftId
    ? db.nfts.find((n) => n.id === input.nftId)
    : db.nfts[0];
  const nftId = input.nftId ?? targetNft?.id ?? 'nft-01';
  const resourceKey = `nft:${nftId}`;
  const currentVersion =
    resourceVersionMap.get(resourceKey) ?? targetNft?.version ?? 1;
  const staleVersion = input.version ?? Math.max(0, currentVersion - 1);

  const envelope: NftUpdatedEvent = {
    id: input.id ?? nextEventId('stale_nft'),
    type: 'nft.updated',
    resource: 'nft',
    resourceId: nftId,
    version: staleVersion,
    timestamp,
    payload: {
      nftId,
      ...(input.editionId !== undefined ? { editionId: input.editionId } : {}),
      price: input.price ?? targetNft?.price ?? '0.01',
      ...(input.availableSupply !== undefined
        ? { availableSupply: input.availableSupply }
        : {}),
    },
  };

  getMockEventBus().emit({
    id: envelope.id,
    event: envelope.type,
    data: envelope,
    timestamp: envelope.timestamp,
    version: envelope.version,
  });
  return envelope;
}

export function simulateSocketDisconnect(): void {
  const timestamp = getClock().toISOString();
  getMockEventBus().emit({
    id: nextEventId('socket_disconnect'),
    event: 'socket.disconnect',
    data: { reason: 'transport close' },
    timestamp,
  });
}

export function simulateSocketReconnect(): void {
  const timestamp = getClock().toISOString();
  getMockEventBus().emit({
    id: nextEventId('socket_reconnect'),
    event: 'socket.reconnect',
    data: { reconnectedAt: timestamp },
    timestamp,
  });
}
