import * as React from 'react';
import { ChevronLeft } from 'lucide-react';
import { cn } from '../../index';

export interface MobileHeaderProps {
  /**
   * Título ou conteúdo exibido na coluna central com quebra de linha automática.
   */
  title: React.ReactNode;
  /**
   * Callback invocado ao clicar no botão de voltar (coluna 1).
   * Se não fornecido e `showBackButton` for true, executa `window.history.back()`.
   */
  onBackClick?: (() => void) | undefined;
  /**
   * Define se o botão circular de voltar de 35x35px deve ser exibido na primeira coluna.
   * @default true
   */
  showBackButton?: boolean | undefined;
  /**
   * Elemento customizado a ser exibido na primeira coluna, substituindo o botão de voltar padrão.
   */
  leftAction?: React.ReactNode | undefined;
  /**
   * Elemento customizado a ser exibido na terceira coluna (ex: botão circular de menu, carrinho, fechar).
   */
  rightAction?: React.ReactNode | undefined;
  /**
   * data-testid do botão de voltar.
   * @default "mobile-header-back-button"
   */
  backTestId?: string | undefined;
  /**
   * data-testid do container de título.
   * @default "mobile-header-title-container"
   */
  titleTestId?: string | undefined;
  /**
   * Rótulo de acessibilidade para o botão de voltar padrão.
   * @default "Voltar"
   */
  backAriaLabel?: string | undefined;
  /**
   * Classes adicionais no container da barra móvel.
   */
  className?: string | undefined;
}

/**
 * Componente genérico e desacoplado de cabeçalho mobile com 3 colunas:
 * - Coluna 1: Ação da esquerda (por padrão, bolinha circular de 35x35px com seta curvada para trás).
 * - Coluna 2: Título central flexível com quebra de linha que ocupa todo o espaço restante.
 * - Coluna 3: Ação da direita (botão de menu, fechar, carrinho, etc.).
 *
 * Visível exclusivamente no breakpoint mobile (`md:hidden`), sincronizado com o desaparecimento do Header principal.
 */
export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  onBackClick,
  showBackButton = true,
  leftAction,
  rightAction,
  backAriaLabel = 'Voltar',
  backTestId = 'mobile-header-back-button',
  titleTestId = 'mobile-header-title-container',
  className,
}) => {
  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <header
      className={cn(
        'w-full font-mono md:hidden select-none mb-6',
        className
      )}
      data-testid="mobile-header"
    >
      <div className="flex items-center justify-between gap-3 w-full">
        {/* Coluna 1: Ação da esquerda (35x35) */}
        <div className="w-[35px] h-[35px] shrink-0 flex items-center justify-center">
          {leftAction ? (
            leftAction
          ) : showBackButton ? (
            <button
              type="button"
              onClick={handleBack}
              aria-label={backAriaLabel}
              className="w-[35px] h-[35px] min-w-[35px] min-h-[35px] max-w-[35px] max-h-[35px] shrink-0 rounded-full bg-surface-card hover:bg-surface-raised active:scale-95 flex items-center justify-center text-text-secondary hover:text-text-primary transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              data-testid={backTestId}
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        {/* Coluna 2: Título central com quebra de linha */}
        <div
          className="flex-1 min-w-0 text-center px-2"
          data-testid={titleTestId}
        >
          {typeof title === 'string' ? (
            <h1 className="text-[17px] sm:text-[18px] font-bold text-text-primary tracking-tight break-words leading-tight">
              {title}
            </h1>
          ) : (
            title
          )}
        </div>

        {/* Coluna 3: Ação da direita (35x35) */}
        <div className="w-[35px] h-[35px] shrink-0 flex items-center justify-center">
          {rightAction ? (
            rightAction
          ) : (
            // Placeholder vazio de 35px para manter a centralização geométrica perfeita do título
            <div className="w-[35px] h-[35px]" aria-hidden="true" />
          )}
        </div>
      </div>
    </header>
  );
};

MobileHeader.displayName = 'MobileHeader';
