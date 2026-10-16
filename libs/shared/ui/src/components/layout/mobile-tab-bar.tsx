import * as React from 'react';
import { cn } from '../../index';
import { IconGrid } from '../../icons/IconGrid';
import { IconSearch } from '../../icons/IconSearch';
import { IconCart } from '../../icons/IconCart';
import { IconUser } from '../../icons/IconUser';

export interface TabBarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: number | undefined;
  onClick?: () => void;
}

export interface MobileTabBarProps {
  activeId?: string;
  activePath?: string;
  cartCount?: number | undefined;
  items?: TabBarItem[];
  onTabSelect?: (id: string) => void;
  className?: string;
}

export const DEFAULT_MOBILE_TAB_BAR_ITEMS: TabBarItem[] = [
  {
    id: 'catalog',
    label: 'Catálogo',
    icon: <IconGrid className="h-5 w-5" aria-hidden="true" />,
    href: '/',
  },
  {
    id: 'search',
    label: 'Buscar',
    icon: <IconSearch className="h-5 w-5" aria-hidden="true" />,
    href: '/#catalogo',
  },
  {
    id: 'cart',
    label: 'Carrinho',
    icon: <IconCart className="h-5 w-5" aria-hidden="true" />,
    href: '/carrinho',
  },
  {
    id: 'account',
    label: 'Conta',
    icon: <IconUser className="h-5 w-5" aria-hidden="true" />,
    href: '/perfil',
  },
];

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeId,
  activePath,
  cartCount,
  items,
  onTabSelect,
  className,
}) => {
  const baseItems = items ?? DEFAULT_MOBILE_TAB_BAR_ITEMS;

  // Resolve activeId from activePath if activeId not explicitly provided
  const resolvedActiveId = React.useMemo(() => {
    if (activeId) return activeId;
    if (!activePath) return 'catalog';

    if (activePath === '/') return 'catalog';
    if (activePath === '/#busca' || activePath === '/#catalogo') return 'search';
    if (activePath === '/carrinho') return 'cart';
    if (activePath.startsWith('/perfil') || activePath.startsWith('/carteiras')) return 'account';

    const match = baseItems.find((item) => item.href === activePath);
    return match ? match.id : 'catalog';
  }, [activeId, activePath, baseItems]);

  const navItems = React.useMemo(() => {
    return baseItems.map((item) => {
      if (item.id === 'cart' && cartCount !== undefined) {
        return {
          ...item,
          badge: typeof cartCount === 'number' && cartCount > 0 ? cartCount : undefined,
        };
      }
      return item;
    });
  }, [baseItems, cartCount]);

  return (
    <nav
      aria-label="Navegação móvel"
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border-default bg-surface-card/95 backdrop-blur-md px-2 lg:hidden font-mono',
        className
      )}
    >
      {navItems.map((item) => {
        const isActive = resolvedActiveId === item.id;

        const content = (
          <div className="relative flex flex-col items-center justify-center gap-1 w-full py-1">
            <div className="relative">
              {item.icon}
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span
                  aria-label={`${item.badge} itens`}
                  className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-tiny-9 font-bold text-ink"
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-tiny-10 font-medium tracking-tight">{item.label}</span>
          </div>
        );

        const commonClasses = cn(
          'flex-1 flex items-center justify-center py-1 transition-colors rounded-xs',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
          isActive
            ? 'text-primary font-bold'
            : 'text-text-secondary hover:text-text-primary'
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
                if (onTabSelect) {
                  e.preventDefault();
                  onTabSelect(item.id);
                }
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
