import * as React from 'react';
import { EmptyState, Button, IconAlertCircle } from '@nft/shared-ui';

export interface CheckoutAppProps {
  shellOrigin?: string;
  onNavigateToShell?: () => void;
}

export function App({
  shellOrigin = 'http://localhost:4200',
  onNavigateToShell,
}: CheckoutAppProps) {
  const handleOpenShell = () => {
    if (onNavigateToShell) {
      onNavigateToShell();
      return;
    }
    if (typeof window !== 'undefined' && window.location) {
      if (typeof window.location.assign === 'function') {
        window.location.assign(shellOrigin);
      } else {
        window.location.href = shellOrigin;
      }
    }
  };

  return (
    <div
      role="region"
      aria-label="Checkout Standalone Indisponível"
      className="flex min-h-screen flex-col items-center justify-center p-6 bg-surface-default font-mono text-text-primary"
    >
      <header className="sr-only">
        <h1>Checkout Remoto - Modo Standalone</h1>
      </header>

      <main className="w-full max-w-xl">
        <EmptyState
          title="Fluxo Integrado Obrigatório"
          description="O fluxo de carrinho, pagamento e confirmação de pedido depende da cotação e catálogo do host. Para efetuar compras ou emitir recibos com dados simulados consistentes, acesse o Shell integrado."
          icon={<IconAlertCircle className="h-8 w-8 text-coral" aria-hidden="true" />}
          action={
            <Button
              type="button"
              variant="primary"
              onClick={handleOpenShell}
              data-testid="checkout-go-to-shell-button"
            >
              Acessar Shell Integrado (Porta 4200)
            </Button>
          }
        >
          <div className="rounded-xs border border-border-default/60 bg-surface-raised p-4 text-left text-caption-13 text-text-secondary">
            <p className="font-bold text-text-primary mb-1">Por que esta tela é exibida?</p>
            <p>
              Conforme a arquitetura do desafio, pedidos são idempotentes e exigem cotação ativa da API. Nenhuma compra simulada ou recibo aparente é gerado isoladamente sem validação da simulação de rede.
            </p>
          </div>
        </EmptyState>
      </main>
    </div>
  );
}

export default App;
