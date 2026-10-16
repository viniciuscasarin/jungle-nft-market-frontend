import React from 'react';
import { useShell, useSession } from '@nft/shell-kit';
import { PaymentPageContent } from '@nft/checkout-ui';

export function PaymentPage() {
  const { queryClient } = useShell();
  const session = useSession();

  return (
    <div
      data-testid="checkout-payment-page"
      className="w-full min-h-screen bg-surface-default text-text-primary"
    >
      {/* Metadados acessíveis e de integração com host Shell */}
      <h1 className="sr-only">Pagamento & Checkout</h1>
      <div className="sr-only">
        <span>Checkout Remote</span>
        <span>QueryClient: {queryClient ? 'Conectado' : 'Ausente'}</span>
        <span>Sessão: {session ? session.name : 'Não autenticado'}</span>
      </div>

      <PaymentPageContent />
    </div>
  );
}

export default PaymentPage;
