import * as React from 'react';
import { cn } from '../../index';
import { IconSearch } from '../../icons/IconSearch';
import { IconCart } from '../../icons/IconCart';
import { IconLogout } from '../../icons/IconLogout';
import { Avatar } from '../primitives/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../primitives/dropdown-menu';

export interface HeaderNavLink {
  label: string;
  href: string;
  id?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  ariaDisabled?: boolean;
}

export interface HeaderUser {
  name: string;
  avatarUrl?: string | undefined;
  walletAddress?: string | undefined;
}

export interface HeaderProps {
  user?: HeaderUser | null;
  isLoadingUser?: boolean;
  cartCount?: number | undefined;
  activePath?: string;
  navLinks?: HeaderNavLink[];
  searchHref?: string;
  cartHref?: string;
  profileHref?: string;
  walletsHref?: string;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onCartClick?: () => void;
  onSearchClick?: () => void;
  onProfileClick?: () => void;
  onWalletsClick?: () => void;
  onUnavailable?: (feature?: string) => void;
  className?: string;
}

export const DEFAULT_HEADER_NAV_LINKS: HeaderNavLink[] = [
  { label: 'Início', href: '/' },
  { label: 'Mercado', href: '/#catalogo' },
  { label: 'Criadores', href: '#criadores', ariaDisabled: true },
  { label: 'Aprenda', href: '#aprenda', ariaDisabled: true },
];

export const Header: React.FC<HeaderProps> = ({
  user,
  isLoadingUser = false,
  cartCount,
  activePath = '/',
  navLinks,
  searchHref = '/#catalogo',
  cartHref = '/carrinho',
  profileHref = '/perfil',
  walletsHref = '/carteiras',
  onLoginClick,
  onLogoutClick,
  onCartClick,
  onSearchClick,
  onProfileClick,
  onWalletsClick,
  onUnavailable,
  className,
}) => {
  const links = navLinks ?? DEFAULT_HEADER_NAV_LINKS;
  const showCartBadge = typeof cartCount === 'number' && cartCount > 0;

  return (
    <header
      className={cn(
        'hidden lg:block w-full h-[45px] mt-6 p-0 bg-transparent border-b border-border-default font-mono select-none transition-colors',
        className
      )}
    >
      <div className="page-container h-[45px] flex items-center justify-between">
        {/* Coluna 1: Título KURIO com width fixo de 100px, font size 14px, 24px de altura, alinhado ao topo */}
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
          className="flex-1 flex justify-center items-start h-[45px] gap-[40px]"
        >
          {links.map((link) => {
            const isActive = activePath === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                aria-disabled={link.ariaDisabled ? 'true' : undefined}
                onClick={(e) => {
                  if (link.onClick) {
                    link.onClick(e);
                  } else if (link.ariaDisabled) {
                    e.preventDefault();
                    onUnavailable?.(link.label);
                  }
                }}
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
          {/* Lupa 20px x 20px como link semântico para âncora de busca */}
          <a
            href={searchHref}
            onClick={(e) => {
              if (onSearchClick) {
                e.preventDefault();
                onSearchClick();
              }
            }}
            aria-label="Ir para busca de NFTs"
            className="flex items-center justify-center p-0 pt-[7px] text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink cursor-pointer"
          >
            <IconSearch
              width={20}
              height={20}
              className="w-[20px] h-[20px]"
              aria-hidden="true"
            />
          </a>

          {/* Carrinho 24px x 24px como link semântico com badge condicional */}
          <a
            href={cartHref}
            onClick={(e) => {
              if (onCartClick) {
                e.preventDefault();
                onCartClick();
              }
            }}
            aria-label={showCartBadge ? `Carrinho com ${cartCount} itens` : 'Carrinho de compras'}
            className="relative flex items-center justify-center p-0 pt-[5px] text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink cursor-pointer"
          >
            <IconCart
              width={24}
              height={24}
              className="w-[24px] h-[24px]"
              aria-hidden="true"
            />
            {showCartBadge && (
              <span data-testid="cart-badge" aria-label={`${cartCount} itens no carrinho`} className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-feedback-error/40 px-1 text-tiny-9 font-bold text-text-primary">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </a>

          {/* Menu do Usuário autenticado com DropdownMenu OU Skeleton OU Botão Entrar */}
          {isLoadingUser ? (
            <div
              aria-busy="true"
              aria-label="Carregando sessão"
              className="h-8 w-24 animate-pulse rounded-md bg-surface-raised mt-1"
            />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={`Menu de ${user.name}`}
                  className="flex items-center gap-2 rounded-md p-1 hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink cursor-pointer"
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
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a
                    href={profileHref}
                    onClick={onProfileClick}
                    className="flex w-full items-center"
                  >
                    Perfil
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href={walletsHref}
                    onClick={onWalletsClick}
                    className="flex w-full items-center"
                  >
                    Carteiras
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onUnavailable?.('Atividade')}
                  className="cursor-pointer"
                >
                  Atividade
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUnavailable?.('Watchlist')}
                  className="cursor-pointer"
                >
                  Watchlist
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUnavailable?.('Ofertas')}
                  className="cursor-pointer"
                >
                  Ofertas
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUnavailable?.('Downloads')}
                  className="cursor-pointer"
                >
                  Downloads
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUnavailable?.('Suporte')}
                  className="cursor-pointer"
                >
                  Suporte
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onLogoutClick}
                  className="text-text-accent focus:text-text-accent font-medium flex items-center"
                >
                  <IconLogout
                    width={16}
                    height={16}
                    className="w-4 h-4 mr-2"
                    aria-hidden="true"
                  />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
