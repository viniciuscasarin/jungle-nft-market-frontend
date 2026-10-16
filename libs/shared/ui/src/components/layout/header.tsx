import * as React from 'react';
import { cn } from '../../index';
import { IconKurioLogo } from '../../icons/IconKurioLogo';
import { IconCart } from '../../icons/IconCart';
import { IconMenu } from '../../icons/IconMenu';
import { Button } from '../primitives/button';
import { Avatar } from '../primitives/avatar';
import { SearchBar } from './search-bar';

export interface HeaderNavLink {
  label: string;
  href: string;
  id?: string;
}

export interface HeaderUser {
  name: string;
  avatarUrl?: string;
  walletAddress?: string;
}

export interface HeaderProps {
  user?: HeaderUser | null;
  cartCount?: number;
  activePath?: string;
  navLinks?: HeaderNavLink[];
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onCartClick?: () => void;
  onSearchSubmit?: (query: string) => void;
  onMobileMenuToggle?: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  cartCount = 0,
  activePath = '/',
  navLinks,
  onLoginClick,
  onLogoutClick,
  onCartClick,
  onSearchSubmit,
  onMobileMenuToggle,
  className,
}) => {
  const defaultNavLinks: HeaderNavLink[] = [
    { label: 'Explorar', href: '/' },
    { label: 'Coleções', href: '/colecoes' },
  ];

  const links = navLinks ?? defaultNavLinks;

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-border-default bg-surface-card/95 backdrop-blur-md font-mono select-none transition-colors',
        className
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-8 shrink-0">
          <a
            href="/"
            aria-label="Kurio NFT Marketplace - Início"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs"
          >
            <IconKurioLogo className="h-8 w-auto text-text-primary" />
          </a>

          {/* Desktop Nav Links */}
          <nav aria-label="Navegação principal" className="hidden lg:flex items-center gap-6">
            {links.map((link) => {
              const isActive = activePath === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'text-body-14 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs',
                    isActive
                      ? 'text-primary font-bold'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Center: Search Bar (Desktop & Tablet) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <SearchBar onSubmit={onSearchSubmit} />
        </div>

        {/* Right: Actions (Cart & Session) */}
        <div className="flex items-center gap-3">
          {/* Cart Button */}
          <button
            type="button"
            onClick={onCartClick}
            aria-label={cartCount > 0 ? `Carrinho com ${cartCount} itens` : 'Carrinho de compras'}
            className="relative flex h-10 w-10 items-center justify-center rounded-md border border-border-default bg-surface-raised text-text-secondary hover:text-text-primary hover:border-border-soft hover:bg-surface-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink cursor-pointer"
          >
            <IconCart className="h-5 w-5" aria-hidden="true" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-tiny-9 font-bold text-text-primary">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>

          {/* User Session */}
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
                <span className="hidden sm:inline text-body-14 font-medium text-text-primary max-w-xs truncate">
                  {user.name}
                </span>
              </a>
              {onLogoutClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogoutClick}
                  className="hidden sm:inline-flex text-caption-12"
                >
                  Sair
                </Button>
              )}
            </div>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={onLoginClick}
              className="text-body-14 font-bold"
            >
              Entrar
            </Button>
          )}

          {/* Mobile Menu Trigger (Hamburger) */}
          <button
            type="button"
            onClick={onMobileMenuToggle}
            aria-label="Abrir menu de navegação"
            className="flex lg:hidden h-10 w-10 items-center justify-center rounded-md border border-border-default bg-surface-raised text-text-secondary hover:text-text-primary hover:bg-surface-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink cursor-pointer"
          >
            <IconMenu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
};

Header.displayName = 'Header';
