import React from 'react';
import { useParams } from '@nft/shared-router';
import { useShell, useSession } from '@nft/shell-kit';

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

  return (
    <div data-testid="checkout-confirmation-page" className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="border border-border-default rounded-lg p-6 bg-surface-card">
        <span className="text-tiny-10 uppercase tracking-widest text-text-accent font-mono font-bold">
          Checkout Remote
        </span>
        <h1 className="text-heading-24 font-bold text-text-primary mt-2">
          Confirmação de Pedido {orderId ? `#${orderId}` : ''}
        </h1>
        <p className="text-body-14 text-text-secondary mt-2">
          Pedido confirmado com sucesso pela simulação de checkout.
        </p>
        <div className="mt-4 pt-4 border-t border-border-soft flex gap-4 text-caption-12 text-text-muted font-mono">
          <span>QueryClient: {queryClient ? 'Conectado' : 'Ausente'}</span>
          <span>Sessão: {session ? session.name : 'Não autenticado'}</span>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationPage;
