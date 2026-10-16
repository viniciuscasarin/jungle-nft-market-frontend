import * as React from 'react';
import { cn } from '@nft/shared-ui';

export interface AccountLayoutProps {
  /**
   * Coluna lateral de navegação com largura fixa de 310px (visível apenas em telas grandes desktop).
   */
  sidebar: React.ReactNode;
  /**
   * Cabeçalho de 3 colunas para dispositivos móveis (visível apenas em telas menores que lg).
   */
  mobileHeader?: React.ReactNode;
  /**
   * Coluna principal de conteúdo da página atual, ocupando todo o espaço restante.
   */
  children: React.ReactNode;
  /**
   * Classes adicionais para o container do grid.
   */
  className?: string;
}

/**
 * Layout principal do app Account.
 *
 * Estrutura:
 * - Coluna 1: Barra lateral de navegação com largura fixa de 310px (oculta em telas mobile).
 * - Coluna 2: Conteúdo da página atual ocupando todo o espaço restante do grid.
 * - Espaçamento entre as duas colunas: exatamente 28px (`gap-[28px]`).
 */
export const AccountLayout: React.FC<AccountLayoutProps> = ({
  sidebar,
  mobileHeader,
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-[120px] py-4 md:py-8',
        className
      )}
    >
      <div
        className="grid grid-cols-1 md:grid-cols-[310px_1fr] gap-[28px] items-start w-full"
        data-testid="account-grid-layout"
      >
        {/* Coluna 1: Coluna lateral de largura fixa de 310px (visível apenas a partir de md) */}
        <div
          className="hidden md:block w-full md:w-[310px] md:min-w-[310px] md:max-w-[310px] shrink-0"
          data-testid="account-sidebar-column"
        >
          {sidebar}
        </div>

        {/* Coluna 2: Conteúdo da página atual ocupando todo o espaço restante do grid */}
        <section
          aria-label="Conteúdo da página de conta"
          className="flex-1 min-w-0 w-full"
          data-testid="account-content-column"
        >
          {mobileHeader}
          {children}
        </section>
      </div>
    </div>
  );
};

AccountLayout.displayName = 'AccountLayout';
