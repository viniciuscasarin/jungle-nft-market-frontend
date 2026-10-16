import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { queryKeys, createQueryClient } from '@nft/shared-query';
import type { NftUpdatedEvent, OrderUpdatedEvent } from '@nft/shared-contracts';
import { ShellProvider, type ShellContextValue, type ShellFeedback } from './context';
import { RealtimeSync, useRealtimeSync } from './realtime-sync';
import type { RealtimeClient } from '@nft/shared-realtime';

describe('RealtimeSync & useRealtimeSync (@nft/shell-kit)', () => {
  let mockSubscribe: ReturnType<typeof vi.fn>;
  let mockOnReconnect: ReturnType<typeof vi.fn>;
  let mockInvalidateQueries: ReturnType<typeof vi.fn>;
  let mockNotify: ReturnType<typeof vi.fn>;
  let subscriptions: Record<string, (event: unknown) => void>;
  let reconnectListener: (() => void) | null = null;
  let shellValue: ShellContextValue;

  beforeEach(() => {
    subscriptions = {};
    reconnectListener = null;

    mockSubscribe = vi.fn((event: string, handler: (data: unknown) => void) => {
      subscriptions[event] = handler;
      return vi.fn(() => {
        delete subscriptions[event];
      });
    });

    mockOnReconnect = vi.fn((listener: () => void) => {
      reconnectListener = listener;
      return vi.fn(() => {
        reconnectListener = null;
      });
    });

    const mockRealtimeClient = {
      subscribe: mockSubscribe,
      onReconnect: mockOnReconnect,
    } as unknown as RealtimeClient;

    const queryClient = createQueryClient();
    mockInvalidateQueries = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();

    mockNotify = vi.fn();
    const mockFeedback: ShellFeedback = {
      notify: mockNotify,
      announce: vi.fn(),
    };

    shellValue = {
      queryClient,
      httpClient: {} as never,
      realtimeClient: mockRealtimeClient,
      session: {
        userId: 'usr_test_1',
        name: 'Test Collector',
        email: 'test@example.com',
      },
      navigate: vi.fn(),
      feedback: mockFeedback,
    };
  });

  function TestConsumer() {
    useRealtimeSync();
    return <div data-testid="synced">Synced</div>;
  }

  it('subscribes to nft.updated, order.updated, and onReconnect on mount and cleans up on unmount', () => {
    const { unmount } = render(
      <ShellProvider value={shellValue}>
        <RealtimeSync />
      </ShellProvider>
    );

    expect(mockSubscribe).toHaveBeenCalledWith('nft.updated', expect.any(Function));
    expect(mockSubscribe).toHaveBeenCalledWith('order.updated', expect.any(Function));
    expect(mockOnReconnect).toHaveBeenCalledWith(expect.any(Function));

    unmount();
    expect(Object.keys(subscriptions).length).toBe(0);
    expect(reconnectListener).toBeNull();
  });

  it('invalidates catalog, cart, quote queries and notifies accessible feedback on nft.updated event', () => {
    render(
      <ShellProvider value={shellValue}>
        <TestConsumer />
      </ShellProvider>
    );

    const nftEvent: NftUpdatedEvent = {
      id: 'ev_nft_01',
      type: 'nft.updated',
      resource: 'nft',
      resourceId: 'nft-01',
      version: 2,
      timestamp: '2026-01-01T00:00:00.000Z',
      payload: {
        nftId: 'nft-01',
        price: '3.50',
      },
    };

    subscriptions['nft.updated']?.(nftEvent);

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.catalog.all(),
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.catalog.detail('nft-01'),
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.cart.all(),
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.quote.all(),
    });

    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('3.50 ETH'),
        tone: 'info',
        politeness: 'polite',
      })
    );
  });

  it('invalidates orders, cart queries and notifies accessible feedback on order.updated event', () => {
    render(
      <ShellProvider value={shellValue}>
        <TestConsumer />
      </ShellProvider>
    );

    const orderEvent: OrderUpdatedEvent = {
      id: 'ev_ord_01',
      type: 'order.updated',
      resource: 'order',
      resourceId: 'ord_123',
      version: 2,
      timestamp: '2026-01-01T00:00:00.000Z',
      userId: 'usr_test_1',
      payload: {
        orderId: 'ord_123',
        userId: 'usr_test_1',
        status: 'confirmed',
      },
    };

    subscriptions['order.updated']?.(orderEvent);

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.orders.all(),
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.orders.list('usr_test_1'),
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.orders.detail('ord_123'),
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.cart.all(),
    });

    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('confirmado'),
        tone: 'success',
        politeness: 'polite',
      })
    );
  });

  it('invalidates active catalog, cart, quote, and orders queries on socket reconnect', () => {
    render(
      <ShellProvider value={shellValue}>
        <TestConsumer />
      </ShellProvider>
    );

    reconnectListener?.();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.catalog.all(),
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.cart.all(),
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.quote.all(),
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.orders.all(),
    });
  });
});
