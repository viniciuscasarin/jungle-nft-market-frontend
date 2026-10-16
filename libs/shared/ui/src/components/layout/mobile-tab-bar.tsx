import * as React from 'react';
import { cn } from '../../index';
import { IconHome } from '../../icons/IconHome';
import { IconHeart } from '../../icons/IconHeart';
import { IconCart } from '../../icons/IconCart';
import { IconUser } from '../../icons/IconUser';

export interface TabBarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string | undefined;
  badge?: number | undefined;
  isCenter?: boolean | undefined;
  onClick?: (() => void) | undefined;
}

export interface MobileTabBarProps {
  activeId?: string | undefined;
  cartCount?: number | undefined;
  items?: TabBarItem[] | undefined;
  onTabSelect?: ((id: string) => void) | undefined;
  className?: string | undefined;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeId = 'home',
  cartCount = 0,
  items,
  onTabSelect,
  className,
}) => {
  const defaultItems: TabBarItem[] = [
    {
      id: 'home',
      label: 'Início',
      icon: <IconHome className="h-6 w-6" aria-hidden="true" />,
      href: '/',
    },
    {
      id: 'favorites',
      label: 'Favoritos',
      icon: <IconHeart className="h-6 w-6" aria-hidden="true" />,
      href: '/favoritos',
    },
    {
      id: 'discover',
      label: 'Descobrir',
      isCenter: true,
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-ink"
          aria-hidden="true"
        >
          <path
            d="M6 9C6 7.34315 7.34315 6 9 6H15C16.6569 6 18 7.34315 18 9V15C18 16.6569 16.6569 18 15 18H9C7.34315 18 6 16.6569 6 15V9Z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <line
            x1="4"
            y1="12"
            x2="20"
            y2="12"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      ),
      href: '/catalogo',
    },
    {
      id: 'cart',
      label: 'Carrinho',
      icon: <IconCart className="h-6 w-6" aria-hidden="true" />,
      href: '/carrinho',
      badge: cartCount,
    },
    {
      id: 'account',
      label: 'Conta',
      icon: <IconUser className="h-6 w-6" aria-hidden="true" />,
      href: '/perfil',
    },
  ];

  const navItems = items ?? defaultItems;

  return (
    <nav
      aria-label="Navegação móvel"
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 flex h-18 items-center justify-around rounded-t-[28px] border-t border-border-default/60 bg-surface-default/95 backdrop-blur-lg px-3 pb-[env(safe-area-inset-bottom)] md:hidden font-mono shadow-[0_-8px_24px_rgba(0,0,0,0.45)]',
        className
      )}
    >
      {navItems.map((item) => {
        const isActive = activeId === item.id || (activeId === 'catalog' && item.id === 'home');

        if (item.isCenter) {
          const centerButton = (
            <div className="relative -top-5 flex flex-col items-center justify-center">
              <div
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-accent text-ink flex items-center justify-center shadow-[0_6px_20px_rgba(210,138,76,0.45)] border-4 border-surface-default active:scale-95 transition-all cursor-pointer"
                title={item.label}
              >
                {item.icon}
              </div>
              <span className="sr-only">{item.label}</span>
            </div>
          );

          if (item.href) {
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                  }
                  onTabSelect?.(item.id);
                }}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
              >
                {centerButton}
              </a>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                item.onClick?.();
                onTabSelect?.(item.id);
              }}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
            >
              {centerButton}
            </button>
          );
        }

        const content = (
          <div className="relative flex flex-col items-center justify-center w-full py-1">
            <div className="relative">
              {item.icon}
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  aria-label={`${item.badge} itens`}
                  className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-tiny-9 font-bold text-text-primary"
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className="sr-only sm:not-sr-only text-[10px] font-medium tracking-tight mt-0.5">
              {item.label}
            </span>
          </div>
        );

        const commonClasses = cn(
          'flex-1 flex items-center justify-center py-2 transition-all rounded-lg',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
          isActive
            ? 'text-text-accent scale-105'
            : 'text-text-secondary hover:text-text-primary active:scale-95'
        );

        if (item.href) {
          return (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => {
                if (item.onClick) {
                  e.preventDefault();
                  item.onClick();
                }
                onTabSelect?.(item.id);
              }}
              aria-current={isActive ? 'page' : undefined}
              className={commonClasses}
            >
              {content}
            </a>
          );
        }

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              item.onClick?.();
              onTabSelect?.(item.id);
            }}
            aria-current={isActive ? 'page' : undefined}
            className={commonClasses}
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
};

MobileTabBar.displayName = 'MobileTabBar';
