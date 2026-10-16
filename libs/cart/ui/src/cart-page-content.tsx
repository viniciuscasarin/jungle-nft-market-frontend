import * as React from 'react';
import {
  Header,
  Footer,
  Breadcrumb,
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@nft/shared-ui';
import { CartItem, CartOrderSummary } from './types';
import { CartItemRow } from './cart-item-row';
import { CartItemCard } from './cart-item-card';
import { OrderSummaryCard } from './order-summary-card';
import { CartRecommendedCarousel } from './cart-recommended-carousel';
import { CartMobileHeader } from './cart-mobile-header';

export interface CartPageContentProps {
  initialItems?: CartItem[] | undefined;
  onCheckout?: (() => void) | undefined;
  onNavigateHome?: (() => void) | undefined;
  className?: string | undefined;
}

const DEFAULT_CART_ITEMS: CartItem[] = [
  {
    id: 'emerald-ape-042',
    name: 'Emerald Ape #042',
    tokenId: '#0042',
    imageUrl: '/assets/images/nft-03-emerald-ape.png',
    priceEth: '1.19 ETH',
    quantity: 2,
    maxQuantity: 50,
    edition: '1/50',
  },
  {
    id: 'violet-nomad-314',
    name: 'Violet Nomad #314',
    tokenId: '#0009',
    imageUrl: '/assets/images/nft-07-violet-nomad.png',
    priceEth: '1.39 ETH',
    quantity: 6,
    maxQuantity: 1,
    edition: '1/1',
  },
  {
    id: 'ivory-baron-088',
    name: 'Ivory Baron #088',
    tokenId: '#0552',
    imageUrl: '/assets/images/nft-08-ivory-baron.png',
    priceEth: '1.79 ETH',
    quantity: 9,
    maxQuantity: 10,
    edition: '1/10',
  },
];

const NETWORK_FEE = 0.016;

/**
 * Orquestrador da página de Carrinho de NFTs com fidelidade estrita ao Figma
 * (Desktop #11:1278 e Mobile #16:360).
 */
export const CartPageContent: React.FC<CartPageContentProps> = ({
  initialItems = DEFAULT_CART_ITEMS,
  onCheckout,
  onNavigateHome,
  className = '',
}) => {
  const [items, setItems] = React.useState<CartItem[]>(initialItems);
  const [appliedCoupon, setAppliedCoupon] = React.useState<string | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<string>('');
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);

  // Anúncio acessível para leitores de tela
  const announce = (msg: string) => {
    setStatusMessage(msg);
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          announce(`Quantidade de ${item.name} alterada para ${newQuantity}`);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    const itemToRemove = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (itemToRemove) {
      announce(`${itemToRemove.name} removido do carrinho`);
    }
  };

  const handleApplyCoupon = (code: string) => {
    setAppliedCoupon(code);
    announce(`Cupom promocional ${code} aplicado com sucesso`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    announce('Cupom promocional removido');
  };

  // Cálculo da cotação
  const subtotalNumber = items.reduce((acc, item) => {
    const unit = parseFloat(item.priceEth.replace(' ETH', '').trim()) || 0;
    return acc + unit * item.quantity;
  }, 0);

  const discountPercent = appliedCoupon ? 0.1 : 0; // 10% se houver cupom
  const discountNumber = subtotalNumber * discountPercent;
  const totalNumber = items.length > 0 ? subtotalNumber - discountNumber + NETWORK_FEE : 0;
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  const summary: CartOrderSummary = {
    subtotalEth: `${subtotalNumber.toFixed(2)} ETH`,
    discountEth: discountNumber > 0 ? `${discountNumber.toFixed(2)} ETH` : '00.00',
    networkFeeEth: items.length > 0 ? `${NETWORK_FEE} ETH` : '0.000 ETH',
    totalEth: `${totalNumber.toFixed(3)} ETH`,
    appliedCoupon,
  };

  return (
    <div className={`w-full min-h-screen bg-surface-default text-text-primary font-mono ${className}`}>
      {/* Live Region para leitores de tela */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </div>

      {/* --- DESKTOP VIEWPORT (>= 1024px) --- */}
      <div className="hidden lg:flex flex-col min-h-screen">
        {/* Header oficial Kurio */}
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-[120px] pt-4">
          <Header
            activePath="/mercado"
            cartCount={totalQuantity}
          />
        </div>

        {/* Conteúdo Principal Desktop */}
        <main className="w-full max-w-[1440px] mx-auto px-6 lg:px-[120px] py-8 flex flex-col gap-12 flex-1">
          {/* Breadcrumb oficial */}
          <Breadcrumb
            items={[
              { label: 'Início', href: '/' },
              { label: 'Mercado', href: '/#catalogo' },
              { label: 'Carrinho' },
            ]}
          />

          {items.length === 0 ? (
            /* Estado Vazio */
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-border-default/60 rounded-[24px] bg-surface-card/40 my-8">
              <div className="w-16 h-16 rounded-full bg-surface-raised flex items-center justify-center text-text-muted mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M6 8h12v11a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V8Z" />
                  <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                </svg>
              </div>
              <h2 className="text-heading-24 font-bold text-text-primary mb-2">
                Seu carrinho está vazio
              </h2>
              <p className="text-body-14 text-text-secondary max-w-md mb-6">
                Explore nosso mercado de NFTs exclusivas e adicione colecionáveis digitais para finalizar sua compra.
              </p>
              <button
                type="button"
                onClick={onNavigateHome}
                className="px-6 py-3 rounded-lg bg-primary hover:bg-primary-hover text-ink font-bold text-body-14 transition-colors cursor-pointer"
              >
                Explorar mercado
              </button>
            </div>
          ) : (
            /* Layout de Duas Colunas do Figma #11:1278 */
            <div className="grid grid-cols-12 gap-10 items-start">
              {/* Coluna Esquerda: Tabela de Itens (8 colunas) */}
              <section className="col-span-12 xl:col-span-8 flex flex-col">
                <table className="w-full border-separate border-spacing-y-[12px] text-left font-mono" aria-label="Itens no carrinho de compras">
                  <thead>
                    <tr className="text-body-14 text-text-secondary font-medium">
                      <th scope="col" className="pb-1 pl-4 font-medium">NFTs</th>
                      <th scope="col" className="pb-1 px-4 font-medium">Preço</th>
                      <th scope="col" className="pb-1 px-4 font-medium">Edições</th>
                      <th scope="col" className="pb-1 px-4 font-medium">Total</th>
                      <th scope="col" className="pb-1 pr-4 text-right sr-only">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <CartItemRow
                        key={item.id}
                        item={item}
                        onQuantityChange={handleQuantityChange}
                        onRemove={handleRemoveItem}
                      />
                    ))}
                  </tbody>
                </table>
              </section>

              {/* Coluna Direita: Resumo da Carteira (4 colunas) */}
              <section className="col-span-12 xl:col-span-4 sticky top-6">
                <OrderSummaryCard
                  summary={summary}
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={handleRemoveCoupon}
                  onCheckout={onCheckout}
                  onContinueShopping={onNavigateHome}
                />
              </section>
            </div>
          )}

          {/* Seção "Colecionadores também viram" */}
          <CartRecommendedCarousel onSelectItem={(rec) => announce(`Selecionado: ${rec.name}`)} />
        </main>

        {/* Rodapé Oficial Kurio */}
        <Footer />
      </div>

      {/* --- MOBILE / TABLET VIEWPORT (< 1024px) --- */}
      <div className="flex lg:hidden flex-col min-h-screen px-4 sm:px-6 pb-36 sm:pb-40 max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto w-full">
        {/* Header mobile específico com botão voltar e título centralizado */}
        <CartMobileHeader
          title="Carrinho de NFTs"
          onBack={onNavigateHome}
        />

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center my-auto">
            <span className="text-3xl mb-3">🌿</span>
            <h2 className="text-title-20 font-bold text-text-primary mb-2">
              Carrinho vazio
            </h2>
            <p className="text-body-14 text-text-secondary mb-6">
              Adicione itens no catálogo para visualizar o resumo.
            </p>
            <button
              type="button"
              onClick={onNavigateHome}
              className="w-full py-3 rounded-lg bg-primary text-ink font-bold text-body-14 cursor-pointer"
            >
              Explorar NFTs
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 mt-2">
            {/* Lista de Cards de Itens Mobile (#16:360) */}
            <div className="flex flex-col gap-[12px]">
              {items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>

            {/* Carrossel de recomendados também no mobile/tablet */}
            <div className="mt-4 pt-4 border-t border-border-default/40">
              <CartRecommendedCarousel onSelectItem={(rec) => announce(`Selecionado: ${rec.name}`)} />
            </div>
          </div>
        )}

        {/* =========================================================================
            BARRA FIXA INFERIOR MOBILE (#16:360) / DRAWER DE RESUMO DA CARTEIRA
            Contém Resumo da Carteira, Total destacado em ETH e Botão Conectar (estilo PDP)
            ========================================================================= */}
        {items.length > 0 && (
          <div
            data-testid="cart-mobile-fixed-bottom-bar"
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-card/95 backdrop-blur-md border-t border-border-default/80 shadow-2xl px-5 pt-3 pb-5 sm:pb-6 select-none"
          >
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              {/* Linha 1 da barra fixa: Resumo da carteira à esquerda e Total à direita */}
              <div className="flex items-center justify-between pb-2">
                <DrawerTrigger asChild>
                  <button
                    type="button"
                    aria-label="Abrir resumo da carteira"
                    className="flex items-center gap-1.5 text-text-primary hover:text-accent font-mono text-body-14 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm p-1"
                  >
                    <span className="font-bold underline decoration-accent/60 underline-offset-4">Resumo da carteira</span>
                    <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m18 15-6-6-6 6" />
                    </svg>
                  </button>
                </DrawerTrigger>

                <div className="flex items-center gap-2">
                  <span className="text-caption-12 text-text-secondary">Total:</span>
                  <span
                    data-testid="cart-mobile-total-eth"
                    className="text-[20px] sm:text-[22px] font-bold font-mono text-accent tracking-tight"
                  >
                    {summary.totalEth}
                  </span>
                </div>
              </div>

              {/* Linha 2 da barra fixa: Botão Conectar e finalizar */}
              <button
                type="button"
                onClick={onCheckout}
                className="w-full h-12 rounded-lg bg-primary hover:bg-primary-hover text-ink font-mono font-bold text-body-large-16 tracking-wide transition-all duration-200 cursor-pointer shadow-lg shadow-primary/10 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default"
              >
                Conectar e finalizar
              </button>

              <DrawerContent side="bottom" className="max-h-[85vh] overflow-y-auto px-5 py-6">
                <DrawerHeader className="text-left pb-3 border-b border-border-default/60">
                  <DrawerTitle className="text-title-20 font-bold text-text-primary">
                    Resumo da carteira
                  </DrawerTitle>
                  <DrawerDescription className="sr-only">
                    Discriminação de valores e código promocional do pedido
                  </DrawerDescription>
                </DrawerHeader>

                <div className="py-2">
                  <OrderSummaryCard
                    isMobile
                    summary={summary}
                    onApplyCoupon={handleApplyCoupon}
                    onRemoveCoupon={handleRemoveCoupon}
                    onCheckout={() => {
                      setIsDrawerOpen(false);
                      onCheckout?.();
                    }}
                  />
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        )}
      </div>
    </div>
  );
};
