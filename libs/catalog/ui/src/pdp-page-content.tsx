import * as React from 'react';
import {
  cn,
  IconArrowRight2,
  IconHeart,
  IconHeartFilled,
  IconMinus,
  IconPlus,
  IconCart,
  Breadcrumb,
} from '@nft/shared-ui';
import { PdpGallery, type PdpImageItem } from './pdp-gallery';
import {
  PdpPurchaseSection,
  type PdpVersionOption,
  type PdpAttributeItem,
} from './pdp-purchase-section';
import { PdpTabs, type PdpCollectorReview } from './pdp-tabs';
import {
  PdpRelatedCarousel,
  type PdpRelatedItem,
} from './pdp-related-carousel';

export interface PdpPageContentProps {
  /** Fotos do produto para a galeria (primeira coluna) */
  galleryImages?: PdpImageItem[] | undefined;
  /** Nome do produto (linha 1 da seção de compra) */
  title?: string | undefined;
  /** Preço em ETH (linha 2) */
  priceEth?: string | undefined;
  /** Preço aproximado em moeda local (linha 2) */
  priceUsd?: string | undefined;
  /** Nota média de avaliações (linha 2) */
  rating?: number | undefined;
  /** Contagem de avaliações (linha 2 e título da aba) */
  reviewCount?: number | undefined;
  /** Texto sobre o produto (linha 3) */
  description?: string | undefined;
  /** Opções de versões do produto (linha 4) */
  versions?: PdpVersionOption[] | undefined;
  selectedVersionId?: string | undefined;
  onSelectVersion?: ((versionId: string) => void) | undefined;
  /** Quantidade selecionada (linha 5 / barra fixa mobile) */
  quantity?: number | undefined;
  onQuantityChange?: ((qty: number) => void) | undefined;
  minQuantity?: number | undefined;
  maxQuantity?: number | undefined;
  /** Ações de compra e favorito (linha 5 / barra fixa mobile) */
  isFavorite?: boolean | undefined;
  onFavoriteToggle?: (() => void) | undefined;
  onBuyNow?: (() => void) | undefined;
  onAddToCart?: (() => void) | undefined;
  isBuying?: boolean | undefined;
  /** Ação de voltar no topo mobile */
  onBack?: (() => void) | undefined;
  /** Metadados consecutivos */
  tokenId?: string | undefined;
  collectionName?: string | undefined;
  isCollectionVerified?: boolean | undefined;
  attributes?: PdpAttributeItem[] | undefined;

  /** Props da segunda linha: Tabs */
  defaultTab?: 'details' | 'reviews' | undefined;
  activeTab?: 'details' | 'reviews' | undefined;
  onTabChange?: ((tab: 'details' | 'reviews') => void) | undefined;
  detailsDescription?: string | undefined;
  detailsContent?: React.ReactNode | undefined;
  reviews?: PdpCollectorReview[] | undefined;
  reviewsContent?: React.ReactNode | undefined;

  /** Props da terceira linha: Carrossel "Mais dessa coleção" */
  relatedCarouselTitle?: string | undefined;
  relatedItems?: PdpRelatedItem[] | undefined;
  onSelectRelatedItem?: ((item: PdpRelatedItem) => void) | undefined;

  /** Classes adicionais */
  className?: string | undefined;
}

/**
 * Conteúdo principal da Página de Detalhes do Produto (PDP).
 *
 * Suporte completo a Desktop (Figma #10:244) e Mobile (Figma #15:5536):
 *
 * No Desktop:
 * - Linha 1: Galeria (573px sticky) + Seção de compra
 * - Linha 2: Tabs "Detalhes do NFT" e "Avaliacao de colecionadores (0)"
 * - Linha 3: Carrossel "Mais dessa colecao" (5 itens visíveis, arrastável por mouse)
 *
 * No Mobile:
 * - Barra superior com botão voltar (<) e botão favoritar (♡)
 * - Imagem em destaque com bordas arredondadas raio 40px
 * - Card de detalhes com sobreposição de raio 40px (Figma: Gap -114px, raio 40px)
 * - Título com badge em pill com rating ★ 4.8(19) no topo à direita
 * - Descrição, edições, ID do token, coleção, atributos e compartilhamento em fluxo vertical
 * - Tabs e Carrossel fluidos abaixo do card
 * - Barra Fixa de Compra (Sticky Buy Bar) na base da tela com Stepper de quantidade,
 *   preço em ETH, botão "Comprar NFT" e botão circular de carrinho
 */
export const PdpPageContent: React.FC<PdpPageContentProps> = ({
  galleryImages,
  title = 'Emerald Ape #042',
  priceEth = '1.19',
  priceUsd,
  rating = 4.8,
  reviewCount = 19,
  description = 'Um colecionável digital 1/50 finalizado à mão da coleção Kurio Editions, verificado na Ethereum.',
  versions,
  selectedVersionId,
  onSelectVersion,
  quantity: controlledQuantity,
  onQuantityChange,
  minQuantity = 1,
  maxQuantity = 10,
  isFavorite: controlledIsFavorite,
  onFavoriteToggle,
  onBuyNow,
  onAddToCart,
  isBuying = false,
  onBack,
  tokenId = '#0042',
  collectionName = 'Kurio Apes',
  isCollectionVerified,
  attributes,
  defaultTab,
  activeTab,
  onTabChange,
  detailsDescription,
  detailsContent,
  reviews,
  reviewsContent,
  relatedCarouselTitle,
  relatedItems,
  onSelectRelatedItem,
  className,
}) => {
  // Sincronização de estado de quantidade (para controlar desktop + barra fixa mobile)
  const [internalQuantity, setInternalQuantity] = React.useState<number>(1);
  const activeQuantity = controlledQuantity ?? internalQuantity;

  // Sincronização de estado de favorito (para controlar topo mobile + desktop)
  const [internalFavorite, setInternalFavorite] = React.useState<boolean>(false);
  const activeIsFavorite = controlledIsFavorite ?? internalFavorite;

  const handleQuantityChange = (qty: number) => {
    setInternalQuantity(qty);
    onQuantityChange?.(qty);
  };

  const handleDecrement = () => {
    if (activeQuantity <= minQuantity) return;
    handleQuantityChange(activeQuantity - 1);
  };

  const handleIncrement = () => {
    if (activeQuantity >= maxQuantity) return;
    handleQuantityChange(activeQuantity + 1);
  };

  const handleFavoriteToggle = () => {
    setInternalFavorite((prev) => !prev);
    onFavoriteToggle?.();
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== 'undefined' && window.history) {
      window.history.back();
    }
  };

  const handleCartClick = () => {
    if (onAddToCart) {
      onAddToCart();
    } else if (onBuyNow) {
      onBuyNow();
    }
  };

  return (
    <div
      data-testid="pdp-page-content"
      className={cn(
        'w-full max-w-[1440px] mx-auto px-0 lg:px-[120px] pt-4 md:pt-6 pb-36 lg:pb-10 relative overflow-x-clip lg:overflow-x-visible',
        className
      )}
    >
      {/* =========================================================================
          BACKGROUND DEGRADÊ MOBILE (#241612 -> #2F1D15):
          Aplicado exclusivamente na seção superior da foto no mobile
          ========================================================================= */}
      <div
        data-testid="pdp-mobile-top-gradient-bg"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(180deg, #241612 0%, #2F1D15 100%)',
        }}
        className="lg:hidden absolute top-0 left-0 right-0 w-full h-[460px] sm:h-[520px] md:h-[600px] bg-gradient-to-b from-[#241612] to-[#2F1D15] pointer-events-none z-0"
      />

      {/* =========================================================================
          TOPO MOBILE: BOTÃO VOLTAR (<) E BOTÃO FAVORITAR (♡) (Figma #15:5536)
          ========================================================================= */}
      <div
        data-testid="pdp-mobile-top-bar"
        className="flex items-center justify-between w-full mb-3 px-4 sm:px-6 md:px-10 lg:px-0 lg:hidden relative z-10"
      >
        <button
          type="button"
          onClick={handleBack}
          aria-label="Voltar à página anterior"
          data-testid="pdp-mobile-back-button"
          className={cn(
            'w-10 h-10 rounded-full bg-surface-card border border-border-default/60',
            'flex items-center justify-center text-text-primary hover:text-accent hover:border-accent',
            'transition-colors cursor-pointer active:scale-95 shadow-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
          )}
        >
          <IconArrowRight2 className="rotate-180 w-4 h-4 text-text-primary" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={handleFavoriteToggle}
          aria-label={activeIsFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          aria-pressed={activeIsFavorite}
          data-testid="pdp-mobile-favorite-button"
          className={cn(
            'w-10 h-10 rounded-full bg-surface-card border border-border-default/60',
            'flex items-center justify-center text-accent hover:border-accent',
            'transition-colors cursor-pointer active:scale-95 shadow-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            activeIsFavorite && 'bg-accent/15 border-accent'
          )}
        >
          {activeIsFavorite ? (
            <IconHeartFilled className="w-4 h-4 text-accent" aria-hidden="true" />
          ) : (
            <IconHeart className="w-4 h-4 text-accent" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* =========================================================================
          BREADCRUMB OFICIAL DESKTOP: Início / Mercado (Figma #10:244)
          ========================================================================= */}
      <Breadcrumb
        data-testid="pdp-breadcrumb"
        className="hidden lg:flex mb-6"
        items={[
          { label: 'Início', href: '/' },
          { label: 'Mercado', href: '/#catalogo' },
        ]}
      />

      {/* =========================================================================
          PRIMEIRA LINHA COM DUAS COLUNAS:
          - COLUNA 1: GALERIA DE IMAGENS DO PRODUTO (THUMBNAILS + FOTO COM ZOOM)
          - COLUNA 2: SEÇÃO COM INFORMAÇÕES DE COMPRA (SOBREPOSIÇÃO RAIO 40PX NO MOBILE)
          ========================================================================= */}
      <div
        data-testid="pdp-first-row-grid"
        className="flex flex-col lg:flex-row gap-0 lg:gap-[48px] xl:gap-[64px] items-stretch lg:items-start w-full relative z-10"
      >
        {/* Coluna 1 da página: Galeria de imagens do produto (largura exata de 573px no desktop) */}
        <div
          data-testid="pdp-col-gallery"
          className="w-full px-4 sm:px-6 md:px-10 lg:px-0 lg:w-[573px] lg:min-w-[573px] lg:max-w-[573px] shrink-0 lg:sticky lg:top-6 z-10"
        >
          <PdpGallery images={galleryImages} />
        </div>

        {/* Coluna 2 da página: Seção com informações de compra (Figma Mobile: colado nas laterais, Gap -114px, raio 40px) */}
        <div
          data-testid="pdp-col-purchase-info"
          className={cn(
            'w-full lg:w-auto flex-1 min-w-0',
            'm-0 -mt-[36px] sm:-mt-[44px] lg:mt-0 relative z-20',
            'bg-surface-card lg:bg-transparent rounded-t-[40px] lg:rounded-none',
            'px-5 py-6 sm:px-8 lg:p-0',
            'border-t border-border-default/50 lg:border-none',
            'shadow-2xl lg:shadow-none'
          )}
        >
          <PdpPurchaseSection
            title={title}
            priceEth={priceEth}
            priceUsd={priceUsd}
            rating={rating}
            reviewCount={reviewCount}
            description={description}
            versions={versions}
            selectedVersionId={selectedVersionId}
            onSelectVersion={onSelectVersion}
            quantity={activeQuantity}
            onQuantityChange={handleQuantityChange}
            minQuantity={minQuantity}
            maxQuantity={maxQuantity}
            isFavorite={activeIsFavorite}
            onFavoriteToggle={handleFavoriteToggle}
            onBuyNow={onBuyNow}
            isBuying={isBuying}
            tokenId={tokenId}
            collectionName={collectionName}
            isCollectionVerified={isCollectionVerified}
            attributes={attributes}
            hidePriceOnMobile={true}
            hideActionsOnMobile={true}
          />
        </div>
      </div>

      {/* =========================================================================
          SEGUNDA LINHA DA PÁGINA (ABAIXO DA PRIMEIRA LINHA):
          - DUAS TABS: "Detalhes do NFT" e "Avaliacao de colecionadores (N)"
          - Cabeçalho com linha sólida color primary
          - Botões com height 28px, font-size 17 (selecionado: color accent, bold, borda 2px da mesma cor)
          - Conteúdo com font-size 14, line-height 24, color text secondary, padding-top 12px
          ========================================================================= */}
      <div
        data-testid="pdp-second-row-tabs"
        className="w-full mt-10 md:mt-14 px-4 sm:px-6 md:px-10 lg:px-0"
      >
        <PdpTabs
          defaultTab={defaultTab}
          activeTab={activeTab}
          onTabChange={onTabChange}
          reviewCount={0}
          rating={rating}
          detailsDescription={detailsDescription ?? description}
          detailsContent={detailsContent}
          reviews={reviews}
          reviewsContent={reviewsContent}
        />
      </div>

      {/* =========================================================================
          TERCEIRA LINHA DA PÁGINA (ABAIXO DO COMPONENTE DE TABS):
          - Componente de carrossel com cinco itens visíveis
          - Cabeçalho: "Mais dessa colecao" em font size 17 e bold, cor text accent, height 28px e border solid bottom 1px color primary
          - Cada item: imagem 212x212 com bordas 13px dentro de container surface card com py 20px e px 4px
          - Entre container e nome: 12px
          - Nome em color foreground e font size 15
          - Preço abaixo do nome: cor text accent, font size 16px e bold
          - Entre cada item do carrossel: 26px
          ========================================================================= */}
      <div
        data-testid="pdp-third-row-carousel"
        className="w-full mt-10 md:mt-14 px-4 sm:px-6 md:px-10 lg:px-0"
      >
        <PdpRelatedCarousel
          title={relatedCarouselTitle}
          items={relatedItems}
          onSelectItem={onSelectRelatedItem}
        />
      </div>

      {/* =========================================================================
          BARRA FIXA DE COMPRA MOBILE (Sticky Buy Bar - Figma #15:5536)
          - Fixada na parte inferior da tela, garantindo ergonomia com o polegar
          - Linha 1: Stepper circular de quantidade (Qtd. - 1 +) e Preço em ETH
          - Linha 2: Botão largo "Comprar NFT" + Botão circular com ícone de carrinho
          ========================================================================= */}
      <div
        data-testid="pdp-mobile-sticky-buy-bar"
        style={{
          boxShadow: '0px 0px 20px rgba(10, 6, 4, 0.45)',
          borderRadius: '40px 40px 0px 0px',
        }}
        className={cn(
          'lg:hidden fixed bottom-0 left-0 right-0 z-40',
          'bg-surface-card/95 backdrop-blur-md border-t border-border-default/60',
          'rounded-t-[40px] shadow-[0px_0px_20px_rgba(10,6,4,0.45)]',
          'px-5 pt-4 pb-5 sm:pb-6 select-none'
        )}
      >
        {/* Linha 1 da barra fixa: Stepper de quantidade à esquerda e Preço em ETH à direita */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-mono font-medium text-text-secondary">
              Qtd.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={activeQuantity <= minQuantity}
                aria-label="Diminuir quantidade"
                data-testid="pdp-mobile-qty-decrement"
                className={cn(
                  'w-[30px] h-[30px] rounded-full bg-accent text-surface-default',
                  'flex items-center justify-center font-mono font-bold transition-transform active:scale-95 cursor-pointer',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  'disabled:opacity-40 disabled:pointer-events-none'
                )}
              >
                <IconMinus className="h-3 w-3 text-surface-default stroke-[3]" />
              </button>

              <span
                data-testid="pdp-mobile-quantity-value"
                className="font-mono font-bold text-text-primary text-[16px] min-w-[20px] text-center"
              >
                {activeQuantity}
              </span>

              <button
                type="button"
                onClick={handleIncrement}
                disabled={activeQuantity >= maxQuantity}
                aria-label="Aumentar quantidade"
                data-testid="pdp-mobile-qty-increment"
                className={cn(
                  'w-[30px] h-[30px] rounded-full bg-accent text-surface-default',
                  'flex items-center justify-center font-mono font-bold transition-transform active:scale-95 cursor-pointer',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  'disabled:opacity-40 disabled:pointer-events-none'
                )}
              >
                <IconPlus className="h-3 w-3 text-surface-default stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Preço em destaque em ETH */}
          <div className="text-right">
            <span
              data-testid="pdp-mobile-price-eth"
              className="text-[20px] sm:text-[22px] font-bold font-mono text-accent tracking-tight"
            >
              {priceEth} ETH
            </span>
          </div>
        </div>

        {/* Linha 2 da barra fixa: Botão Comprar NFT + Botão de Carrinho */}
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={onBuyNow}
            disabled={isBuying}
            data-testid="pdp-mobile-buy-button"
            className={cn(
              'w-[196px] h-[46px] rounded-full bg-accent text-surface-default font-mono font-bold tracking-wider text-[14px]',
              'hover:bg-action-primary-hover active:scale-[0.99] transition-all cursor-pointer shadow-md',
              'flex items-center justify-center',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              'disabled:opacity-50 disabled:pointer-events-none'
            )}
          >
            {isBuying ? 'Processando...' : 'Comprar NFT'}
          </button>

          <button
            type="button"
            onClick={handleCartClick}
            aria-label="Adicionar ao carrinho"
            data-testid="pdp-mobile-cart-button"
            className={cn(
              'w-[46px] h-[46px] rounded-full bg-surface-raised border border-border-default/80',
              'flex items-center justify-center text-text-primary hover:text-accent hover:border-accent',
              'transition-all cursor-pointer active:scale-95 shadow-sm shrink-0',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
            )}
          >
            <IconCart className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

PdpPageContent.displayName = 'PdpPageContent';
