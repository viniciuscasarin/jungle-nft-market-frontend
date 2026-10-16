import * as React from 'react';
import { CartOrderSummary } from './types';

export interface OrderSummaryCardProps {
  summary: CartOrderSummary;
  onApplyCoupon?: ((code: string) => void) | undefined;
  onRemoveCoupon?: (() => void) | undefined;
  onCheckout?: (() => void) | undefined;
  onContinueShopping?: (() => void) | undefined;
  isMobile?: boolean | undefined;
  className?: string | undefined;
}

/**
 * Card de resumo de pedido e cálculo de cotação fiel ao Figma (#11:1278 e #16:360).
 * Contém campo de código promocional, discriminação de subtotal, desconto, taxa estimada,
 * total destacado em âmbar e botão de ação primária "Conectar e finalizar".
 */
export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  summary,
  onApplyCoupon,
  onRemoveCoupon,
  onCheckout,
  onContinueShopping,
  isMobile = false,
  className = '',
}) => {
  const [couponInput, setCouponInput] = React.useState('');
  const [couponError, setCouponError] = React.useState<string | null>(null);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) {
      setCouponError('Informe um código promocional');
      return;
    }
    setCouponError(null);
    onApplyCoupon?.(couponInput.trim());
  };

  return (
    <aside
      aria-label="Resumo do pedido"
      className={`font-mono flex flex-col ${className}`}
    >
      {/* Título Desktop (Oculto no mobile para manter a fluidez do frame #16:360) */}
      {!isMobile && (
        <h2 className="font-mono font-bold text-text-primary text-body-large-18 tracking-wide border-b border-border-default/80 pb-3 mb-6">
          Resumo da carteira
        </h2>
      )}

      {/* Bloco de Código Promocional */}
      <div className="flex flex-col gap-2">
        {!isMobile && (
          <label
            htmlFor="promo-code-input"
            className="text-caption-12 text-text-secondary uppercase tracking-wider font-mono font-medium"
          >
            Código promocional
          </label>
        )}

        <form onSubmit={handleApply} className="relative flex items-center">
          <input
            id="promo-code-input"
            type="text"
            value={couponInput}
            onChange={(e) => {
              setCouponInput(e.target.value);
              if (couponError) setCouponError(null);
            }}
            placeholder="Digite o código promocional..."
            disabled={Boolean(summary.appliedCoupon)}
            className="w-full h-11 pl-4 pr-24 rounded-lg bg-surface-default border border-border-default/80 text-body-14 text-text-primary placeholder:text-text-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={Boolean(summary.appliedCoupon) || !couponInput.trim()}
            className="absolute right-1 top-1 bottom-1 px-4 rounded-md bg-primary hover:bg-primary-hover text-ink font-mono font-bold text-body-14 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
          >
            Aplicar
          </button>
        </form>

        {/* Feedback de cupom aplicado */}
        {summary.appliedCoupon && (
          <div className="flex items-center justify-between text-caption-12 text-feedback-success bg-feedback-success/10 border border-feedback-success/30 px-3 py-1.5 rounded-md mt-1">
            <span>Cupom <strong>{summary.appliedCoupon}</strong> ativo</span>
            <button
              type="button"
              onClick={() => {
                setCouponInput('');
                onRemoveCoupon?.();
              }}
              className="text-text-muted hover:text-coral transition-colors underline ml-2 cursor-pointer"
            >
              Remover
            </button>
          </div>
        )}

        {couponError && (
          <span className="text-caption-12 text-coral mt-0.5">{couponError}</span>
        )}
      </div>

      {/* Linhas discriminadas de valores */}
      <div className="flex flex-col gap-3.5 pt-2 text-body-15">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-text-foreground">
          <span>Subtotal</span>
          <span className="text-text-foreground font-mono text-[16px]">
            {summary.subtotalEth.includes('ETH') ? summary.subtotalEth : `${summary.subtotalEth} ETH`}
          </span>
        </div>

        {/* Desconto do lançamento */}
        <div className="flex items-center justify-between text-text-foreground">
          <span>Desconto do lançamento</span>
          <span className="text-text-foreground">
            {summary.discountEth ? `(-) ${summary.discountEth}` : '(-) 00.00'}
          </span>
        </div>

        {/* Taxa de rede */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between text-text-foreground">
            <span>Taxa de rede</span>
            <span className="text-text-foreground font-mono text-[18px]">
              {summary.networkFeeEth.includes('ETH') ? summary.networkFeeEth : `${summary.networkFeeEth} ETH`}
            </span>
          </div>
          <span className="text-right text-[12px] text-accent tracking-normal">
            Taxa estimada
          </span>
        </div>
      </div>

      <div className="h-px bg-border-default/60 my-1" />

      {/* Total em destaque âmbar */}
      <div className="flex items-center justify-between">
        <span className="text-body-large-16 font-bold text-text-primary">
          Total
        </span>
        <span className="text-heading-24 font-bold text-accent">
          {summary.totalEth.includes('ETH') ? summary.totalEth : `${summary.totalEth} ETH`}
        </span>
      </div>

      {/* Botão Primário CTA */}
      <button
        type="button"
        onClick={onCheckout}
        className="w-full h-12 rounded-lg bg-primary hover:bg-primary-hover text-ink font-mono font-bold text-body-large-16 tracking-wide transition-all duration-200 cursor-pointer shadow-lg shadow-primary/10 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default my-4"
      >
        Conectar e finalizar
      </button>

      {/* Link Secundário Desktop */}
      {!isMobile && (
        <button
          type="button"
          onClick={onContinueShopping}
          className="text-center text-accent hover:text-text-primary text-body-14 font-mono transition-colors hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        >
          Continuar explorando
        </button>
      )}
    </aside>
  );
};
