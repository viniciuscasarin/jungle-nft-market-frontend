import { z } from 'zod';
import { EthAmountSchema } from './common';
import { OrderStatusSchema } from './orders';

export const NftUpdatedPayloadSchema = z.object({
  nftId: z.string().min(1),
  editionId: z.string().optional(),
  price: EthAmountSchema.optional(),
  availableSupply: z.number().int().nonnegative().optional(),
  maxSupply: z.number().int().positive().optional(),
});

export type NftUpdatedPayload = z.infer<typeof NftUpdatedPayloadSchema>;

export const OrderUpdatedPayloadSchema = z.object({
  orderId: z.string().min(1),
  userId: z.string().min(1),
  status: OrderStatusSchema,
  transactionHash: z.string().optional(),
  rejectionReason: z.string().optional(),
  confirmedAt: z.string().optional(),
});

export type OrderUpdatedPayload = z.infer<typeof OrderUpdatedPayloadSchema>;

export const NftUpdatedEnvelopeSchema = z.object({
  id: z.string().min(1, 'ID do evento é obrigatório'),
  type: z.literal('nft.updated'),
  resource: z.literal('nft'),
  resourceId: z.string().min(1),
  version: z.number().int().nonnegative('Versão deve ser um inteiro não negativo'),
  timestamp: z.string(),
  payload: NftUpdatedPayloadSchema,
});

export type NftUpdatedEvent = z.infer<typeof NftUpdatedEnvelopeSchema>;

export const OrderUpdatedEnvelopeSchema = z.object({
  id: z.string().min(1, 'ID do evento é obrigatório'),
  type: z.literal('order.updated'),
  resource: z.literal('order'),
  resourceId: z.string().min(1),
  version: z.number().int().nonnegative('Versão deve ser um inteiro não negativo'),
  timestamp: z.string(),
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  payload: OrderUpdatedPayloadSchema,
});

export type OrderUpdatedEvent = z.infer<typeof OrderUpdatedEnvelopeSchema>;

export const RealtimeEnvelopeSchema = z.discriminatedUnion('type', [
  NftUpdatedEnvelopeSchema,
  OrderUpdatedEnvelopeSchema,
]);

export type RealtimeEnvelope = z.infer<typeof RealtimeEnvelopeSchema>;

/**
 * Pure helper to detect if an incoming realtime event has already been received.
 */
export function isDuplicate(
  incoming: { id: string } | string,
  existing: ReadonlySet<string> | readonly string[] | readonly { id: string }[]
): boolean {
  const incomingId = typeof incoming === 'string' ? incoming : incoming.id;

  if (Array.isArray(existing)) {
    return existing.some((item: string | { id: string }) =>
      typeof item === 'string' ? item === incomingId : item.id === incomingId
    );
  }

  if (existing && typeof (existing as ReadonlySet<string>).has === 'function') {
    return (existing as ReadonlySet<string>).has(incomingId);
  }

  return false;
}

/**
 * Pure helper to detect if an incoming version is stale (older or equal to current applied version).
 */
export function isStale(incomingVersion: number, currentVersion: number): boolean {
  return incomingVersion <= currentVersion;
}
