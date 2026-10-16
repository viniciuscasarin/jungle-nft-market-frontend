import * as React from 'react';
import { Menu, X } from 'lucide-react';
import { cn, MobileHeader } from '@nft/shared-ui';
import {
  ACCOUNT_MENU_ITEMS,
  type AccountMenuId,
} from './account-navigation';

export interface AccountMobileHeaderProps {
  /**
   * Título da página atual a ser exibido na coluna central (ex: "Dados do perfil", "Carteiras", etc.)
   */
  title: string;
  /**
   * ID do menu atualmente selecionado.
   */
  activeMenu: AccountMenuId;
  /**
   * Callback invocado quando o usuário escolhe uma página no menu móvel.
   */
  onSelectMenu: (menuId: AccountMenuId) => void;
  /**
   * Callback customizado para ação de voltar. Se omitido, executa `window.history.back()`.
   */
  onBackClick?: (() => void) | undefined;
  className?: string | undefined;
}

export const AccountMobileHeader: React.FC<AccountMobileHeaderProps> = ({
  title,
  activeMenu,
  onSelectMenu,
  onBackClick,
  className,
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Fecha o modal ao pressionar ESC
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const primaryItems = ACCOUNT_MENU_ITEMS.filter((item) => !item.isAction);
  const actionItems = ACCOUNT_MENU_ITEMS.filter((item) => item.isAction);

  return (
    <div className={cn('w-full font-mono md:hidden mb-6', className)}>
      {/* Componente desacoplado de cabeçalho mobile de 3 colunas */}
      <MobileHeader
        title={title}
        onBackClick={onBackClick}
        backTestId="account-mobile-back-button"
        titleTestId="account-mobile-title-container"
        rightAction={
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Abrir menu de navegação da conta"
            aria-expanded={isMenuOpen}
            aria-haspopup="dialog"
            className="w-[35px] h-[35px] min-w-[35px] min-h-[35px] max-w-[35px] max-h-[35px] shrink-0 rounded-full bg-surface-card hover:bg-surface-raised active:scale-95 flex items-center justify-center text-text-secondary hover:text-text-primary transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            data-testid="account-mobile-menu-button"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
        }
      />

      {/* Menu Modal / Drawer ao clicar na 3ª coluna */}
      {isMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navegação da conta"
          className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
          data-testid="account-mobile-menu-dialog"
        >
          {/* Backdrop clicável para fechar */}
          <div
            className="fixed inset-0"
            aria-hidden="true"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Painel do menu */}
          <div className="relative z-10 w-full sm:max-w-md mx-auto rounded-t-2xl sm:rounded-md border border-border-default bg-[#1c120e] shadow-modal overflow-hidden max-h-[85vh] flex flex-col">
            {/* Cabeçalho do modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-default/70 bg-[#211510]/60">
              <h2 className="text-[17px] font-bold text-text-primary">
                Navegação da conta
              </h2>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Fechar menu"
                className="w-[32px] h-[32px] rounded-full bg-[#271711] flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-[#341f17] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Lista de menus */}
            <nav className="overflow-y-auto py-2">
              <ul className="space-y-1">
                {primaryItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenu === item.id;

                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectMenu(item.id);
                          setIsMenuOpen(false);
                        }}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'group relative flex w-full items-center gap-3.5 px-6 py-3 text-left text-[15px] font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
                          isActive
                            ? 'text-text-accent bg-[#271912] font-semibold'
                            : 'text-text-secondary hover:text-text-primary hover:bg-[#241612]/70'
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            'absolute left-0 top-0 bottom-0 w-[4px] bg-primary transition-opacity',
                            isActive ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <Icon
                          className={cn(
                            'h-5 w-5 shrink-0 transition-colors',
                            isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-primary'
                          )}
                          aria-hidden="true"
                        />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Divisor antes de Sair */}
              {actionItems.length > 0 && (
                <div className="my-2 border-t border-border-default/70 pt-2">
                  <ul className="space-y-1">
                    {actionItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeMenu === item.id;

                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectMenu(item.id);
                              setIsMenuOpen(false);
                            }}
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                              'group relative flex w-full items-center gap-3.5 px-6 py-3 text-left text-[15px] font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-inset',
                              isActive
                                ? 'text-coral bg-[#271912] font-semibold'
                                : 'text-text-secondary hover:text-coral hover:bg-[#241612]/70'
                            )}
                          >
                            <span
                              aria-hidden="true"
                              className={cn(
                                'absolute left-0 top-0 bottom-0 w-[4px] bg-coral transition-opacity',
                                isActive ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <Icon
                              className="h-5 w-5 shrink-0 text-text-muted transition-colors group-hover:text-coral"
                              aria-hidden="true"
                            />
                            <span className="truncate">{item.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

AccountMobileHeader.displayName = 'AccountMobileHeader';
