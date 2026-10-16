import * as React from 'react';
import {
  Button,
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@nft/shared-ui';
import { CartItemRow } from './cart-item-row';
import { CartItemCard } from './cart-item-card';
import { OrderSummaryCard } from './order-summary-card';
import type { CartItemViewModel, CartOrderSummary } from './types';
import type { RecommendedItem } from './cart-recommended-carousel';
const RecommendedCarousel = React.lazy(() =>
  import('./cart-recommended-carousel').then(module => ({
    default: module.CartRecommendedCarousel,
  })),
);

export interface CartPageContentProps {
  initialItems?: CartItemViewModel[] | undefined;
  summary?: CartOrderSummary | undefined;
  busy?: boolean | undefined;
  onQuantityChange?: ((id: string, quantity: number) => void) | undefined;
  onRemove?: ((id: string) => void) | undefined;
  onCheckout?: (() => void) | undefined;
  onNavigateHome?: (() => void) | undefined;
  onUnavailable?: (() => void) | undefined;
  onApplyCoupon?: ((code: string) => void) | undefined;
  onRemoveCoupon?: (() => void) | undefined;
  recommendedItems?: RecommendedItem[] | undefined;
  onSelectRecommended?: ((item: RecommendedItem) => void) | undefined;
  className?: string | undefined;
}

/** Controlled cart presentation. All persisted state and monetary totals come from props. */
export function CartPageContent({
  initialItems = [],
  summary,
  busy = false,
  onQuantityChange,
  onRemove,
  onCheckout,
  onNavigateHome,
  onUnavailable,
  onApplyCoupon,
  onRemoveCoupon,
  recommendedItems = [],
  onSelectRecommended,
  className = '',
}: CartPageContentProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <section
      data-testid="cart-page-content"
      aria-busy={busy}
      className={`page-container py-6 space-y-8 pb-36 lg:pb-8 ${className}`}
    >
      <h1 className="text-heading-24 font-bold text-text-primary">Carrinho de NFTs</h1>
      {initialItems.length === 0 ? (
        <div className="py-16 text-center space-y-4">
          <h2 className="text-title-20 font-bold">Seu carrinho está vazio</h2>
          <p className="text-text-secondary">Explore o catálogo e adicione seus colecionáveis.</p>
          <Button onClick={onNavigateHome}>Ver catálogo</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <div className="xl:col-span-8 min-w-0">
            <fieldset disabled={busy} className="min-w-0">
              <legend className="sr-only">Itens do carrinho</legend>
              <div className="hidden lg:block overflow-x-auto">
                <table
                  className="w-full text-left border-separate border-spacing-y-3"
                  aria-label="Itens no carrinho"
                >
                  <thead>
                    <tr>
                      <th scope="col">NFT</th>
                      <th scope="col">Preço</th>
                      <th scope="col">Quantidade</th>
                      <th scope="col">Total</th>
                      <th scope="col">
                        <span className="sr-only">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialItems.map(item => (
                      <CartItemRow
                        key={item.id}
                        item={item}
                        onQuantityChange={(id, quantity) => onQuantityChange?.(id, quantity)}
                        onRemove={id => onRemove?.(id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="lg:hidden space-y-3">
                {initialItems.map(item => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onQuantityChange={(id, quantity) => onQuantityChange?.(id, quantity)}
                    onRemove={id => onRemove?.(id)}
                  />
                ))}
              </div>
            </fieldset>
          </div>
          {summary && (
            <div className="hidden lg:block xl:col-span-4 min-w-0">
              <OrderSummaryCard
                summary={summary}
                onCheckout={busy ? undefined : onCheckout}
                onContinueShopping={onNavigateHome}
                onApplyCoupon={onApplyCoupon ?? onUnavailable}
                onRemoveCoupon={onRemoveCoupon}
              />
            </div>
          )}
        </div>
      )}
      {recommendedItems.length > 0 && (
        <React.Suspense fallback={<p role="status">Carregando recomendações...</p>}>
          <RecommendedCarousel items={recommendedItems} onSelectItem={onSelectRecommended} />
        </React.Suspense>
      )}
      {summary && initialItems.length > 0 && (
        <div
          data-testid="cart-mobile-fixed-bottom-bar"
          className="lg:hidden fixed bottom-16 inset-x-0 bg-surface-card border-t border-border-default p-4 z-30"
        >
          <Drawer open={open} onOpenChange={setOpen}>
            <div className="flex items-center justify-between gap-4">
              <DrawerTrigger asChild>
                <Button variant="outline" aria-label="Abrir resumo da carteira">
                  Resumo da carteira
                </Button>
              </DrawerTrigger>
              <span data-testid="cart-mobile-total-eth" className="text-accent font-bold">
                {summary.totalEth}
              </span>
            </div>
            <DrawerContent side="bottom" className="overflow-y-auto max-h-screen p-6">
              <DrawerHeader>
                <DrawerTitle>Resumo da carteira</DrawerTitle>
                <DrawerDescription>Valores fornecidos pela cotação da API</DrawerDescription>
              </DrawerHeader>
              <OrderSummaryCard
                isMobile
                summary={summary}
                onApplyCoupon={onApplyCoupon ?? onUnavailable}
                onRemoveCoupon={onRemoveCoupon}
                onCheckout={
                  busy
                    ? undefined
                    : () => {
                        setOpen(false);
                        onCheckout?.();
                      }
                }
              />
            </DrawerContent>
          </Drawer>
        </div>
      )}
    </section>
  );
}
