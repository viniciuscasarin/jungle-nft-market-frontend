import * as React from 'react';
import { Button } from '@nft/shared-ui';
import type { CartOrderSummary } from './types';
export interface OrderSummaryCardProps {
  summary: CartOrderSummary;
  onApplyCoupon?: ((code: string) => void) | undefined;
  onRemoveCoupon?: (() => void) | undefined;
  onCheckout?: (() => void) | undefined;
  onContinueShopping?: (() => void) | undefined;
  isMobile?: boolean | undefined;
  className?: string | undefined;
}
/** Displays only formatted amounts returned by the quote API. */
export function OrderSummaryCard({
  summary,
  onApplyCoupon,
  onRemoveCoupon,
  onCheckout,
  onContinueShopping,
  isMobile = false,
  className = '',
}: OrderSummaryCardProps) {
  const [coupon, setCoupon] = React.useState('');
  const couponId = React.useId();
  return (
    <aside aria-label="Resumo do pedido" className={`space-y-6 ${className}`}>
      {!isMobile && <h2 className="text-title-20 font-bold">Resumo da carteira</h2>}
      <form
        onSubmit={event => {
          event.preventDefault();
          onApplyCoupon?.(coupon);
        }}
        className="space-y-2"
      >
        <label htmlFor={couponId}>Código promocional</label>
        <div className="flex gap-2">
          <input
            id={couponId}
            value={coupon}
            onChange={event => setCoupon(event.target.value)}
            className="min-w-0 w-full rounded-md border border-border-accessible bg-surface-default p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <Button type="submit" variant="outline">
            Aplicar
          </Button>
        </div>
      </form>
      {summary.appliedCoupon && <div className="flex items-center justify-between gap-2">
        <span>Cupom: {summary.appliedCoupon}</span>
        <Button variant="ghost" onClick={onRemoveCoupon}>Remover cupom</Button>
      </div>}
      <dl className="space-y-4">
        <div className="flex justify-between gap-4">
          <dt>Subtotal</dt>
          <dd>{summary.subtotalEth}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Desconto</dt>
          <dd>{summary.discountEth}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Taxa de rede</dt>
          <dd>{summary.networkFeeEth}</dd>
        </div>
        <div className="flex justify-between gap-4 font-bold text-accent">
          <dt>Total</dt>
          <dd data-testid="cart-total">{summary.totalEth}</dd>
        </div>
      </dl>
      <Button className="w-full" disabled={!onCheckout} onClick={onCheckout}>
        Conectar e finalizar
      </Button>
      {onContinueShopping && (
        <Button variant="ghost" className="w-full" onClick={onContinueShopping}>
          Continuar explorando
        </Button>
      )}
    </aside>
  );
}
