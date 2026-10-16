import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import {
  RouterProvider,
  createRouter,
  createRoute,
  createRootRouteWithContext,
  createMemoryHistory,
} from '@tanstack/react-router';
import {
  singletonProbe,
  ShellProvider,
  ShellPageChromeProvider,
  globalFeedback,
  type ShellContextValue,
} from '@nft/shell-kit';
import { ROUTES } from '@nft/shared-router';
import {
  RootComponent,
  routeTree,
  NotFoundComponent,
  RemoteErrorComponent,
  type RouterContext,
} from './routes';

vi.mock('storefront/HomePage', () => ({
  default: () => {
    singletonProbe.increment('apps/storefront');
    return <div data-testid="remote-home-page">Storefront Remote Content</div>;
  },
}));

vi.mock('storefront/PdpPage', () => ({
  default: () => <div data-testid="remote-pdp-page">Pdp Remote Content</div>,
}));

vi.mock('checkout/CartPage', () => ({
  default: () => <div data-testid="remote-cart-page">Cart Remote Content</div>,
}));

vi.mock('checkout/PaymentPage', () => ({
  default: () => (
    <div data-testid="remote-payment-page">Payment Remote Content</div>
  ),
}));

vi.mock('checkout/ConfirmationPage', () => ({
  default: () => (
    <div data-testid="remote-confirmation-page">
      Confirmation Remote Content
    </div>
  ),
}));

vi.mock('account/ProfilePage', () => ({
  default: () => (
    <div data-testid="remote-profile-page">Profile Remote Content</div>
  ),
}));

vi.mock('account/WalletsPage', () => ({
  default: () => (
    <div data-testid="remote-wallets-page">Wallets Remote Content</div>
  ),
}));

type AppRouterInstance = Parameters<typeof RouterProvider>[0]['router'];

function renderWithShell(testRouter: AppRouterInstance) {
  const routerWithContext = testRouter as AppRouterInstance & {
    options: { context?: RouterContext };
  };

  const dummyShell = {
    queryClient: {} as ShellContextValue['queryClient'],
    httpClient: {} as ShellContextValue['httpClient'],
    realtimeClient: {} as ShellContextValue['realtimeClient'],
    session: routerWithContext.options.context?.session ?? null,
    navigate: (to: string) => void testRouter.navigate({ to }),
    feedback: globalFeedback,
  };

  return render(
    <ShellProvider value={dummyShell}>
      <ShellPageChromeProvider>
        <RouterProvider router={testRouter} />
      </ShellPageChromeProvider>
    </ShellProvider>
  );
}

describe('Shell routes and layouts', () => {
  beforeEach(() => {
    singletonProbe.reset();
    window.scrollTo = vi.fn();
  });

  it('renders storefront remote on root path (/) within _app layout and increments singletonProbe', async () => {
    const testRouter = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: [ROUTES.HOME] }),
      defaultNotFoundComponent: NotFoundComponent,
      context: { session: null },
    });
    await testRouter.load();

    await act(async () => {
      renderWithShell(testRouter);
    });

    expect(await screen.findByTestId('remote-home-page')).toBeDefined();
    expect(screen.getAllByRole('banner').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('contentinfo')).toBeDefined();
    expect(screen.getByRole('link', { name: /Pular para o conteúdo/i })).toBeDefined();

    expect(singletonProbe.getCount()).toBe(2);
    const callers = singletonProbe.getEvents().map((e) => e.caller);
    expect(callers).toContain('apps/shell');
    expect(callers).toContain('apps/storefront');
  });

  it('renders accessible 404 page within _app layout when navigating to non-existent route', async () => {
    const testRouter = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ['/non-existent-page-404'],
      }),
      defaultNotFoundComponent: NotFoundComponent,
      context: { session: null },
    });
    await testRouter.load();

    await act(async () => {
      renderWithShell(testRouter);
    });

    expect(
      screen.getByRole('heading', { level: 1, name: '404' }),
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 2, name: /Página Não Encontrada/i }),
    ).toBeDefined();
    expect(screen.getByRole('alert')).toBeDefined();
    expect(
      screen.getByRole('link', { name: /Voltar para o Início/i }),
    ).toBeDefined();
    // 404 is inside _app layout
    expect(screen.getAllByRole('banner').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('contentinfo')).toBeDefined();
  });

  it('returns 404 without redirect on legacy paths (/catalogo, /checkout, /pedidos/1/confirmacao)', async () => {
    const legacyPaths = ['/catalogo', '/checkout', '/pedidos/1/confirmacao'];

    for (const path of legacyPaths) {
      const testRouter = createRouter({
        routeTree,
        history: createMemoryHistory({ initialEntries: [path] }),
        defaultNotFoundComponent: NotFoundComponent,
        context: { session: null },
      });
      await testRouter.load();

      const { unmount } = renderWithShell(testRouter);
      expect(
        screen.getByRole('heading', { level: 1, name: '404' }),
      ).toBeDefined();
      unmount();
    }
  });

  it('renders PDP remote component on /nft/$nftId', async () => {
    const testRouter = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/nft/item-42'] }),
      defaultNotFoundComponent: NotFoundComponent,
      context: { session: null },
    });
    await testRouter.load();

    await act(async () => {
      renderWithShell(testRouter);
    });

    expect(await screen.findByTestId('remote-pdp-page')).toBeDefined();
    expect(screen.getAllByRole('banner').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Cart remote component on /carrinho for public visitor without auth redirect', async () => {
    const testRouter = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ['/carrinho?coupon=PROMO10'],
      }),
      defaultNotFoundComponent: NotFoundComponent,
      context: { session: null },
    });
    await testRouter.load();

    await act(async () => {
      renderWithShell(testRouter);
    });

    expect(await screen.findByTestId('remote-cart-page')).toBeDefined();
    expect(testRouter.state.location.pathname).toBe('/carrinho');
  });

  it('redirects unauthenticated users from protected route /pagamento to /login with redirect param', async () => {
    const testRouter = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/pagamento'] }),
      defaultNotFoundComponent: NotFoundComponent,
      context: { session: null },
    });
    await testRouter.load();

    await act(async () => {
      renderWithShell(testRouter);
    });

    expect(testRouter.state.location.pathname).toBe('/login');
    expect(testRouter.state.location.search).toEqual({
      redirect: '/pagamento',
    });
  });

  it('redirects unauthenticated users from /perfil to /login preserving redirect url', async () => {
    const testRouter = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/perfil'] }),
      defaultNotFoundComponent: NotFoundComponent,
      context: { session: null },
    });
    await testRouter.load();

    await act(async () => {
      renderWithShell(testRouter);
    });

    expect(testRouter.state.location.pathname).toBe('/login');
    expect(testRouter.state.location.search).toEqual({
      redirect: '/perfil',
    });
  });

  it('renders protected route /pagamento when user session is present in context', async () => {
    const testRouter = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/pagamento'] }),
      defaultNotFoundComponent: NotFoundComponent,
      context: {
        session: {
          userId: 'user-789',
          name: 'Authorized Collector',
          email: 'collector@jungle.test',
        },
      },
    });
    await testRouter.load();

    await act(async () => {
      renderWithShell(testRouter);
    });

    expect(await screen.findByTestId('remote-payment-page')).toBeDefined();
  });

  it('renders protected routes /pedido/$orderId, /perfil and /carteiras when authenticated', async () => {
    const authenticatedContext = {
      session: {
        userId: 'user-789',
        name: 'Authorized Collector',
        email: 'collector@jungle.test',
      },
    };

    const confirmationRouter = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ['/pedido/ord-123'],
      }),
      defaultNotFoundComponent: NotFoundComponent,
      context: authenticatedContext,
    });
    await confirmationRouter.load();

    const { unmount: unmountConf } = renderWithShell(confirmationRouter);
    expect(
      await screen.findByTestId('remote-confirmation-page'),
    ).toBeDefined();
    // /pedido/$orderId uses _modal layout (no header/footer)
    expect(screen.queryByRole('banner')).toBeNull();
    expect(screen.queryByRole('contentinfo')).toBeNull();
    unmountConf();

    const profileRouter = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/perfil'] }),
      defaultNotFoundComponent: NotFoundComponent,
      context: authenticatedContext,
    });
    await profileRouter.load();

    const { unmount: unmountProf } = renderWithShell(profileRouter);
    expect(await screen.findByTestId('remote-profile-page')).toBeDefined();
    unmountProf();

    const walletsRouter = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/carteiras'] }),
      defaultNotFoundComponent: NotFoundComponent,
      context: authenticatedContext,
    });
    await walletsRouter.load();

    renderWithShell(walletsRouter);
    expect(await screen.findByTestId('remote-wallets-page')).toBeDefined();
  });

  it('renders isolated LoginPage on /login in _modal layout without chrome', async () => {
    const testRouter = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/login'] }),
      defaultNotFoundComponent: NotFoundComponent,
      context: { session: null },
    });
    await testRouter.load();

    await act(async () => {
      renderWithShell(testRouter);
    });

    expect(
      screen.getByRole('heading', { level: 1, name: 'Entrar na Conta' }),
    ).toBeDefined();
    // Modal layout has NO banner (header) and NO contentinfo (footer)
    expect(screen.queryByRole('banner')).toBeNull();
    expect(screen.queryByRole('contentinfo')).toBeNull();
  });

  it('redirects authenticated user accessing /login to sanitized destination or root', async () => {
    const authenticatedContext = {
      session: {
        userId: 'user-789',
        name: 'Authorized Collector',
        email: 'collector@jungle.test',
      },
    };

    // Safe redirect
    const safeRouter = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/login?redirect=%2Fcarteiras'] }),
      defaultNotFoundComponent: NotFoundComponent,
      context: authenticatedContext,
    });
    await safeRouter.load();

    const { unmount } = renderWithShell(safeRouter);
    expect(safeRouter.state.location.pathname).toBe('/carteiras');
    unmount();

    // Unsafe external redirect (must fall back to /)
    const unsafeRouter = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/login?redirect=https%3A%2F%2Fevil.com'] }),
      defaultNotFoundComponent: NotFoundComponent,
      context: authenticatedContext,
    });
    await unsafeRouter.load();

    renderWithShell(unsafeRouter);
    expect(unsafeRouter.state.location.pathname).toBe('/');
  });

  it('renders SignUpPage on /cadastro route in _modal layout', async () => {
    const testRouter = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/cadastro'] }),
      defaultNotFoundComponent: NotFoundComponent,
      context: { session: null },
    });
    await testRouter.load();

    await act(async () => {
      renderWithShell(testRouter);
    });

    expect(
      screen.getByRole('heading', { level: 1, name: 'Criar Conta' }),
    ).toBeDefined();
    expect(screen.queryByRole('banner')).toBeNull();
    expect(screen.queryByRole('contentinfo')).toBeNull();
  });

  it('renders RemoteErrorComponent with accessible alert and retry', async () => {
    const isolatedRootRoute = createRootRouteWithContext<RouterContext>()({
      component: RootComponent,
      notFoundComponent: NotFoundComponent,
    });

    const errorRoute = createRoute({
      getParentRoute: () => isolatedRootRoute,
      path: '/test-remote-error',
      component: () => (
        <RemoteErrorComponent
          error={new Error('Failed to fetch remoteEntry.js')}
          reset={vi.fn()}
          info={{ componentStack: '' }}
        />
      ),
    });

    const testRouter = createRouter({
      routeTree: isolatedRootRoute.addChildren([errorRoute]),
      history: createMemoryHistory({ initialEntries: ['/test-remote-error'] }),
      defaultNotFoundComponent: NotFoundComponent,
      context: { session: null },
    });
    await testRouter.load();

    await act(async () => {
      renderWithShell(testRouter);
    });

    expect(
      screen.getByRole('region', { name: 'Falha ao carregar catálogo' }),
    ).toBeDefined();
    expect(screen.getByRole('alert')).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 1, name: /Módulo Indisponível/i }),
    ).toBeDefined();
    expect(
      screen.getByRole('button', { name: /Tentar Novamente/i }),
    ).toBeDefined();
    expect(
      screen.getByRole('link', { name: /Voltar para o Início/i }),
    ).toBeDefined();
  });
});
