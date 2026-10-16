import * as React from 'react';

export interface CartMobileHeaderProps {
  title?: string | undefined;
  onBack?: (() => void) | undefined;
  className?: string | undefined;
}

/**
 * Top bar mobile específica do Carrinho de NFTs (#16:360).
 * Contém botão circular de retorno e título mono centralizado.
 */
export const CartMobileHeader: React.FC<CartMobileHeaderProps> = ({
  title = 'Carrinho de NFTs',
  onBack,
  className = '',
}) => {
  return (
    <header
      data-testid="cart-mobile-header"
      className={`w-full flex items-center justify-between px-4 pt-6 pb-4 font-mono select-none ${className}`}
    >
      {/* Botão circular de voltar */}
      <button
        type="button"
        onClick={onBack}
        aria-label="Voltar para a página anterior"
        className="w-11 h-11 rounded-full bg-surface-card border border-border-default/80 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      {/* Título centralizado */}
      <h1 className="font-mono font-bold text-title-20 text-text-primary tracking-wide text-center">
        {title}
      </h1>

      {/* Espaçador equilibrado para manter título central */}
      <div className="w-11 h-11 pointer-events-none" aria-hidden="true" />
    </header>
  );
};
