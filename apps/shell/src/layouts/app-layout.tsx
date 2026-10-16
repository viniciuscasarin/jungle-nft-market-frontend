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
  SearchBar,
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
} from '@nft/shell-kit';
import { useOptionalAuth } from '@nft/auth-feature';

export interface AppLayoutProps {
  cartCount?: number;
}

export function AppLayout({ cartCount }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const authContext = useOptionalAuth();
  const { notifyUnavailable } = useUnavailable();
  const { breadcrumbLabel, filtersHandler } = usePageChrome();

  const pathname = location.pathname;
  const searchObj = location.search as Record<string, unknown> | undefined;
  const qParam = typeof searchObj?.['q'] === 'string' ? searchObj['q'] : '';

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
    void navigate({ to: ANCHORS.SEARCH } as never);
  };

  const handleProfileClick = () => {
    void navigate({ to: ROUTES.PROFILE } as never);
  };

  const handleWalletsClick = () => {
    void navigate({ to: ROUTES.WALLETS } as never);
  };

  const handleMobileSearchSubmit = (query: string) => {
    const trimmed = query.trim();
    if (trimmed) {
      void navigate({
        to: ROUTES.HOME,
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          q: trimmed,
          page: 1,
        }),
      } as never);
    } else {
      void navigate({
        to: ROUTES.HOME,
        search: (prev: Record<string, unknown>) => {
          const next = { ...prev };
          delete next['q'];
          return next;
        },
      } as never);
    }
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

      {/* 2. Chrome Desktop (>= 1024px): Header */}
      <Header
        className="hidden lg:block w-full border-b border-border-default px-6 bg-surface-default"
        user={headerUser}
        isLoadingUser={isSessionResolving}
        cartCount={cartCount}
        activePath={pathname}
        navLinks={navLinks}
        searchHref={ANCHORS.SEARCH}
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

      {/* 3. Chrome Mobile (< 1024px): Top SearchBar */}
      <header className="block lg:hidden w-full border-b border-border-default bg-surface-default p-4">
        <SearchBar
          defaultValue={qParam}
          onSubmit={handleMobileSearchSubmit}
          filterSlot={
            filtersHandler ? (
              <button
                type="button"
                onClick={filtersHandler}
                aria-label="Abrir filtros"
                className="flex items-center justify-center h-10 px-3 rounded-md bg-surface-raised border border-border-default text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink cursor-pointer text-body-14"
              >
                Filtros
              </button>
            ) : undefined
          }
        />
      </header>

      {/* 4. Breadcrumb container */}
      {breadcrumbItems.length > 0 && (
        <div className="container mx-auto px-4 lg:px-8 py-3">
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
        className="lg:hidden"
      />
    </div>
  );
}
