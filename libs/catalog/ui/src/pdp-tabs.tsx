import * as React from 'react';
import { cn } from '@nft/shared-ui';

export interface PdpCollectorReview {
  id: string;
  authorName: string;
  authorAddress?: string | undefined;
  avatarUrl?: string | undefined;
  rating: number;
  date: string;
  comment: string;
  verifiedBuyer?: boolean | undefined;
}

export interface PdpTabsProps {
  /** Tab selecionada inicialmente ('details' | 'reviews') */
  defaultTab?: 'details' | 'reviews' | undefined;
  /** Tab selecionada de forma controlada */
  activeTab?: 'details' | 'reviews' | undefined;
  /** Notificação ao alternar a tab */
  onTabChange?: ((tab: 'details' | 'reviews') => void) | undefined;
  /** Quantidade N de avaliações para o título "Avaliacao de colecionadores (N)" (padrão 0) */
  reviewCount?: number | undefined;
  /** Nota média geral para a aba de avaliações */
  rating?: number | undefined;
  /** Texto ou descrição longa da aba de detalhes */
  detailsDescription?: string | undefined;
  /** Conteúdo customizado para substituir ou compor a tab de detalhes */
  detailsContent?: React.ReactNode | undefined;
  /** Lista de depoimentos/avaliações de colecionadores */
  reviews?: PdpCollectorReview[] | undefined;
  /** Conteúdo customizado para substituir ou compor a tab de avaliações */
  reviewsContent?: React.ReactNode | undefined;
  /** Mensagem customizada quando não houver avaliações */
  emptyReviewsMessage?: string | undefined;
  /** Label customizável da primeira tab (padrão: "Detalhes do NFT") */
  detailsTabLabel?: string | undefined;
  /** Label customizável da segunda tab (padrão: "Avaliacao de colecionadores (0)") */
  reviewsTabLabel?: string | undefined;
  /** Classes CSS adicionais */
  className?: string | undefined;
}

/**
 * Segunda linha da Página de Detalhes do Produto (PDP):
 * Abas com "Detalhes do NFT" e "Avaliacao de colecionadores (N)".
 *
 * Especificações visuais:
 * - Cabeçalho das tabs: linha sólida color primary (`border-b border-solid border-primary`)
 * - Botões das tabs:
 *   - Ambos: height 28px (`h-[28px]`), font size 17 (`text-[17px]`), margem inferior de -1px para sobrepor a linha sem pulo vertical
 *   - Normal: color foreground (`text-text-primary`), borda inferior transparente
 *   - Selecionado: color accent (`text-accent`), bold (`font-bold`), borda sólida 2px na cor do texto (`border-b-2 border-solid border-accent`)
 * - Conteúdo da tab: font size 14 (`text-[14px]`), line height 24 (`leading-[24px]`), color text secondary (`text-text-secondary`), padding top 12px (`pt-[12px]`)
 */
export const PdpTabs: React.FC<PdpTabsProps> = ({
  defaultTab = 'details',
  activeTab: controlledActiveTab,
  onTabChange,
  reviewCount = 0,
  detailsDescription,
  detailsContent,
  reviews = [],
  reviewsContent,
  emptyReviewsMessage = 'Ainda não há avaliações neste produto.',
  detailsTabLabel = 'Detalhes do NFT',
  reviewsTabLabel,
  className,
}) => {
  const [internalTab, setInternalTab] = React.useState<'details' | 'reviews'>(defaultTab);

  const isControlled = controlledActiveTab !== undefined;
  const currentTab = isControlled ? controlledActiveTab : internalTab;

  const handleSelectTab = (tab: 'details' | 'reviews') => {
    if (!isControlled) {
      setInternalTab(tab);
    }
    onTabChange?.(tab);
  };

  const computedReviewsLabel =
    reviewsTabLabel ?? `Avaliacao de colecionadores (${reviewCount})`;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      handleSelectTab(currentTab === 'details' ? 'reviews' : 'details');
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      handleSelectTab(currentTab === 'reviews' ? 'details' : 'reviews');
    }
  };

  return (
    <div
      data-testid="pdp-tabs-container"
      className={cn('w-full flex flex-col', className)}
    >
      {/* =========================================================================
          CABEÇALHO DAS TABS:
          - Linha sólida color primary (border-b border-solid border-primary)
          - Alinhamento items-end para manter a base estável sem 'dançadinha'
          - Sem overflow-x-auto para evitar calha/scroll horizontal no Windows
          ========================================================================= */}
      <div
        data-testid="pdp-tabs-header"
        role="tablist"
        aria-label="Informações detalhadas e avaliações do NFT"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="w-full flex items-end gap-6 sm:gap-8 border-b border-solid border-primary select-none"
      >
        {/* Tab 1: Detalhes do NFT */}
        <button
          type="button"
          role="tab"
          id="pdp-tab-details"
          data-testid="pdp-tab-details-btn"
          aria-selected={currentTab === 'details'}
          aria-controls="pdp-tabpanel-details"
          tabIndex={currentTab === 'details' ? 0 : -1}
          onClick={() => handleSelectTab('details')}
          className={cn(
            'h-[28px] box-border text-[17px] inline-flex items-center justify-center whitespace-nowrap cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default border-b-2 border-solid -mb-[1px]',
            currentTab === 'details'
              ? 'text-accent font-bold border-accent'
              : 'text-text-primary border-transparent hover:text-accent font-normal'
          )}
        >
          {detailsTabLabel}
        </button>

        {/* Tab 2: Avaliação de colecionadores (0) */}
        <button
          type="button"
          role="tab"
          id="pdp-tab-reviews"
          data-testid="pdp-tab-reviews-btn"
          aria-selected={currentTab === 'reviews'}
          aria-controls="pdp-tabpanel-reviews"
          tabIndex={currentTab === 'reviews' ? 0 : -1}
          onClick={() => handleSelectTab('reviews')}
          className={cn(
            'h-[28px] box-border text-[17px] inline-flex items-center justify-center whitespace-nowrap cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default border-b-2 border-solid -mb-[1px]',
            currentTab === 'reviews'
              ? 'text-accent font-bold border-accent'
              : 'text-text-primary border-transparent hover:text-accent font-normal'
          )}
        >
          {computedReviewsLabel}
        </button>
      </div>

      {/* =========================================================================
          CONTEÚDO DA TAB:
          - Font size 14 (`text-[14px]`)
          - Line height 24 (`leading-[24px]`)
          - Color text secondary (`text-text-secondary`)
          - Padding top de 12px (`pt-[12px]`)
          ========================================================================= */}

      {/* Painel da Tab 1: Detalhes do NFT (Apenas texto descritivo, sem card de especificações de contrato) */}
      {currentTab === 'details' && (
        <div
          role="tabpanel"
          id="pdp-tabpanel-details"
          data-testid="pdp-tabpanel-details"
          aria-labelledby="pdp-tab-details"
          tabIndex={0}
          className="text-[14px] leading-[24px] text-text-secondary pt-[12px] w-full focus-visible:outline-none"
        >
          {detailsContent ? (
            detailsContent
          ) : (
            <div
              data-testid="pdp-details-description-text"
              className="space-y-3"
            >
              <p>
                {detailsDescription ??
                  'Esta obra combina técnicas gerativas avançadas com pintura vetorial de alta precisão, capturando o fluxo de energia cinética e o dinamismo cibernético da era moderna. Cada camada foi esculpida para proporcionar uma experiência visual única tanto em displays imersivos quanto em ambientes de galeria virtual em realidade estendida.'}
              </p>
              <p>
                Criada sob curadoria exclusiva do Jungle NFT Market, a peça traz certificados de autenticidade criptográfica com registro permanente na Ethereum Virtual Machine (EVM). O colecionador titular adquire o direito de exibição pessoal e não-comercial, com metadados perenes protegidos contra mutações.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Painel da Tab 2: Avaliação de colecionadores (N) */}
      {currentTab === 'reviews' && (
        <div
          role="tabpanel"
          id="pdp-tabpanel-reviews"
          data-testid="pdp-tabpanel-reviews"
          aria-labelledby="pdp-tab-reviews"
          tabIndex={0}
          className="text-[14px] leading-[24px] text-text-secondary pt-[12px] w-full focus-visible:outline-none"
        >
          {reviewsContent ? (
            reviewsContent
          ) : reviews.length > 0 && reviewCount > 0 ? (
            <div
              data-testid="pdp-reviews-list"
              className="flex flex-col gap-4"
            >
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  data-testid={`pdp-review-card-${rev.id}`}
                  className="flex flex-col gap-2 p-4 rounded-md border border-border-default/80 bg-surface-card/60"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-semibold text-text-primary text-[14px]">
                      {rev.authorName}
                    </span>
                    <span className="text-[12px] text-text-muted">
                      {rev.date}
                    </span>
                  </div>
                  <p className="text-[14px] leading-[24px] text-text-secondary mt-1">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            /* Mensagem informando que ainda não há avaliações neste produto */
            <div
              data-testid="pdp-reviews-empty"
              className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-md border border-border-default/60 bg-surface-card/40"
            >
              <p
                data-testid="pdp-no-reviews-message"
                className="text-[15px] font-medium text-text-primary mb-1"
              >
                {emptyReviewsMessage}
              </p>
              <p className="text-[13px] text-text-muted max-w-md">
                Seja o primeiro colecionador a avaliar este produto após concluir a sua aquisição.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

PdpTabs.displayName = 'PdpTabs';
