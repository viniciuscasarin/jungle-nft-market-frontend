import { describe, it, expect } from 'vitest';
import {
  RealtimeEnvelopeSchema,
  NftUpdatedEnvelopeSchema,
  OrderUpdatedEnvelopeSchema,
  isDuplicate,
  isStale,
} from './index';

describe('Realtime Events and Socket.IO Contracts (@nft/shared-contracts)', () => {
  describe('Discriminated Union RealtimeEnvelopeSchema', () => {
    it('validates nft.updated event envelope', () => {
      const nftEvent = {
        id: 'evt-nft-1',
        type: 'nft.updated',
        resource: 'nft',
        resourceId: 'nft-100',
        version: 5,
        timestamp: '2026-03-01T12:00:00Z',
        payload: {
          nftId: 'nft-100',
          editionId: 'ed-1',
          price: '2.0000',
          availableSupply: 8,
          maxSupply: 10,
        },
      };

      const parsed = RealtimeEnvelopeSchema.parse(nftEvent);
      expect(parsed.type).toBe('nft.updated');
      expect(parsed.resourceId).toBe('nft-100');
      expect(parsed.version).toBe(5);

      const parsedDirect = NftUpdatedEnvelopeSchema.parse(nftEvent);
      expect(parsedDirect.type).toBe('nft.updated');
    });

    it('validates order.updated event envelope', () => {
      const orderEvent = {
        id: 'evt-ord-1',
        type: 'order.updated',
        resource: 'order',
        resourceId: 'ord-555',
        version: 2,
        timestamp: '2026-03-01T12:01:00Z',
        userId: 'usr-123',
        payload: {
          orderId: 'ord-555',
          userId: 'usr-123',
          status: 'confirmed',
          transactionHash: '0xabc123',
          confirmedAt: '2026-03-01T12:01:00Z',
        },
      };

      const parsed = RealtimeEnvelopeSchema.parse(orderEvent);
      expect(parsed.type).toBe('order.updated');
      expect(parsed.resourceId).toBe('ord-555');
      expect(parsed.payload.status).toBe('confirmed');

      const parsedDirect = OrderUpdatedEnvelopeSchema.parse(orderEvent);
      expect(parsedDirect.type).toBe('order.updated');
    });

    it('rejects envelope with invalid type', () => {
      const invalidEvent = {
        id: 'evt-x',
        type: 'unknown.event',
        resource: 'something',
        resourceId: '123',
        version: 1,
        timestamp: '2026-03-01T12:00:00Z',
        payload: {},
      };

      expect(() => RealtimeEnvelopeSchema.parse(invalidEvent)).toThrow();
    });
  });

  describe('isDuplicate pure helper', () => {
    it('returns true when event id already exists in Set', () => {
      const seenIds = new Set(['evt-1', 'evt-2', 'evt-3']);
      const incoming = { id: 'evt-2' };
      expect(isDuplicate(incoming, seenIds)).toBe(true);
      expect(isDuplicate('evt-2', seenIds)).toBe(true);
    });

    it('returns false when event id is not in Set', () => {
      const seenIds = new Set(['evt-1', 'evt-2']);
      const incoming = { id: 'evt-99' };
      expect(isDuplicate(incoming, seenIds)).toBe(false);
      expect(isDuplicate('evt-99', seenIds)).toBe(false);
    });

    it('works with array of objects or strings', () => {
      const existingEvents = [{ id: 'evt-1' }, { id: 'evt-2' }];
      expect(isDuplicate({ id: 'evt-1' }, existingEvents)).toBe(true);
      expect(isDuplicate({ id: 'evt-3' }, existingEvents)).toBe(false);

      const existingStrings = ['evt-1', 'evt-2'];
      expect(isDuplicate('evt-1', existingStrings)).toBe(true);
      expect(isDuplicate('evt-5', existingStrings)).toBe(false);
    });
  });

  describe('isStale pure helper', () => {
    it('returns true when incoming version is equal to currently applied version', () => {
      expect(isStale(3, 3)).toBe(true);
    });

    it('returns true when incoming version is less than currently applied version', () => {
      expect(isStale(3, 4)).toBe(true);
      expect(isStale(1, 10)).toBe(true);
    });

    it('returns false when incoming version is greater than currently applied version', () => {
      expect(isStale(4, 3)).toBe(false);
      expect(isStale(11, 10)).toBe(false);
    });
  });
});
