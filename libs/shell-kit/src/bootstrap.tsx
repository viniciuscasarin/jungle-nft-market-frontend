import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { createQueryClient, QueryClientProvider } from '@nft/shared-query';
import { createHttpClient } from '@nft/shared-http';
import { createRealtimeClient } from '@nft/shared-realtime';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  createMemoryHistory,
  createBrowserHistory,
  redirect,
  Outlet,
  Link,
  type RouterHistory,
  type AnyRoute,
} from '@nft/shared-router';
import {
  ShellProvider,
  type ShellContextValue,
  type ShellUserSession,
} from './context';
import { singletonRegistry } from './singleton-registry';
import { globalFeedback, GlobalLiveRegions, ShellToastProvider } from './feedback';
import { ShellPageChromeProvider } from './page-chrome';
import { ErrorState, Skeleton } from '@nft/shared-ui';

export interface StandalonePageDescriptor<TSearch = Record<string, unknown>> {
  path: string;
  component?: React.ComponentType;
  validateSearch?: ((search: Record<string, unknown>) => TSearch) | { parse: (val: unknown) => TSearch };
  redirect?: string | ((opts: { search: unknown }) => string);
  beforeLoad?: (opts: { search: unknown }) => void;
}

export type StandaloneHistoryType = 'browser' | 'memory';

export interface ResolveDestinationOptions {
  localPaths?: string[];
  shellOrigin?: string;
}

export type ResolvedStandaloneDestination =
  | { type: 'local'; path: string }
  | { type: 'external'; url: string }
  | { type: 'invalid'; path: string };

export function isSafeInternalPath(path: string): boolean {
  if (!path || typeof path !== 'string') return false;
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return false;
  if (path.includes('://') || path.startsWith('javascript:') || path.startsWith('data:')) return false;
  return true;
}

export function resolveStandaloneDestination(
  to: string,
  options: ResolveDestinationOptions = {},
): ResolvedStandaloneDestination {
  const { localPaths = ['/'], shellOrigin = 'http://localhost:4200' } = options;

  if (!isSafeInternalPath(to)) {
    return { type: 'invalid', path: '/' };
  }

  const pathname = to.split('?')[0]?.split('#')[0] ?? '/';

  const isLocal = localPaths.some((p) => {
    if (p === pathname) return true;
    if (p !== '/' && pathname.startsWith(`${p}/`)) return true;
    return false;
  });

  if (isLocal) {
    return { type: 'local', path: to };
  }

  const cleanOrigin = shellOrigin.replace(/\/+$/, '');
  return { type: 'external', url: `${cleanOrigin}${to}` };
}

export function resolveStandaloneHref(
  to: string,
  options: ResolveDestinationOptions = {},
): string {
  const resolved = resolveStandaloneDestination(to, options);
  if (resolved.type === 'external') return resolved.url;
  return resolved.path;
}

export interface StandaloneLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  localPaths?: string[];
  shellOrigin?: string;
}

export function StandaloneLink({
  to,
  localPaths,
  shellOrigin,
  children,
  ...rest
}: StandaloneLinkProps) {
  const resolved = resolveStandaloneDestination(to, { localPaths, shellOrigin });
  if (resolved.type === 'local') {
    return (
      <Link to={resolved.path} {...(rest as Record<string, unknown>)}>
        {children}
      </Link>
    );
  }
  return (
    <a href={resolved.type === 'external' ? resolved.url : '/'} {...rest}>
      {children}
    </a>
  );
}

export interface StandaloneBootstrapConfig {
  mountPoint?: HTMLElement | string | null;
  initialRoute?: string;
  historyType?: StandaloneHistoryType;
  history?: RouterHistory;
  pages?: StandalonePageDescriptor[];
  shellOrigin?: string;
  initMsw?: () => Promise<void>;
  initSession?: (client: ShellContextValue['httpClient']) => Promise<ShellUserSession | null>;
  session?: ShellUserSession | null;
  onNavigate?: (to: string) => void;
}

export interface StandaloneNotFoundProps {
  remoteEntryRoute?: string;
  initialRoute?: string;
  shellOrigin?: string;
}

export function StandaloneNotFound({
  remoteEntryRoute,
  initialRoute = '/',
  shellOrigin = 'http://localhost:4200',
}: StandaloneNotFoundProps) {
  const targetRoute: string = remoteEntryRoute ?? initialRoute;
  return (
    <div
      role="region"
      aria-label="Página não encontrada"
      className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center font-mono"
    >
      <div
        role="alert"
        aria-live="polite"
        className="max-w-md w-full rounded-lg border border-border-default bg-surface-card p-8 shadow-xl"
      >
        <span className="inline-block text-5xl" aria-hidden="true">
          🧭
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-text-primary">
          Página Não Encontrada
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          A página solicitada não está disponível neste ambiente de desenvolvimento isolado.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to={targetRoute}
            className="inline-flex items-center justify-center rounded-sm bg-primary px-4 py-2 text-xs font-semibold text-ink transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-ink"
          >
            Início do Remote
          </Link>
          <a
            href={shellOrigin}
            className="inline-flex items-center justify-center rounded-sm border border-border-default bg-surface-raised px-4 py-2 text-xs font-semibold text-text-primary transition hover:bg-surface-raised/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-ink"
          >
            Abrir Shell Integrado
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Bootstrap contract for standalone remote execution in development.
 * Provides shared clients, query, feedback and page chrome contexts, a minimal TanStack Router,
 * and an asynchronous extension point for MSW initialization.
 */
export async function bootstrapStandalone(
  entry?: React.ComponentType | StandalonePageDescriptor[] | StandaloneBootstrapConfig,
  configOrNone?: StandaloneBootstrapConfig,
): Promise<Root | null> {
  let Component: React.ComponentType | undefined;
  let inlinePages: StandalonePageDescriptor[] | undefined;
  let config: StandaloneBootstrapConfig = {};

  if (Array.isArray(entry)) {
    inlinePages = entry;
    config = configOrNone ?? {};
  } else if (typeof entry === 'function') {
    Component = entry;
    config = configOrNone ?? {};
  } else if (entry && typeof entry === 'object') {
    config = entry;
  } else if (configOrNone) {
    config = configOrNone;
  }

  const {
    mountPoint = '#root',
    initialRoute = '/',
    historyType,
    history,
    shellOrigin = 'http://localhost:4200',
    initMsw,
    initSession,
    session = {
      userId: 'mock-standalone-user',
      name: 'Standalone User',
      email: 'standalone@jungle.test',
    },
    onNavigate,
  } = config;

  let element: HTMLElement | null = null;
  if (typeof mountPoint === 'string') {
    if (typeof document !== 'undefined') {
      try {
        element = document.querySelector<HTMLElement>(mountPoint);
      } catch {
        element = document.getElementById(mountPoint.replace(/^#/, ''));
      }
    }
  } else if (mountPoint instanceof HTMLElement) {
    element = mountPoint;
  }

  if (!element) {
    return null;
  }

  const queryClient = singletonRegistry.get<ReturnType<typeof createQueryClient>>('queryClient')
    ?? singletonRegistry.assertSingleton('queryClient', createQueryClient());

  const httpClient = singletonRegistry.get<ReturnType<typeof createHttpClient>>('httpClient')
    ?? singletonRegistry.assertSingleton('httpClient', createHttpClient());

  const realtimeClient = singletonRegistry.get<ReturnType<typeof createRealtimeClient>>('realtimeClient')
    ?? singletonRegistry.assertSingleton(
        'realtimeClient',
        createRealtimeClient({ autoConnect: false }),
      );

  const pages: StandalonePageDescriptor[] =
    config.pages ??
    inlinePages ??
    (Component
      ? [
          { path: '/', component: Component },
          ...(initialRoute !== '/' ? [{ path: initialRoute, component: Component }] : []),
        ]
      : []);

  const metaEnv = (import.meta as unknown as { env?: { MODE?: string } }).env;
  const isTestEnv =
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') ||
    (typeof import.meta !== 'undefined' && metaEnv?.MODE === 'test');

  const resolvedHistoryType: StandaloneHistoryType =
    historyType ?? (isTestEnv ? 'memory' : 'browser');

  const routerHistory =
    history ??
    (resolvedHistoryType === 'browser'
      ? createBrowserHistory()
      : createMemoryHistory({
          initialEntries: [initialRoute],
        }));

  const rootRoute = createRootRoute({
    component: () => <Outlet />,
    notFoundComponent: () => (
      <StandaloneNotFound
        remoteEntryRoute="/"
        shellOrigin={shellOrigin}
      />
    ),
  });

  const childRoutes = pages.map((page) => {
    const validateSearchFn =
      typeof page.validateSearch === 'function'
        ? page.validateSearch
        : page.validateSearch && typeof page.validateSearch === 'object' && 'parse' in page.validateSearch
          ? (raw: Record<string, unknown>) =>
              (page.validateSearch as { parse: (val: unknown) => unknown }).parse(raw)
          : undefined;

    return createRoute({
      getParentRoute: () => rootRoute,
      path: page.path,
      validateSearch: validateSearchFn as never,
      beforeLoad: (opts) => {
        if (page.redirect) {
          const to =
            typeof page.redirect === 'function'
              ? page.redirect(opts as never)
              : page.redirect;
          throw redirect({ to });
        }
        page.beforeLoad?.(opts as never);
      },
      component: () => {
        if (!page.component) return null;
        const Comp = page.component;
        return <Comp />;
      },
    });
  });

  const notFoundRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '$',
    component: () => (
      <StandaloneNotFound
        remoteEntryRoute="/"
        shellOrigin={shellOrigin}
      />
    ),
  });

  const addChildrenFn = rootRoute.addChildren as unknown as (routes: unknown[]) => AnyRoute;
  const routeTree = addChildrenFn([
    ...childRoutes,
    notFoundRoute,
  ]);

  const router = createRouter({
    routeTree,
    history: routerHistory,
    defaultNotFoundComponent: () => (
      <StandaloneNotFound
        remoteEntryRoute="/"
        shellOrigin={shellOrigin}
      />
    ),
  });

  const localPaths = pages.map((p) => p.path);

  const shellValue: ShellContextValue = {
    queryClient,
    httpClient,
    realtimeClient,
    session,
    navigate: (to: string) => {
      const resolved = resolveStandaloneDestination(to, {
        localPaths,
        shellOrigin,
      });

      if (resolved.type === 'invalid') {
        onNavigate?.('/');
        return;
      }

      if (resolved.type === 'local') {
        onNavigate?.(resolved.path);
        if (resolved.path.includes('?') || resolved.path.includes('#')) {
          void router.navigate({ href: resolved.path } as never);
        } else {
          void router.navigate({ to: resolved.path } as never);
        }
      } else {
        onNavigate?.(resolved.url);
        if (typeof window !== 'undefined' && window.location) {
          try {
            if (typeof window.location.assign === 'function') {
              window.location.assign(resolved.url);
            } else {
              window.location.href = resolved.url;
            }
          } catch {
            // Ignored in test environments where JSDOM does not implement external navigation
          }
        }
      }
    },
    feedback: globalFeedback,
  };

  const root = createRoot(element);
  const render = (content: React.ReactNode) => root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ShellProvider value={shellValue}>
          <ShellToastProvider>
            <GlobalLiveRegions />
            <ShellPageChromeProvider>
              {content}
            </ShellPageChromeProvider>
          </ShellToastProvider>
        </ShellProvider>
      </QueryClientProvider>
    </React.StrictMode>,
  );

  let initializing = false;
  const initialize = async () => {
    if (initializing) return;
    initializing = true;
    render(
      <section aria-busy="true" aria-label="Inicializando ambiente">
        <p role="status">Preparando ambiente de desenvolvimento…</p>
        <Skeleton className="h-64 w-full" />
      </section>,
    );
    try {
      await initMsw?.();
      if (initSession) shellValue.session = await initSession(httpClient);
      render(<RouterProvider router={router} />);
    } catch {
      render(<ErrorState aria-label="Falha na inicialização" title="Não foi possível iniciar o ambiente" message="Verifique a conexão e tente novamente." onRetry={() => void initialize()} />);
    } finally {
      initializing = false;
    }
  };

  await initialize();

  return root;
}
