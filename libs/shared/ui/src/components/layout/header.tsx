import * as React from 'react';
import { cn } from '../../index';
import { IconSearch } from '../../icons/IconSearch';
import { IconCart } from '../../icons/IconCart';
import { IconLogout } from '../../icons/IconLogout';
import { Avatar } from '../primitives/avatar';

export interface HeaderNavLink {
  label: string;
  href: string;
  id?: string;
}

export interface HeaderUser {
  name: string;
  avatarUrl?: string | undefined;
  walletAddress?: string | undefined;
}

export interface HeaderProps {
  user?: HeaderUser | null;
  cartCount?: number;
  activePath?: string;
  navLinks?: HeaderNavLink[];
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onCartClick?: () => void;
  onSearchClick?: () => void;
  onSearchSubmit?: (query: string) => void;
  className?: string;
}

export const DEFAULT_HEADER_NAV_LINKS: HeaderNavLink[] = [
  { label: 'Início', href: '/' },
  { label: 'Mercado', href: '/mercado' },
  { label: 'Criadores', href: '/criadores' },
  { label: 'Aprenda', href: '/aprenda' },
];

export const Header: React.FC<HeaderProps> = ({
  user,
  cartCount = 0,
  activePath = '/',
  navLinks,
  onLoginClick,
  onLogoutClick,
  onCartClick,
  onSearchClick,
  onSearchSubmit,
  className,
}) => {
  const links = navLinks ?? DEFAULT_HEADER_NAV_LINKS;

  const handleSearchAction = () => {
    if (onSearchClick) {
      onSearchClick();
    } else if (onSearchSubmit) {
      onSearchSubmit('');
    }
  };

  return (
    <header
      className={cn(
        'hidden md:block w-full h-[45px] p-0 bg-transparent border-b border-border-default font-mono select-none transition-colors',
        className
      )}
    >
      <div className="w-full h-[45px] flex items-center justify-between">
        {/* Coluna 1: Título KURIO com width fixo de 100px, font size 10px, 24px de altura, alinhado ao topo */}
        <div className="w-[100px] shrink-0 h-[45px] flex items-start">
          <a
            href="/"
            aria-label="Kurio NFT Marketplace - Início"
            className="flex items-center h-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs"
          >
            <span className="font-mono font-bold text-[14px] leading-[24px] h-[24px] tracking-widest text-text-primary">
              KURIO
            </span>
          </a>
        </div>

        {/* Coluna 2: Links centralizados horizontalmente (justify-center), ocupando altura do header (45px) com gap de 40px */}
        <nav
          aria-label="Navegação principal"
          className="flex-1 flex justify-center items-center h-[45px] gap-[40px]"
        >
          {links.map((link) => {
            const isActive = activePath === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'h-[45px] flex items-start text-[16px] font-medium transition-colors border-b-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs',
                  isActive
                    ? 'text-text-accent font-bold border-primary'
                    : 'text-text-primary hover:text-text-accent border-transparent'
                )}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Coluna 3: Ações com gap de 28px */}
        <div className="flex items-start shrink-0 gap-[28px] h-[45px]">
          {/* Lupa 20px x 20px */}
          <button
            type="button"
            onClick={handleSearchAction}
            aria-label="Buscar NFTs"
            className="flex items-center justify-center p-0 pt-[7px] text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink cursor-pointer"
          >
            <IconSearch
              width={20}
              height={20}
              className="w-[20px] h-[20px]"
              aria-hidden="true"
            />
          </button>

          {/* Carrinho 24px x 24px */}
          <button
            type="button"
            onClick={onCartClick}
            aria-label={cartCount > 0 ? `Carrinho com ${cartCount} itens` : 'Carrinho de compras'}
            className="relative flex items-center justify-center p-0 pt-[5px] text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink cursor-pointer"
          >
            <IconCart
              width={24}
              height={24}
              className="w-[24px] h-[24px]"
              aria-hidden="true"
            />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-tiny-9 font-bold text-ink">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>

          {/* Botão Entrar / Logout: bg-primary, text-ink, icon logout 24px x 24px, text font-size 24px, border-radius 6px */}
          {user ? (
            <div className="flex items-center gap-3">
              <a
                href="/perfil"
                aria-label={`Perfil de ${user.name}`}
                className="flex items-center gap-2 rounded-md p-1 hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                <Avatar
                  src={user.avatarUrl}
                  fallback={user.name}
                  size="sm"
                  alt={`Foto de ${user.name}`}
                />
                <span className="text-body-14 font-medium text-text-primary max-w-xs truncate">
                  {user.name}
                </span>
              </a>
              {onLogoutClick && (
                <button
                  type="button"
                  onClick={onLogoutClick}
                  aria-label="Sair"
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-[6px] bg-primary text-ink hover:bg-primary-hover font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink cursor-pointer"
                >
                  <IconLogout
                    width={24}
                    height={24}
                    className="w-[24px] h-[24px]"
                    aria-hidden="true"
                  />
                  <span className="text-[16px] leading-none font-medium">Sair</span>
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onLoginClick}
              aria-label="Entrar"
              className="inline-flex items-center gap-2 px-3 py-1 rounded-[6px] bg-primary text-ink hover:bg-primary-hover font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink cursor-pointer"
            >
              <IconLogout
                width={24}
                height={24}
                className="w-[24px] h-[24px]"
                aria-hidden="true"
              />
              <span className="text-[16px] leading-none font-medium">Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

Header.displayName = 'Header';
