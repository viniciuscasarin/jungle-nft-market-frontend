import * as React from 'react';
import { CartPageContent } from '@nft/cart-ui';
import { PaymentPageContent, OrderConfirmationModal } from '@nft/checkout-ui';

export function App() {
  const [activeTab, setActiveTab] = React.useState<'cart' | 'payment' | 'confirmation' | 'status'>('payment');

  return (
    <div className="min-h-screen flex flex-col bg-surface-default text-text-primary font-mono antialiased">
      {/* Barra de identificação do Remote Checkout */}
      <header className="border-b border-border-default/60 bg-[#160f0c] px-4 py-2 text-xs text-text-muted">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            <h1 className="text-xs font-bold text-text-secondary m-0">Checkout Remote</h1>
            <span className="text-text-muted hidden sm:inline">• Worktree de Layouts</span>
            <div className="flex items-center gap-1 bg-surface-dark px-2 py-0.5 rounded border border-border-soft text-tiny-10">
              <button
                type="button"
                onClick={() => setActiveTab('cart')}
                className={`px-2 py-0.5 rounded font-mono transition-colors cursor-pointer ${
                  activeTab === 'cart'
                    ? 'bg-primary text-text-primary font-bold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Layout Carrinho
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('payment')}
                className={`px-2 py-0.5 rounded font-mono transition-colors cursor-pointer ${
                  activeTab === 'payment'
                    ? 'bg-primary text-text-primary font-bold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Layout Pagamento
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('confirmation')}
                className={`px-2 py-0.5 rounded font-mono transition-colors cursor-pointer ${
                  activeTab === 'confirmation'
                    ? 'bg-primary text-text-primary font-bold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Modal Confirmação
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('status')}
                className={`px-2 py-0.5 rounded font-mono transition-colors cursor-pointer ${
                  activeTab === 'status'
                    ? 'bg-primary text-text-primary font-bold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Status do Remote
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-400 font-bold">
              Porta 4202
            </span>
          </div>
        </div>
      </header>

      <main role="region" aria-label="Fluxo de Checkout" className="flex-1 w-full">
        {activeTab === 'cart' && <CartPageContent />}
        {activeTab === 'payment' && <PaymentPageContent />}
        {activeTab === 'confirmation' && (
          <div className="min-h-[85vh] flex items-center justify-center p-4">
            <OrderConfirmationModal isInline />
          </div>
        )}
        {activeTab === 'status' && (
          <div className="container mx-auto px-4 py-12">
            <div className="rounded-2xl border border-border-default bg-surface-card/50 p-8 shadow-xl backdrop-blur sm:p-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                Carrinho & Pedidos
              </div>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
                Checkout Remote
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary">
                Módulo responsável pelo gerenciamento de carrinho, cálculo de cotação com cupom e taxas de rede, e confirmação idempotente de pedido.
              </p>
              <div className="mt-8 rounded-xl border border-dashed border-border-soft bg-surface-default/40 p-6 text-sm text-text-muted">
                <p className="font-medium text-text-secondary">Status de Integração</p>
                <p className="mt-1">
                  Layouts de alta fidelidade do Carrinho (#11:1278 / #16:360) e Pagamento (#11:2862 / #16:748) prontos para consumo independente e via Module Federation.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
