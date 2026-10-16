import React, { useMemo } from 'react';
import {
  Outlet,
  useLocation,
  useNavigate,
  ROUTES,
  ANCHORS,
} from '@nft/shared-router';
import {
  Header,
  MobileTabBar,
  Breadcrumb,
  Footer,
  type BreadcrumbItem,
  type HeaderNavLink,
  type HeaderUser,
} from '@nft/shared-ui';
import {
  usePageChrome,
  useUnavailable,
  toShellUserSession,
  useShell,
} from '@nft/shell-kit';
import { useOptionalAuth } from '@nft/auth-feature';
import { getOrCreateGuestId } from '@nft/auth-data-access';
import { cartItemCountQueryOptions } from '@nft/cart-data-access';
import { useQuery } from '@nft/shared-query';

export interface AppLayoutProps {
  cartCount?: number;
}

export function AppLayout({ cartCount: suppliedCartCount }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const authContext = useOptionalAuth();
  const { httpClient } = useShell();
  const cartCountQuery = useQuery(cartItemCountQueryOptions(httpClient, authContext?.session?.user.id, getOrCreateGuestId()));
  const cartCount = suppliedCartCount ?? cartCountQuery.data ?? 0;
  const { notifyUnavailable } = useUnavailable();
  const { breadcrumbLabel } = usePageChrome();

  const pathname = location.pathname;

  const isSessionResolving = authContext?.status === 'loading';
  const session = authContext?.session
    ? toShellUserSession(authContext.session)
    : null;

  const headerUser: HeaderUser | null = useMemo(() => {
    if (!session) return null;
    return {
      name: session.name,
      avatarUrl: session.avatarUrl ?? undefined,
    };
  }, [session]);

  const navLinks: HeaderNavLink[] = useMemo(
    () => [
      { label: 'Início', href: ROUTES.HOME },
      { label: 'Mercado', href: ANCHORS.CATALOG },
      { label: 'Criadores', href: '#criadores', ariaDisabled: true },
      { label: 'Aprenda', href: '#aprenda', ariaDisabled: true },
    ],
    []
  );

  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    if (pathname === '/' || pathname === '') {
      return [];
    }

    const items: BreadcrumbItem[] = [{ label: 'Início', href: ROUTES.HOME }];

    if (pathname.startsWith('/nft/')) {
      items.push({ label: 'Catálogo', href: ANCHORS.CATALOG });
      items.push({
        label: breadcrumbLabel || 'Detalhes do NFT',
      });
    } else if (pathname === ROUTES.CART) {
      items.push({ label: 'Carrinho' });
    } else if (pathname === ROUTES.PAYMENT) {
      items.push({ label: 'Carrinho', href: ROUTES.CART });
      items.push({ label: 'Pagamento' });
    } else if (pathname === ROUTES.PROFILE) {
      items.push({ label: 'Perfil' });
    } else if (pathname === ROUTES.WALLETS) {
      items.push({ label: 'Carteiras' });
    } else {
      items.push({ label: breadcrumbLabel || 'Página Não Encontrada' });
    }

    // Dynamic label override for the last item if breadcrumbLabel is provided
    if (breadcrumbLabel && items.length > 0) {
      const lastIndex = items.length - 1;
      items[lastIndex] = {
        ...items[lastIndex]!,
        label: breadcrumbLabel,
      };
    }

    return items;
  }, [pathname, breadcrumbLabel]);

  const handleLoginClick = () => {
    const searchStr = location.searchStr || '';
    const redirectUrl = `${location.pathname}${searchStr}`;
    void navigate({
      to: ROUTES.LOGIN,
      search: redirectUrl && redirectUrl !== '/' ? { redirect: redirectUrl } : undefined,
    } as never);
  };

  const handleLogoutClick = async () => {
    if (authContext) {
      await authContext.logout();
    }
    void navigate({ to: ROUTES.LOGIN } as never);
  };

  const handleCartClick = () => {
    void navigate({ to: ROUTES.CART } as never);
  };

  const handleSearchClick = () => {
    if (pathname === ROUTES.HOME || pathname === '') {
      void navigate({ to: '/', hash: 'catalogo', replace: true } as never);
      const el = document.getElementById('catalogo') || document.getElementById('busca');
      if (el) {
        const prefersReducedMotion =
          typeof window !== 'undefined' &&
          typeof window.matchMedia === 'function' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    } else {
      void navigate({ to: '/', hash: 'catalogo' } as never);
    }
  };

  const handleProfileClick = () => {
    void navigate({ to: ROUTES.PROFILE } as never);
  };

  const handleWalletsClick = () => {
    void navigate({ to: ROUTES.WALLETS } as never);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background font-mono text-text-primary antialiased overflow-x-hidden w-full max-w-full">
      {/* 1. Skip Link acessível como primeiro elemento focável */}
      <a
        href={ANCHORS.MAIN_CONTENT}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-ink focus:font-bold focus:shadow-lg focus:rounded-xs focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-ink"
      >
        Pular para o conteúdo
      </a>

      {/* 2. Chrome Desktop (>= 1024px): Header (oculto no mobile) */}
      <Header
        className="hidden lg:block w-full border-b border-border-default bg-surface-default"
        user={headerUser}
        isLoadingUser={isSessionResolving}
        cartCount={cartCount}
        activePath={pathname}
        navLinks={navLinks}
        searchHref={ANCHORS.CATALOG}
        cartHref={ROUTES.CART}
        profileHref={ROUTES.PROFILE}
        walletsHref={ROUTES.WALLETS}
        onLoginClick={handleLoginClick}
        onLogoutClick={handleLogoutClick}
        onCartClick={handleCartClick}
        onSearchClick={handleSearchClick}
        onProfileClick={handleProfileClick}
        onWalletsClick={handleWalletsClick}
        onUnavailable={notifyUnavailable}
      />

      {/* 4. Breadcrumb container */}
      {breadcrumbItems.length > 0 && (
        <div className="page-container py-3">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      )}

      {/* 5. Conteúdo Principal */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 focus:outline-none"
      >
        <Outlet />
      </main>

      {/* 6. Footer completo */}
      <Footer
        onUnavailable={notifyUnavailable}
        className="border-t border-border-default"
      />

      {/* 7. Chrome Mobile (< 1024px): Bottom TabBar fixa */}
      <MobileTabBar
        activePath={pathname}
        cartCount={cartCount}
        onTabSelect={(tabId) => {
          if (tabId === 'search') {
            handleSearchClick();
          } else if (tabId === 'catalog') {
            void navigate({ to: ROUTES.HOME } as never);
          } else if (tabId === 'cart') {
            void navigate({ to: ROUTES.CART } as never);
          } else if (tabId === 'account') {
            void navigate({ to: ROUTES.PROFILE } as never);
          }
        }}
        className="lg:hidden"
      />
    </div>
  );
}
