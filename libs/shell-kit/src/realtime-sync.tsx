import * as React from 'react';
import { queryKeys } from '@nft/shared-query';
import type { NftUpdatedEvent, OrderUpdatedEvent } from '@nft/shared-contracts';
import { useShell } from './context';

export function useRealtimeSync(): void {
  const { realtimeClient, queryClient, feedback } = useShell();

  React.useEffect(() => {
    // 1. Subscribe to nft.updated
    const unsubNft = realtimeClient.subscribe<NftUpdatedEvent>(
      'nft.updated',
      (event) => {
        const payload = event.payload;
        void queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all() });
        if (payload?.nftId) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.catalog.detail(payload.nftId),
          });
        }
        void queryClient.invalidateQueries({ queryKey: queryKeys.cart.all() });
        void queryClient.invalidateQueries({ queryKey: queryKeys.quote.all() });

        let message = `Atualização no catálogo: item ${payload?.nftId} foi atualizado.`;
        if (payload?.price) {
          message = `Atualização de preço: o item ${payload.nftId} agora custa ${payload.price} ETH.`;
        } else if (payload?.availableSupply !== undefined) {
          message =
            payload.availableSupply === 0
              ? `Aviso de estoque: o item ${payload.nftId} esgotou.`
              : `Atualização de estoque: o item ${payload.nftId} possui ${payload.availableSupply} edições disponíveis.`;
        }

        feedback.notify({
          message,
          tone: 'info',
          politeness: 'polite',
        });
      }
    );

    // 2. Subscribe to order.updated
    const unsubOrder = realtimeClient.subscribe<OrderUpdatedEvent>(
      'order.updated',
      (event) => {
        const payload = event.payload;
        void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
        if (event.userId) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.orders.list(event.userId),
          });
        }
        if (payload?.orderId) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.orders.detail(payload.orderId),
          });
        }

        if (payload?.status === 'confirmed') {
          void queryClient.invalidateQueries({ queryKey: queryKeys.cart.all() });
          void queryClient.invalidateQueries({ queryKey: queryKeys.quote.all() });
        }

        const isConfirmed = payload?.status === 'confirmed';
        const statusLabel = isConfirmed ? 'confirmado com sucesso' : 'recusado';
        const message = `Pedido ${payload?.orderId} ${statusLabel}.`;

        feedback.notify({
          message,
          tone: isConfirmed ? 'success' : 'error',
          politeness: 'polite',
        });
      }
    );

    // 3. Reconnection listener for REST reconciliation
    const unsubReconnect = realtimeClient.onReconnect(() => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.quote.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
    });

    return () => {
      unsubNft();
      unsubOrder();
      unsubReconnect();
    };
  }, [realtimeClient, queryClient, feedback]);
}

export const RealtimeSync: React.FC = () => {
  useRealtimeSync();
  return null;
};
