import React from 'react';
import { useParams } from '@nft/shared-router';
import { useShell, useSession } from '@nft/shell-kit';
import { OrderConfirmationModal, DEFAULT_ORDER_CONFIRMATION } from '@nft/checkout-ui';

export function ConfirmationPage() {
  let orderId: string | undefined;
  try {
    const params = useParams({ strict: false }) as Record<string, string>;
    orderId = params['orderId'];
  } catch {
    // Standalone fallback
  }

  const { queryClient } = useShell();
  const session = useSession();

  const confirmationData = {
    ...DEFAULT_ORDER_CONFIRMATION,
    transactionId: orderId ? `0x${orderId.slice(0, 4)}…${orderId.slice(-4)}` : DEFAULT_ORDER_CONFIRMATION.transactionId,
  };

  return (
    <div
      data-testid="checkout-confirmation-page"
      className="min-h-screen w-full bg-surface-default flex items-center justify-center p-4 sm:p-6"
    >
      {/* Informações semânticas e telemetria para o Shell em background */}
      <h1 className="sr-only">Confirmação de Pedido {orderId ? `#${orderId}` : ''}</h1>
      <div className="sr-only" aria-live="polite">
        <span>QueryClient: {queryClient ? 'Conectado' : 'Ausente'}</span>
        <span>Sessão: {session ? session.name : 'Não autenticado'}</span>
      </div>

      <OrderConfirmationModal
        isInline
        isOpen
        data={confirmationData}
        onClose={() => {
          if (typeof window !== 'undefined' && window.history) {
            window.history.back();
          }
        }}
      />
    </div>
  );
}

export default ConfirmationPage;

