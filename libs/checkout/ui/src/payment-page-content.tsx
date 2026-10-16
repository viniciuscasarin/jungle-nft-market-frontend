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
  DrawerFooter,
} from '@nft/shared-ui';
import { CollectorProfileForm } from './collector-profile-form';
import { CheckoutNftsSummary } from './checkout-nfts-summary';
import { WalletAndNetworkSelector } from './wallet-and-network-selector';
import { ConnectedWalletsSection } from './connected-wallets-section';
import { OrderConfirmationModal } from './order-confirmation-modal';
import { WalletProviderOption } from './types';

export interface PaymentPageContentProps {
  initialCollectorData?: Partial<CollectorProfileData> | undefined;
  onCollectorChange?: ((data: CollectorProfileData) => void) | undefined;
  selectedWallet?: WalletProviderOption | undefined;
  onSelectWallet?: ((option: WalletProviderOption) => void) | undefined;
  nfts?: CheckoutNftItem[] | undefined;
  subtotalEth?: string | undefined;
  discountEth?: string | undefined;
  networkFeeEth?: string | undefined;
  totalEth?: string | undefined;
  isSubmitting?: boolean | undefined;
  isConfirmed?: boolean | undefined;
  errorMessage?: string | null | undefined;
  onConfirmPurchase?: (() => void) | undefined;
  onNavigateBack?: (() => void) | undefined;
  className?: string | undefined;
}

/**
 * Orquestrador principal da Página de Pagamento (#11:2862 Desktop e #16:748 Mobile).
 * Suporte responsivo completo:
 * - Desktop (>= 1024px): layout de 2 colunas com formulário à esquerda e Seus NFTs + Carteiras à direita.
 * - Mobile / Tablet (< 1024px): formulário fluido, carteiras conectadas e barra fixa inferior
 *   acoplando gaveta (Drawer) com o Resumo da Carteira e botão Confirmar compra (estilo PDP).
 */
export const PaymentPageContent: React.FC<PaymentPageContentProps> = ({
  initialCollectorData,
  onCollectorChange,
  selectedWallet: controlledWallet,
  onSelectWallet: controlledOnSelectWallet,
  nfts,
  subtotalEth,
  discountEth,
  networkFeeEth,
  totalEth,
  isSubmitting = false,
  isConfirmed = false,
  errorMessage,
  onConfirmPurchase,
  onNavigateBack,
  className = '',
}) => {
  const [internalWallet, setInternalWallet] = React.useState<WalletProviderOption>('coinbase');
  const selectedWallet = controlledWallet ?? internalWallet;
  const setSelectedWallet = (opt: WalletProviderOption) => {
    setInternalWallet(opt);
    controlledOnSelectWallet?.(opt);
  };

  const [isSuccessFeedback, setIsSuccessFeedback] = React.useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (isConfirmed) {
      setIsSuccessFeedback(true);
      setIsConfirmationModalOpen(true);
    }
  }, [isConfirmed]);

  const handleConfirm = () => {
    setIsSuccessFeedback(true);
    setIsConfirmationModalOpen(true);
    onConfirmPurchase?.();
  };

  return (
    <div className={`w-full min-h-screen bg-surface-default text-text-primary font-mono ${className}`}>
      {/* Live Region para leitores de tela */}
      <div className="sr-only" aria-live="polite">
        {isSuccessFeedback ? 'Transação enviada para processamento' : ''}
      </div>

      {/* --- DESKTOP VIEWPORT (>= 1024px) --- */}
      <div className="hidden lg:flex flex-col min-h-screen">
        {/* Header oficial Kurio */}
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-[120px] pt-4">
          <Header
            activePath="/mercado"
            cartCount={6}
          />
        </div>

        {/* Conteúdo Principal Desktop */}
        <main className="w-full max-w-[1440px] mx-auto px-6 lg:px-[120px] py-8 flex flex-col gap-10 flex-1">
          {/* Breadcrumb oficial */}
          <Breadcrumb
            items={[
              { label: 'Início', href: '/' },
              { label: 'Mercado', href: '/#catalogo' },
              { label: 'Pagamento' },
            ]}
          />

          {/* Grade de 2 Colunas */}
          <div className="grid grid-cols-12 gap-12 items-start">
            {/* Coluna Esquerda: Perfil do colecionador (7 colunas) */}
            <div className="col-span-12 xl:col-span-7">
              {errorMessage && (
                <div role="alert" className="mb-6 p-4 border border-feedback-error bg-surface-card text-feedback-error text-body-14">
                  {errorMessage}
                </div>
              )}
              <CollectorProfileForm
                initialData={initialCollectorData}
                onChange={onCollectorChange}
              />
            </div>

            {/* Coluna Direita: Seus NFTs + Carteira e rede + Confirmar (5 colunas) */}
            <div className="col-span-12 xl:col-span-5 flex flex-col gap-8 sticky top-6">
              {/* Bloco Seus NFTs com discriminativo */}
              <CheckoutNftsSummary
                items={nfts}
                subtotalEth={subtotalEth}
                discountEth={discountEth}
                networkFeeEth={networkFeeEth}
                totalEth={totalEth}
              />

              {/* Seção Carteira e rede */}
              <WalletAndNetworkSelector
                selected={selectedWallet}
                onSelect={setSelectedWallet}
              />

              {/* Botão de Ação Primária (idêntico ao botão de conectar) */}
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className={`w-full h-12 rounded-lg bg-primary hover:bg-primary-hover text-ink font-mono font-bold text-body-large-16 tracking-wide transition-all duration-200 cursor-pointer shadow-lg shadow-primary/10 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default my-4 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Processando...' : 'Confirmar compra'}
              </button>
            </div>
          </div>
        </main>

        {/* Rodapé Oficial Kurio */}
        <Footer />
      </div>

      {/* --- MOBILE / TABLET VIEWPORT (< 1024px) --- */}
      <div className="flex lg:hidden flex-col min-h-screen px-4 sm:px-6 pb-36 sm:pb-40 max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto w-full">
        {/* Header mobile específico com botão voltar e título centralizado */}
        <header
          data-testid="payment-mobile-header"
          className="w-full flex items-center justify-between pt-6 pb-6 select-none"
        >
          <button
            type="button"
            onClick={onNavigateBack}
            aria-label="Voltar para a página anterior"
            className="w-11 h-11 rounded-full bg-surface-card border border-border-default/80 flex items-center justify-center text-text-secondary hover:text-text-primary transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <h1 className="font-mono font-bold text-title-20 text-text-primary tracking-wide text-center">
            Pagamento com carteira
          </h1>

          <div className="w-11 h-11 pointer-events-none" aria-hidden="true" />
        </header>

        {/* Conteúdo Mobile / Tablet (#16:748) */}
        <div className="flex flex-col gap-6">
          {errorMessage && (
            <div role="alert" className="p-4 border border-feedback-error bg-surface-card text-feedback-error text-body-14">
              {errorMessage}
            </div>
          )}

          {/* Seção: Carteira conectada */}
          <ConnectedWalletsSection />

          {/* Seção: Carteira e rede */}
          <WalletAndNetworkSelector
            isMobile
            selected={selectedWallet}
            onSelect={setSelectedWallet}
          />

          {/* Formulário do perfil do colecionador também disponível em mobile/tablet */}
          <div className="pt-2">
            <CollectorProfileForm
              initialData={initialCollectorData}
              onChange={onCollectorChange}
            />
          </div>
        </div>

        {/* =========================================================================
            BARRA FIXA INFERIOR MOBILE (#16:748) / DRAWER DE RESUMO DA CARTEIRA
            Contém Resumo da Carteira, Total destacado em ETH e Botão Confirmar compra (estilo PDP)
            ========================================================================= */}
        <div
          data-testid="payment-mobile-fixed-bottom-bar"
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
                  data-testid="payment-mobile-total-eth"
                  className="text-[20px] sm:text-[22px] font-bold font-mono text-accent tracking-tight"
                >
                  {totalEth ?? '8.936 ETH'}
                </span>
              </div>
            </div>

            {/* Linha 2 da barra fixa: Botão Confirmar compra (estilo botão de conectar) */}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className={`w-full h-12 rounded-lg bg-primary hover:bg-primary-hover text-ink font-mono font-bold text-body-large-16 tracking-wide transition-all duration-200 cursor-pointer shadow-lg shadow-primary/10 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Processando...' : 'Confirmar compra'}
            </button>

            <DrawerContent side="bottom" className="max-h-[85vh] overflow-y-auto px-5 py-6">
              <DrawerHeader className="text-left pb-3 border-b border-border-default/60">
                <DrawerTitle className="text-title-20 font-bold text-text-primary">
                  Resumo da carteira
                </DrawerTitle>
                <DrawerDescription className="sr-only">
                  Resumo dos itens e discriminação de valores do pagamento
                </DrawerDescription>
              </DrawerHeader>

              <div className="py-4">
                <CheckoutNftsSummary
                  items={nfts}
                  subtotalEth={subtotalEth}
                  discountEth={discountEth}
                  networkFeeEth={networkFeeEth}
                  totalEth={totalEth}
                />
              </div>

              <DrawerFooter className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    handleConfirm();
                  }}
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className={`w-full h-12 rounded-lg bg-primary hover:bg-primary-hover text-ink font-mono font-bold text-body-large-16 tracking-wide transition-all duration-200 cursor-pointer shadow-lg shadow-primary/10 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Processando...' : 'Confirmar compra'}
                </button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {/* Modal de Confirmação de Pedido (#11:4385) */}
      <OrderConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
      />
    </div>
  );
};
