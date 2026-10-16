import React, { useEffect } from 'react';
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
  Link,
  Outlet,
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
  type ShellUserSession,
} from '@nft/shell-kit';

export interface RouterContext {
  session?: ShellUserSession | null;
}

export const LoginSearchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
});

export function NotFoundComponent() {
  return (
    <main
      role="region"
      aria-label="Página não encontrada"
      className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center"
    >
      <div
        role="alert"
        aria-live="polite"
        className="max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur"
      >
        <span className="inline-block text-5xl">🧭</span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-emerald-400">404</h1>
        <h2 className="mt-2 text-2xl font-bold text-slate-100">Página Não Encontrada</h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          A página solicitada não existe ou foi removida nesta demonstração. Verifique a URL informada
          ou retorne à página inicial.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            preload="intent"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Voltar para o Início
          </Link>
        </div>
      </div>
    </main>
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
    <main
      role="region"
      aria-label="Falha ao carregar catálogo"
      className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center"
    >
      <RemoteBoundary
        title="Módulo Indisponível"
        message={errorMessage}
        onRetry={reset}
      >
        <div
          role="alert"
          aria-live="assertive"
          className="max-w-md rounded-2xl border border-rose-900/50 bg-slate-900/90 p-8 shadow-2xl backdrop-blur"
        >
          <span className="inline-block text-5xl">⚠️</span>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-rose-400">
            Módulo Indisponível
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            {errorMessage}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Tentar Novamente
            </button>
            <Link
              to="/"
              preload="intent"
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Voltar para o Início
            </Link>
          </div>
        </div>
      </RemoteBoundary>
    </main>
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

export function requireAuth({
  context,
  location,
}: {
  context: RouterContext;
  location: { href: string };
}) {
  if (!context?.session) {
    throw redirect({
      to: '/login',
      search: {
        redirect: location.href,
      },
    });
  }
}

export function LoginComponent() {
  return (
    <main
      role="region"
      aria-label="Autenticação"
      className="container mx-auto px-4 py-12"
    >
      <div className="max-w-md mx-auto rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl backdrop-blur text-center">
        <h1 className="text-2xl font-bold text-slate-100">Entrar na Conta</h1>
        <p className="mt-2 text-sm text-slate-400">
          Acesse sua conta para concluir compras e gerenciar suas carteiras.
        </p>
      </div>
    </main>
  );
}

export function RootComponent() {
  useEffect(() => {
    singletonProbe.increment('apps/shell');
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            to="/"
            preload="intent"
            className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-emerald-400 transition hover:opacity-90"
          >
            <span>🌿</span>
            <span>Jungle NFT Market</span>
          </Link>
          <nav aria-label="Navegação Principal" className="flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link to="/" preload="intent" className="transition hover:text-emerald-400">
              Início
            </Link>
            <Link to="/catalogo" preload="intent" className="transition hover:text-emerald-400">
              Catálogo
            </Link>
            <Link to="/carrinho" preload="intent" className="transition hover:text-emerald-400">
              Carrinho
            </Link>
            <Link to="/perfil" preload="intent" className="transition hover:text-emerald-400">
              Perfil
            </Link>
            <Link to="/carteiras" preload="intent" className="transition hover:text-emerald-400">
              Carteiras
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex-1">
        <Outlet />
      </div>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Jungle NFT Market. Demonstração de Frontend.</p>
      </footer>
    </div>
  );
}

export function HomeComponent() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl backdrop-blur sm:p-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          Host Shell v1.0
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-100 sm:text-5xl">
          Jungle NFT Marketplace
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate-400 sm:text-lg">
          Ambiente integrado para descoberta, compra e gestão de NFTs com arquitetura de Module
          Federation e simulação completa via MSW.
        </p>
      </div>
    </main>
  );
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomeComponent,
});

export const catalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/catalogo',
  validateSearch: (search: Record<string, unknown>): Partial<CatalogSearchParams> =>
    CatalogSearchParamsSchema.parse(search),
  component: createRemoteRouteComponent(() => import('storefront/HomePage')),
  errorComponent: RemoteErrorComponent,
  pendingComponent: DefaultRemoteSkeleton,
});

export const pdpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nft/$nftId',
  component: createRemoteRouteComponent(() => import('storefront/PdpPage')),
  errorComponent: RemoteErrorComponent,
  pendingComponent: DefaultRemoteSkeleton,
});

export const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/carrinho',
  validateSearch: (search: Record<string, unknown>): Partial<CartSearchParams> =>
    CartSearchParamsSchema.parse(search),
  component: createRemoteRouteComponent(() => import('checkout/CartPage')),
  errorComponent: RemoteErrorComponent,
  pendingComponent: DefaultRemoteSkeleton,
});

export const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  validateSearch: (search: Record<string, unknown>): Partial<CheckoutSearchParams> =>
    CheckoutSearchParamsSchema.parse(search),
  beforeLoad: requireAuth,
  component: createRemoteRouteComponent(() => import('checkout/PaymentPage')),
  errorComponent: RemoteErrorComponent,
  pendingComponent: DefaultRemoteSkeleton,
});

export const confirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pedidos/$orderId/confirmacao',
  beforeLoad: requireAuth,
  component: createRemoteRouteComponent(() => import('checkout/ConfirmationPage')),
  errorComponent: RemoteErrorComponent,
  pendingComponent: DefaultRemoteSkeleton,
});

export const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/perfil',
  beforeLoad: requireAuth,
  component: createRemoteRouteComponent(() => import('account/ProfilePage')),
  errorComponent: RemoteErrorComponent,
  pendingComponent: DefaultRemoteSkeleton,
});

export const walletsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/carteiras',
  beforeLoad: requireAuth,
  component: createRemoteRouteComponent(() => import('account/WalletsPage')),
  errorComponent: RemoteErrorComponent,
  pendingComponent: DefaultRemoteSkeleton,
});

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: (search) => LoginSearchSchema.parse(search),
  component: LoginComponent,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  catalogRoute,
  pdpRoute,
  cartRoute,
  checkoutRoute,
  confirmationRoute,
  profileRoute,
  walletsRoute,
  loginRoute,
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
