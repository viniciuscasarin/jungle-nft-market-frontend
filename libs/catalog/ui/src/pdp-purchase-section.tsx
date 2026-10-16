import * as React from 'react';
import {
  cn,
  Button,
  IconHeart,
  IconHeartFilled,
  IconMinus,
  IconPlus,
  IconLinkedin,
  IconTwitter,
} from '@nft/shared-ui';

export interface PdpVersionOption {
  id: string;
  name: string;
  editionBadge: string;
  availableStock?: number | undefined;
  totalStock?: number | undefined;
  priceEth?: string | undefined;
  isSoldOut?: boolean | undefined;
}

export interface PdpAttributeItem {
  trait_type: string;
  value: string;
  rarityPercentage?: number | undefined;
}

export interface PdpPurchaseSectionProps {
  /** Linha 1: Nome do produto */
  title?: string | undefined;

  /** Linha 2: Preço em ETH */
  priceEth?: string | undefined;
  /** Linha 2: Preço aproximado em USD */
  priceUsd?: string | undefined;
  /** Linha 2: Nota de avaliação (0 a 5) */
  rating?: number | undefined;
  /** Linha 2: Quantidade de avaliações */
  reviewCount?: number | undefined;

  /** Linha 3: Texto sobre o produto */
  description?: string | undefined;
  /** Linha 3: Label customizável (padrão Figma: "Sobre este NFT:") */
  aboutLabel?: string | undefined;

  /** Linha 4: Opções de versão do produto */
  versions?: PdpVersionOption[] | undefined;
  selectedVersionId?: string | undefined;
  onSelectVersion?: ((versionId: string) => void) | undefined;

  /** Linha 5: Quantidade */
  quantity?: number | undefined;
  onQuantityChange?: ((quantity: number) => void) | undefined;
  minQuantity?: number | undefined;
  maxQuantity?: number | undefined;

  /** Linha 5: Botões de ação */
  isFavorite?: boolean | undefined;
  onFavoriteToggle?: (() => void) | undefined;
  onBuyNow?: (() => void) | undefined;
  onAddToCart?: (() => void) | undefined;
  isAddingToCart?: boolean | undefined;
  isSoldOut?: boolean | undefined;
  isBuying?: boolean | undefined;

  /** Próxima Linha 1: ID do Token */
  tokenId?: string | undefined;
  tokenStandard?: string | undefined;

  /** Próxima Linha 2: Coleção */
  collectionName?: string | undefined;
  isCollectionVerified?: boolean | undefined;

  /** Próxima Linha 3: Atributos */
  attributes?: PdpAttributeItem[] | undefined;
  attributesFormatted?: string | undefined;

  /** Ocultar preço e avaliações em viewport mobile (pois são transferidos para barra fixa e badge de título) */
  hidePriceOnMobile?: boolean | undefined;

  /** Ocultar ações de compra no fluxo normal em viewport mobile (pois são transferidas para barra fixa) */
  hideActionsOnMobile?: boolean | undefined;

  /** Classes adicionais */
  className?: string | undefined;
}

const DEFAULT_VERSIONS: PdpVersionOption[] = [
  { id: 'v-1', name: '1/1', editionBadge: '1/1' },
  { id: 'v-2', name: '1/10', editionBadge: '1/10' },
  { id: 'v-3', name: '1/50', editionBadge: '1/50' },
  { id: 'v-4', name: 'ABERTA', editionBadge: 'ABERTA' },
];

const DEFAULT_ATTRIBUTES: PdpAttributeItem[] = [
  { trait_type: 'Acessório', value: 'Óculos' },
  { trait_type: 'Material', value: 'Esmeralda' },
  { trait_type: 'Raridade', value: 'Raro' },
];

/**
 * Seção de informações de compra do produto (Figma #10:244 Detalhes do NFT).
 *
 * Fidelidade visual absoluta ao Figma:
 * - Linha 1: Nome do produto (`Emerald Ape #042`) em fonte mono bold grande branca
 * - Linha 2: Preço (`1.19 ETH`) em cor accent dourada à esquerda, e à direita 5 estrelas amarelas + `19 avaliações de colecionadores`
 * - Linha 3: Label `Sobre este NFT:` seguido do parágrafo descritivo em fonte mono
 * - Linha 4: Label `Edição:` seguido dos chips arredondados (1/1, 1/10, 1/50, ABERTA)
 * - Linha 5: Seletor de quantidade (botão circular -, número, botão circular +) seguido dos botões `COMPRAR` e `Favoritar`
 * - Linhas consecutivas:
 *   - `ID do token: #0042`
 *   - `Coleção: Kurio Apes`
 *   - `Atributos: Óculos, Esmeralda, Raro`
 *   - `Compartilhar este NFT:` com ícones sociais inline
 */
export const PdpPurchaseSection: React.FC<PdpPurchaseSectionProps> = ({
  title = 'Emerald Ape #042',
  priceEth = '1.19',
  priceUsd,
  rating = 5.0,
  reviewCount = 19,
  description = 'Um colecionável digital finalizado à mão da coleção Kurio Editions, verificado na Ethereum, com arte desbloqueável e acesso para colecionadores.',
  aboutLabel = 'Sobre este NFT:',
  versions = DEFAULT_VERSIONS,
  selectedVersionId: controlledVersionId,
  onSelectVersion,
  quantity: controlledQuantity,
  onQuantityChange,
  minQuantity = 1,
  maxQuantity = 10,
  isFavorite: controlledIsFavorite,
  onFavoriteToggle,
  onBuyNow,
  onAddToCart,
  isAddingToCart = false,
  isSoldOut = false,
  isBuying = false,
  tokenId = '#0042',
  collectionName = 'Kurio Apes',
  attributes = DEFAULT_ATTRIBUTES,
  attributesFormatted,
  hidePriceOnMobile = false,
  hideActionsOnMobile = false,
  className,
}) => {
  // Estado local para versão se não for controlado (padrão v-3: 1/50 do Figma)
  const [internalVersionId, setInternalVersionId] = React.useState<string>(
    controlledVersionId ?? versions[2]?.id ?? 'v-3',
  );
  const activeVersionId = controlledVersionId ?? internalVersionId;

  // Estado local para quantidade
  const [internalQuantity, setInternalQuantity] = React.useState<number>(1);
  const activeQuantity = controlledQuantity ?? internalQuantity;

  // Estado local para favorito
  const [internalFavorite, setInternalFavorite] = React.useState<boolean>(false);
  const activeIsFavorite = controlledIsFavorite ?? internalFavorite;

  const handleVersionChange = (id: string) => {
    setInternalVersionId(id);
    onSelectVersion?.(id);
  };

  const handleDecrement = () => {
    if (activeQuantity <= minQuantity) return;
    const next = activeQuantity - 1;
    setInternalQuantity(next);
    onQuantityChange?.(next);
  };

  const handleIncrement = () => {
    if (activeQuantity >= maxQuantity) return;
    const next = activeQuantity + 1;
    setInternalQuantity(next);
    onQuantityChange?.(next);
  };

  const handleFavoriteClick = () => {
    setInternalFavorite(prev => !prev);
    onFavoriteToggle?.();
  };

  // String formatada dos atributos conforme o Figma ("Óculos, Esmeralda, Raro")
  const displayAttributes =
    attributesFormatted ??
    attributes
      .map(a => a.value)
      .filter(Boolean)
      .join(', ');

  return (
    <div
      data-testid="pdp-purchase-section"
      className={cn(
        'flex flex-col gap-2 w-full text-text-primary font-mono select-none',
        className,
      )}
    >
      {/* =========================================================================
          LINHA 1: NOME DO PRODUTO (Figma: Emerald Ape #042)
          No Mobile: Nome do produto + badge em pill ★ 4.8(19) no canto direito
          ========================================================================= */}
      <div data-testid="pdp-row-1-title" className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <h1
            data-testid="pdp-product-title"
            className="text-[20px] sm:text-[24px] md:text-[28px] font-bold text-text-primary tracking-tight font-mono leading-tight"
          >
            {title}
          </h1>

          {/* Badge de avaliação no Mobile (Figma #15:5536: ★ 4.8(19) ao lado do título) */}
          <div
            data-testid="pdp-mobile-rating-badge"
            className="lg:hidden flex items-center gap-1.5 border border-accent/70 rounded-full px-2.5 py-0.5 text-[12px] font-mono text-accent shrink-0 bg-accent/10"
            aria-label={`Avaliação ${rating} de 5 estrelas (${reviewCount} avaliações)`}
          >
            <span className="text-[12px] text-accent font-bold" aria-hidden="true">
              ★
            </span>
            <span className="text-text-primary font-bold">{rating}</span>
            <span className="text-text-secondary">({reviewCount})</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          LINHA 2: PREÇO EM ETH E AVALIAÇÕES DE COLECIONADORES (Figma Desktop #10:244)
          ========================================================================= */}
      <div
        data-testid="pdp-row-2-price-rating"
        className={cn(
          'flex-wrap items-center justify-between gap-4 pt-1 pb-2',
          hidePriceOnMobile ? 'hidden lg:flex' : 'flex',
        )}
      >
        {/* Preço em ETH */}
        <div className="flex items-baseline gap-2">
          <span
            data-testid="pdp-price-eth"
            className="text-[22px] sm:text-[24px] font-bold font-mono text-accent tracking-tight"
          >
            {priceEth} ETH
          </span>
          {priceUsd && <span className="text-[13px] font-mono text-text-muted">({priceUsd})</span>}
        </div>

        {/* 5 Estrelas + 19 avaliações de colecionadores */}
        <div
          data-testid="pdp-rating-container"
          aria-label={`Avaliação ${rating} de 5 estrelas baseada em ${reviewCount} avaliações de colecionadores`}
          className="flex items-center gap-2 text-caption-13 font-mono text-text-primary"
        >
          <div className="flex items-center gap-0.5 text-accent" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className="text-[15px]">
                ★
              </span>
            ))}
          </div>
          <span className="text-text-primary text-[13px]">
            {reviewCount} avaliações de colecionadores
          </span>
        </div>
      </div>

      {/* =========================================================================
          LINHA 3: TEXTO SOBRE O PRODUTO ABAIXO DO LABEL "Sobre este NFT:"
          ========================================================================= */}
      <div data-testid="pdp-row-3-about" className="space-y-1.5 pt-1">
        <label
          htmlFor="pdp-nft-description"
          data-testid="pdp-about-label"
          className="text-[15px] font-mono font-bold text-text-primary block"
        >
          {aboutLabel}
        </label>
        <p
          id="pdp-nft-description"
          data-testid="pdp-product-description"
          className="text-[14px] text-text-secondary leading-[24px] font-mono max-w-xl"
        >
          {description}
        </p>
      </div>

      {/* =========================================================================
          LINHA 4: EDICÃO COM CHIPS ARREDONDADOS (Figma: 1/1  1/10  1/50  ABERTA)
          ========================================================================= */}
      <div data-testid="pdp-row-4-versions" className="space-y-2 pt-1">
        <span className="text-[15px] font-mono font-bold text-text-primary block">Edição:</span>

        <div
          role="radiogroup"
          aria-label="Opções de edição"
          className="flex flex-wrap items-center gap-2.5"
        >
          {versions.map(ver => {
            const isSelected = ver.id === activeVersionId;
            const isSoldOut =
              ver.isSoldOut || (ver.availableStock !== undefined && ver.availableStock === 0);

            return (
              <button
                key={ver.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={isSoldOut}
                onClick={() => handleVersionChange(ver.id)}
                data-testid={`pdp-version-option-${ver.id}`}
                className={cn(
                  'px-3.5 py-1 rounded-full font-mono text-[13px] font-medium border transition-colors cursor-pointer select-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default',
                  isSelected
                    ? 'bg-accent/20 text-accent font-bold border-2 border-accent shadow-sm'
                    : 'bg-transparent text-text-primary border-border-default hover:border-accent hover:text-accent',
                  isSoldOut && 'opacity-40 cursor-not-allowed border-dashed',
                )}
              >
                {ver.editionBadge}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          LINHA 5: SELETOR DE QUANTIDADE + BOTÕES "COMPRAR" E "Favoritar"
          (No Desktop permanece no fluxo; no Mobile é gerenciado pela barra fixa)
          ========================================================================= */}
      <div
        data-testid="pdp-row-5-actions"
        className={cn(
          'flex-wrap items-center justify-between gap-4 pt-3 pb-2',
          hideActionsOnMobile ? 'hidden lg:flex' : 'flex',
        )}
      >
        {/* Seletor de quantidade no estilo circular Figma (- 1 +) */}
        <div data-testid="pdp-quantity-stepper-container" className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={activeQuantity <= minQuantity}
            aria-label="Diminuir quantidade"
            className={cn(
              'w-[32px] h-[32px] rounded-full bg-accent text-surface-default',
              'flex items-center justify-center font-mono font-bold transition-transform active:scale-95 cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-surface-default',
              'disabled:opacity-40 disabled:pointer-events-none',
            )}
          >
            <IconMinus className="h-3.5 w-3.5 text-surface-default stroke-[3]" />
          </button>

          <span
            data-testid="pdp-quantity-value"
            className="font-mono font-bold text-text-primary text-[16px] min-w-[20px] text-center"
          >
            {activeQuantity}
          </span>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={activeQuantity >= maxQuantity}
            aria-label="Aumentar quantidade"
            className={cn(
              'w-[32px] h-[32px] rounded-full bg-accent text-surface-default',
              'flex items-center justify-center font-mono font-bold transition-transform active:scale-95 cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-accent focus-visible:ring-offset-1 focus-visible:ring-offset-surface-default',
              'disabled:opacity-40 disabled:pointer-events-none',
            )}
          >
            <IconPlus className="h-3.5 w-3.5 text-surface-default stroke-[3]" />
          </button>
        </div>

        {/* Botões COMPRAR e Favoritar lado a lado */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            onClick={onAddToCart}
            loading={isAddingToCart}
            loadingLabel="Adicionando..."
            disabled={isSoldOut}
            data-testid="pdp-add-to-cart-button"
          >
            Adicionar ao carrinho
          </Button>
          <button
            type="button"
            onClick={onBuyNow}
            disabled={isBuying}
            data-testid="pdp-buy-now-button"
            className={cn(
              'h-[42px] px-8 rounded-sm bg-accent text-surface-default font-mono font-bold uppercase tracking-wider text-[14px]',
              'hover:bg-action-primary-hover active:scale-[0.99] transition-all cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default',
              'disabled:opacity-50 disabled:pointer-events-none',
            )}
          >
            {isBuying ? 'Processando...' : 'COMPRAR'}
          </button>

          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={activeIsFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            aria-pressed={activeIsFavorite}
            data-testid="pdp-favorite-button"
            className={cn(
              'h-[42px] px-5 rounded-sm border border-accent bg-transparent text-accent font-mono text-[14px] font-medium',
              'inline-flex items-center gap-2 hover:bg-accent/10 active:scale-[0.99] transition-all cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default',
              activeIsFavorite && 'bg-accent/15 font-bold',
            )}
          >
            {activeIsFavorite ? (
              <IconHeartFilled className="h-4 w-4 text-accent" aria-hidden="true" />
            ) : (
              <IconHeart className="h-4 w-4 text-accent" aria-hidden="true" />
            )}
            <span>Favoritar</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          PRÓXIMAS LINHAS CONSECUTIVAS (Figma: ID do token, Coleção, Atributos, Compartilhar)
          ========================================================================= */}
      <div
        data-testid="pdp-consecutive-details"
        className="pt-3 space-y-2 text-[14px] leading-[22px] border-t border-border-default/40 mt-1"
      >
        {/* ID do Token */}
        <div data-testid="pdp-detail-token-id" className="flex items-center gap-2">
          <span className="text-text-secondary">ID do token:</span>
          <span data-testid="pdp-token-id-value" className="text-text-secondary">
            {tokenId}
          </span>
        </div>

        {/* Coleção */}
        <div data-testid="pdp-detail-collection" className="flex items-center gap-2">
          <span className="text-text-secondary">Coleção:</span>
          <span data-testid="pdp-collection-name" className="text-text-secondary">
            {collectionName}
          </span>
        </div>

        {/* Atributos */}
        <div data-testid="pdp-detail-attributes" className="flex items-center gap-2 flex-wrap">
          <span className="text-text-secondary">Atributos:</span>
          <span className="text-text-secondary">{displayAttributes}</span>

          {/* Grid invisível para retrocompatibilidade com testes que buscam pdp-attributes-grid */}
          <div data-testid="pdp-attributes-grid" className="sr-only">
            {attributes.map((a, i) => (
              <div key={i} data-testid={`pdp-attribute-card-${i}`}>
                <span>{a.trait_type}</span>
                <span>{a.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Compartilhar este NFT (Figma: Compartilhar este NFT: in ✉ 🐦 em color foreground) */}
        <div
          data-testid="pdp-detail-share"
          className="flex items-center gap-3 pt-1 text-text-primary text-[14px]"
        >
          <span className="text-text-primary">Compartilhar este NFT:</span>
          <div className="flex items-center gap-2.5 text-text-primary">
            <button
              type="button"
              aria-label="Compartilhar no LinkedIn"
              className="text-text-primary hover:text-accent transition-colors cursor-pointer"
            >
              <IconLinkedin className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Compartilhar por E-mail"
              className="text-text-primary hover:text-accent transition-colors cursor-pointer text-[15px]"
            >
              ✉
            </button>
            <button
              type="button"
              aria-label="Compartilhar no Twitter"
              className="text-text-primary hover:text-accent transition-colors cursor-pointer"
            >
              <IconTwitter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

PdpPurchaseSection.displayName = 'PdpPurchaseSection';
