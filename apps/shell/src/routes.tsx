import React, { useEffect } from 'react';
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
  Link,
  Outlet,
  ScrollRestoration,
  useRouterState,
  type ErrorComponentProps,
} from '@tanstack/react-router';
import { z } from 'zod';
import {
  CatalogSearchParamsSchema,
  CartSearchParamsSchema,
  CheckoutSearchParamsSchema,
  type CatalogSearchParams,
  type CartSearchParams,
  type CheckoutSearchParams,
} from '@nft/shared-contracts';
import {
  singletonProbe,
  DefaultRemoteSkeleton,
  RemoteBoundary,
  withRemoteTimeout,
  useShell,
  type ShellUserSession,
} from '@nft/shell-kit';
import { ROUTES } from '@nft/shared-router';
import { ErrorState } from '@nft/shared-ui';
import { LoginPage, SignUpPage } from '@nft/auth-feature';
import { AppLayout, ModalLayout } from './layouts';

export interface RouterContext {
  session?: ShellUserSession | null;
}

export const LoginSearchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
  reason: z.string().optional().catch(undefined),
});

export function sanitizeRedirect(url: string | undefined): string {
  if (!url) return ROUTES.HOME;
  // Discard external or invalid targets (open redirect prevention)
  if (!url.startsWith('/') || url.startsWith('//') || url.includes('\\')) {
    return ROUTES.HOME;
  }
  return url;
}

export function requireAuth({
  context,
  location,
}: {
  context: RouterContext;
  location: { href: string };
}) {
  if (!context?.session) {
    throw redirect({
      to: ROUTES.LOGIN,
      search: {
        redirect: location.href,
      },
    });
  }
}

export function requireGuest({
  context,
  search,
}: {
  context: RouterContext;
  search: { redirect?: string | undefined; reason?: string | undefined };
}) {
  if (context?.session) {
    const target = sanitizeRedirect(search?.redirect);
    throw redirect({
      href: target,
    });
  }
}

export function NotFoundComponent() {
  React.useEffect(() => {
    document.title = 'Página Não Encontrada | Jungle NFT';
    let metaRobots = document.querySelector('meta[name="robots"]');
    const created = !metaRobots;
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    const originalContent = metaRobots.getAttribute('content');
    metaRobots.setAttribute('content', 'noindex');

    return () => {
      if (created && metaRobots && metaRobots.parentNode) {
        metaRobots.parentNode.removeChild(metaRobots);
      } else if (metaRobots && originalContent !== null) {
        metaRobots.setAttribute('content', originalContent);
      } else if (metaRobots) {
        metaRobots.removeAttribute('content');
      }
    };
  }, []);

  return (
    <div
      role="region"
      aria-label="Página não encontrada"
      className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center font-mono"
    >
      <div
        role="alert"
        aria-live="polite"
        className="max-w-md w-full rounded-lg border border-border-default bg-surface-card p-8 shadow-xl"
      >
        <span className="inline-block text-5xl" aria-hidden="true">🧭</span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-primary">404</h1>
        <h2 className="mt-2 text-2xl font-bold text-text-primary">Página Não Encontrada</h2>
        <p className="mt-4 text-sm leading-relaxed text-text-secondary">
          A página solicitada não existe ou foi removida nesta demonstração. Verifique a URL informada
          ou retorne à página inicial.
        </p>
        <div className="mt-6">
          <Link
            to={ROUTES.HOME}
            preload="intent"
            className="inline-flex items-center justify-center rounded-sm bg-primary px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-ink"
          >
            Voltar para o Início
          </Link>
        </div>
      </div>
    </div>
  );
}

export function RootErrorBoundary({ error, reset }: ErrorComponentProps) {
  const { feedback } = useShell();

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Ocorreu um erro inesperado na aplicação.';

  React.useEffect(() => {
    feedback.announce(`Erro na aplicação: ${errorMessage}`, 'assertive');
  }, [feedback, errorMessage]);

  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    } else {
      reset();
    }
  };

  return (
    <div
      role="region"
      aria-label="Erro na aplicação"
      className="flex min-h-screen flex-col items-center justify-center p-6 bg-background font-mono text-text-primary"
    >
      <ErrorState
        title="Falha Crítica na Aplicação"
        message={errorMessage}
        retryLabel="Recarregar"
        onRetry={handleReload}
        className="max-w-md w-full shadow-2xl"
      />
    </div>
  );
}

export function RemoteErrorComponent({ error, reset }: ErrorComponentProps) {
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Não foi possível conectar ao serviço remoto.';

  return (
    <div
      role="region"
      aria-label="Falha ao carregar catálogo"
      className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center font-mono"
    >
      <RemoteBoundary
        title="Módulo Indisponível"
        message={errorMessage}
        onRetry={reset}
      >
        <div
          role="alert"
          aria-live="assertive"
          className="max-w-md rounded-lg border border-rose-900/50 bg-surface-card p-8 shadow-2xl backdrop-blur"
        >
          <span className="inline-block text-5xl">⚠️</span>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-rose-400">
            Módulo Indisponível
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            {errorMessage}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center rounded-sm bg-primary px-4 py-2 text-xs font-semibold text-ink transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-ink cursor-pointer"
            >
              Tentar Novamente
            </button>
            <Link
              to={ROUTES.HOME}
              preload="intent"
              className="inline-flex items-center justify-center rounded-sm border border-border-default bg-surface-raised px-4 py-2 text-xs font-semibold text-text-primary transition hover:bg-surface-raised/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-ink"
            >
              Voltar para o Início
            </Link>
          </div>
        </div>
      </RemoteBoundary>
    </div>
  );
}

type RemoteModule = Record<string, unknown> & {
  __mf_remote_pending?: Promise<unknown>;
  default?: React.ComponentType<Record<string, unknown>>;
};

export function createRemoteRouteComponent<T extends Record<string, unknown>>(
  importer: () => Promise<T>,
  exportName = 'default',
) {
  function RemoteRouteComponent(props: Record<string, unknown>) {
    const [retryKey, setRetryKey] = React.useState(0);
    const [comp, setComp] = React.useState<React.ComponentType<Record<string, unknown>> | null>(null);
    const [error, setError] = React.useState<Error | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      let isMounted = true;
      setLoading(true);
      setError(null);

      withRemoteTimeout(async () => {
        const mod = (await importer()) as RemoteModule;
        if (
          mod &&
          typeof mod === 'object' &&
          '__mf_remote_pending' in mod &&
          mod.__mf_remote_pending
        ) {
          await mod.__mf_remote_pending;
        }
        return mod;
      }, 10000)
        .then((mod) => {
          if (isMounted) {
            const resolvedComp = (mod[exportName] || mod.default || mod) as React.ComponentType<Record<string, unknown>>;
            setComp(() => resolvedComp);
            setLoading(false);
          }
        })
        .catch((err: unknown) => {
          if (isMounted) {
            setError(err instanceof Error ? err : new Error(String(err)));
            setLoading(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }, [retryKey]);

    if (error) {
      return (
        <RemoteErrorComponent
          error={error}
          reset={() => setRetryKey((k) => k + 1)}
        />
      );
    }

    if (loading || !comp) {
      return <DefaultRemoteSkeleton />;
    }

    return React.createElement(comp, props);
  }

  return RemoteRouteComponent;
}

export const LoginComponent = LoginPage;

export const ROUTE_TITLES: Record<string, string> = {
  [ROUTES.HOME]: 'Jungle NFT Marketplace - Início',
  [ROUTES.CART]: 'Carrinho de Compras | Jungle NFT',
  [ROUTES.PAYMENT]: 'Pagamento | Jungle NFT',
  [ROUTES.PROFILE]: 'Meu Perfil | Jungle NFT',
  [ROUTES.WALLETS]: 'Minhas Carteiras | Jungle NFT',
  [ROUTES.LOGIN]: 'Entrar | Jungle NFT',
  [ROUTES.REGISTER]: 'Criar Conta | Jungle NFT',
};

export function getRouteTitle(pathname: string): string {
  if (ROUTE_TITLES[pathname]) {
    return ROUTE_TITLES[pathname]!;
  }
  if (pathname.startsWith('/nft/')) {
    return 'Detalhes do NFT | Jungle NFT';
  }
  if (pathname.startsWith('/pedido/')) {
    return 'Confirmação de Pedido | Jungle NFT';
  }
  return 'Página Não Encontrada | Jungle NFT';
}

export function NavigationAnnouncer() {
  const routerState = useRouterState();
  const { feedback } = useShell();
  const isFirstLoad = React.useRef(true);
  const prevPathname = React.useRef(routerState.location.pathname);

  React.useEffect(() => {
    const currentPath = routerState.location.pathname;
    const title = getRouteTitle(currentPath);
    document.title = title;

    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      prevPathname.current = currentPath;
      return;
    }

    if (prevPathname.current !== currentPath) {
      prevPathname.current = currentPath;

      // Foco no main (tabIndex={-1})
      const mainElement = document.getElementById('main-content');
      if (mainElement) {
        mainElement.focus();
      }

      // Anúncio do novo título na live region polite global
      feedback.announce(title, 'polite');
    }
  }, [routerState.location.pathname, feedback]);

  return null;
}

export function RootComponent() {
  useEffect(() => {
    singletonProbe.increment('apps/shell');
  }, []);

  return (
    <>
      <NavigationAnnouncer />
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

export function HomeComponent() {
  return (
    <div className="page-container py-12 font-mono">
      <div className="rounded-2xl border border-border-default bg-surface-card p-8 shadow-xl sm:p-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          Host Shell v1.0
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-text-primary sm:text-5xl">
          Jungle NFT Marketplace
        </h1>
        <p className="mt-4 max-w-2xl text-base text-text-secondary sm:text-lg">
          Ambiente integrado para descoberta, compra e gestão de NFTs com arquitetura de Module
          Federation e simulação completa via MSW.
        </p>
      </div>
    </div>
  );
}

// 1. Rota Raiz
export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: RootErrorBoundary,
});

// 2. Layouts Estruturais sem path
export const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_app',
  component: AppLayout,
});

export const modalLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_modal',
  component: ModalLayout,
});

// 3. Rotas sob _app (Chrome completo)
export const indexRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: ROUTES.HOME,
  validateSearch: (search: Record<string, unknown>): Partial<CatalogSearchParams> =>
    CatalogSearchParamsSchema.parse(search),
  component: createRemoteRouteComponent(() => import('storefront/HomePage')),
  errorComponent: RemoteErrorComponent,
  pendingComponent: DefaultRemoteSkeleton,
});

export const pdpRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: ROUTES.NFT_DETAILS,
  component: createRemoteRouteComponent(() => import('storefront/PdpPage')),
  errorComponent: RemoteErrorComponent,
  pendingComponent: DefaultRemoteSkeleton,
});

const cartAliasRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/cart',
  beforeLoad: () => { throw redirect({ to: ROUTES.CART }); },
});

export const cartRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: ROUTES.CART,
  validateSearch: (search: Record<string, unknown>): Partial<CartSearchParams> =>
    CartSearchParamsSchema.parse(search),
  component: createRemoteRouteComponent(() => import('checkout/CartPage')),
  errorComponent: RemoteErrorComponent,
  pendingComponent: DefaultRemoteSkeleton,
});

export const paymentRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: ROUTES.PAYMENT,
  validateSearch: (search: Record<string, unknown>): Partial<CheckoutSearchParams> =>
    CheckoutSearchParamsSchema.parse(search),
  beforeLoad: requireAuth,
  component: createRemoteRouteComponent(() => import('checkout/PaymentPage')),
  errorComponent: RemoteErrorComponent,
  pendingComponent: DefaultRemoteSkeleton,
});

export const profileRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: ROUTES.PROFILE,
  beforeLoad: requireAuth,
  component: createRemoteRouteComponent(() => import('account/ProfilePage')),
  errorComponent: RemoteErrorComponent,
  pendingComponent: DefaultRemoteSkeleton,
});

export const walletsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: ROUTES.WALLETS,
  beforeLoad: requireAuth,
  component: createRemoteRouteComponent(() => import('account/WalletsPage')),
  errorComponent: RemoteErrorComponent,
  pendingComponent: DefaultRemoteSkeleton,
});

// 4. Rotas sob _modal (Sem chrome)
export const loginRoute = createRoute({
  getParentRoute: () => modalLayoutRoute,
  path: ROUTES.LOGIN,
  validateSearch: (search: Record<string, unknown>) => LoginSearchSchema.parse(search),
  beforeLoad: requireGuest,
  component: LoginComponent,
});

export const registerRoute = createRoute({
  getParentRoute: () => modalLayoutRoute,
  path: ROUTES.REGISTER,
  validateSearch: (search: Record<string, unknown>) => LoginSearchSchema.parse(search),
  beforeLoad: requireGuest,
  component: SignUpPage,
});

export const confirmationRoute = createRoute({
  getParentRoute: () => modalLayoutRoute,
  path: ROUTES.ORDER_CONFIRMATION,
  beforeLoad: requireAuth,
  component: createRemoteRouteComponent(() => import('checkout/ConfirmationPage')),
  errorComponent: RemoteErrorComponent,
  pendingComponent: DefaultRemoteSkeleton,
});

export const notFoundRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '$',
  component: NotFoundComponent,
});

// Backward-compatible route aliases
export const checkoutRoute = paymentRoute;
export const catalogRoute = indexRoute;

// 5. Árvore de rotas
export const routeTree = rootRoute.addChildren([
  appLayoutRoute.addChildren([
    indexRoute,
    pdpRoute,
    cartRoute,
      cartAliasRoute,
    paymentRoute,
    profileRoute,
    walletsRoute,
    notFoundRoute,
  ]),
  modalLayoutRoute.addChildren([
    loginRoute,
    registerRoute,
    confirmationRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFoundComponent,
  defaultPreload: 'intent',
  context: {
    session: null,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
