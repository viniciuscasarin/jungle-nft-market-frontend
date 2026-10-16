import * as React from 'react';
import { cn } from '../../index';
import { IconUser } from '../../icons/IconUser';
import { IconHeart } from '../../icons/IconHeart';
import { IconCart } from '../../icons/IconCart';
import { IconLogout } from '../../icons/IconLogout';
import { IconCoinbase } from '../../icons/IconCoinbase';
import { Avatar } from '../primitives/avatar';

export interface AccountNavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

export interface AccountSidebarUser {
  name: string;
  email?: string;
  avatarUrl?: string;
  walletAddress?: string;
}

export interface AccountSidebarProps {
  user?: AccountSidebarUser;
  activePath?: string;
  navItems?: AccountNavItem[];
  onNavigate?: (href: string) => void;
  onLogout?: () => void;
  className?: string;
}

export const AccountSidebar: React.FC<AccountSidebarProps> = ({
  user,
  activePath = '/perfil',
  navItems,
  onNavigate,
  onLogout,
  className,
}) => {
  const defaultItems: AccountNavItem[] = [
    {
      id: 'profile',
      label: 'Meu Perfil',
      href: '/perfil',
      icon: <IconUser className="h-4 w-4" aria-hidden="true" />,
    },
    {
      id: 'wallets',
      label: 'Minhas Carteiras',
      href: '/carteiras',
      icon: <IconCoinbase className="h-4 w-4" aria-hidden="true" />,
    },
    {
      id: 'favorites',
      label: 'NFTs Favoritos',
      href: '/favoritos',
      icon: <IconHeart className="h-4 w-4" aria-hidden="true" />,
    },
    {
      id: 'orders',
      label: 'Histórico de Pedidos',
      href: '/pedidos',
      icon: <IconCart className="h-4 w-4" aria-hidden="true" />,
    },
  ];

  const items = navItems ?? defaultItems;

  return (
    <aside
      aria-label="Navegação da conta"
      className={cn(
        'flex flex-col w-full md:w-64 rounded-lg border border-border-default bg-surface-card p-5 font-mono shadow-card select-none',
        className
      )}
    >
      {/* User Header */}
      {user && (
        <div className="flex items-center gap-3 pb-5 border-b border-border-default">
          <Avatar
            src={user.avatarUrl}
            fallback={user.name}
            size="md"
            alt={`Foto de ${user.name}`}
          />
          <div className="flex flex-col min-w-0">
            <h4 className="font-bold text-body-14 text-text-primary truncate">{user.name}</h4>
            <span className="text-caption-12 text-text-secondary truncate mt-0.5">
              {user.email ?? user.walletAddress ?? 'Colecionador'}
            </span>
          </div>
        </div>
      )}

      {/* Nav List */}
      <nav aria-label="Menu da conta" className="flex flex-col gap-1 py-4 flex-1">
        {items.map((item) => {
          const isActive = activePath === item.href;

          return (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate(item.href);
                }
              }}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-body-14 font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
                isActive
                  ? 'bg-surface-raised text-primary font-bold border-l-2 border-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
              )}
            >
              <span className={cn('shrink-0', isActive ? 'text-primary' : 'text-text-muted')}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Logout Row */}
      {onLogout && (
        <div className="pt-4 border-t border-border-default">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-body-14 font-medium text-text-muted hover:text-feedback-error hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink cursor-pointer"
          >
            <IconLogout className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      )}
    </aside>
  );
};

AccountSidebar.displayName = 'AccountSidebar';
