import React from 'react';
import { useShell, useSession } from '@nft/shell-kit';
import { CartPageContent } from '@nft/cart-ui';

export function CartPage() {
  const { queryClient } = useShell();
  const session = useSession();

  return (
    <div
      data-testid="checkout-cart-page"
      className="w-full min-h-screen bg-surface-default text-text-primary"
    >
      {/* Metadados acessíveis e de integração com host Shell */}
      <h1 className="sr-only">Carrinho de Compras</h1>
      <div className="sr-only">
        <span>Checkout Remote</span>
        <span>QueryClient: {queryClient ? 'Conectado' : 'Ausente'}</span>
        <span>Sessão: {session ? session.name : 'Visitante'}</span>
      </div>

      <CartPageContent />
    </div>
  );
}

export default CartPage;
