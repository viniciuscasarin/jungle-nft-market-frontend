import {
  User,
  MapPin,
  Heart,
  TrendingUp,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { cn, IconCart, IconLogout } from '@nft/shared-ui';

export type AccountMenuId =
  | 'profile'
  | 'wallets'
  | 'activity'
  | 'wishlist'
  | 'offers'
  | 'downloads'
  | 'support'
  | 'logout';

export interface AccountMenuItem {
  id: AccountMenuId;
  label: string;
  icon: React.ComponentType<{
    className?: string;
    size?: number | string;
    width?: number | string;
    height?: number | string;
    'aria-hidden'?: boolean | 'true' | 'false';
  }>;
  isAction?: boolean;
}

export const ACCOUNT_MENU_ITEMS: AccountMenuItem[] = [
  { id: 'profile', label: 'Dados do perfil', icon: User },
  { id: 'wallets', label: 'Carteiras', icon: MapPin },
  { id: 'activity', label: 'Atividade', icon: IconCart },
  { id: 'wishlist', label: 'Lista de interesse', icon: Heart },
  { id: 'offers', label: 'Ofertas', icon: TrendingUp },
  { id: 'downloads', label: 'Arquivos baixados', icon: Download },
  { id: 'support', label: 'Suporte', icon: AlertTriangle },
  { id: 'logout', label: 'Sair', icon: IconLogout, isAction: true },
];

export interface AccountNavigationProps {
  activeMenu?: AccountMenuId;
  onSelectMenu?: (menuId: AccountMenuId) => void;
  className?: string;
}

export const AccountNavigation: React.FC<AccountNavigationProps> = ({
  activeMenu = 'profile',
  onSelectMenu,
  className,
}) => {
  const primaryItems = ACCOUNT_MENU_ITEMS.filter((item) => !item.isAction);
  const actionItems = ACCOUNT_MENU_ITEMS.filter((item) => item.isAction);

  return (
    <aside
      aria-label="Menu da Conta"
      className={cn(
        'w-full md:w-[310px] md:min-w-[310px] md:max-w-[310px] shrink-0 font-mono',
        className
      )}
    >
      <div className="overflow-hidden shadow-card bg-surface-card">
        {/* Título da barra lateral */}
        <div className="px-6 mt-2 h-[36px] bg-[#211510]/50">
          <h2 className="text-[18px] font-bold text-text-primary tracking-wide">
            Meu perfil
          </h2>
        </div>

        {/* Lista de navegação principal */}
        <nav aria-label="Navegação da conta">
          <ul className="space-y-1">
            {primaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelectMenu?.(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'group relative flex w-full items-center gap-3.5 px-6 py-2.5 text-left text-[15px] font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset text-text-accent',
                      isActive
                        ? 'text-text-accent bg-[#271912]'
                        : 'text-text-secondary hover:text-text-primary hover:bg-[#241612]/70'
                    )}
                  >
                    {/* Indicador lateral ativo */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute left-0 top-0 bottom-0 w-[4px] bg-primary transition-opacity',
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'
                      )}
                    />

                    <Icon
                      className={cn(
                        'h-5 w-5 shrink-0 transition-colors',
                        isActive
                          ? 'text-primary'
                          : 'text-text-muted group-hover:text-text-primary'
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
            <div className="my-2 border-t border-border-default/70">
              <ul className="space-y-1">
                {actionItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenu === item.id;

                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onSelectMenu?.(item.id)}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'group relative flex w-full items-center gap-3.5 px-6 py-2.5 text-left text-[15px] font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-inset',
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
    </aside>
  );
};

AccountNavigation.displayName = 'AccountNavigation';
