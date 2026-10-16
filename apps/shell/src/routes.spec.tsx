import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import {
  RouterProvider,
  createRouter,
  createRoute,
  createRootRouteWithContext,
  createMemoryHistory,
} from '@tanstack/react-router';
import { singletonProbe } from '@nft/shell-kit';
import {
  RootComponent,
  routeTree,
  NotFoundComponent,
  HomeComponent,
  RemoteErrorComponent,
  router,
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

describe('Shell routes and components', () => {
  beforeEach(() => {
    singletonProbe.reset();
    window.scrollTo = vi.fn();
  });

  it('renders HomeComponent inside router on root path and increments singletonProbe for shell', async () => {
    const testRouter = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/'] }),
      defaultNotFoundComponent: NotFoundComponent,
      context: { session: null },
    });
    await testRouter.load();

    await act(async () => {
      render(<RouterProvider router={testRouter} />);
    });

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Jungle NFT Marketplace/i,
      }),
    ).toBeDefined();
    expect(
      screen.getByText(/Ambiente integrado para descoberta/i),
    ).toBeDefined();
    expect(singletonProbe.getCount()).toBe(1);
    expect(singletonProbe.getEvents()[0]?.caller).toBe('apps/shell');
  });

  it('renders accessible 404 page when navigating to a non-existent route', async () => {
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
      render(<RouterProvider router={testRouter} />);
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
  });

  it('renders lazy loaded remote component on /catalogo and verifies singletonProbe count reaches 2', async () => {
    const testRouter = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/catalogo'] }),
      defaultNotFoundComponent: NotFoundComponent,
      context: { session: null },
    });
    await testRouter.load();

    await act(async () => {
      render(<RouterProvider router={testRouter} />);
    });

    expect(await screen.findByTestId('remote-home-page')).toBeDefined();
    expect(singletonProbe.getCount()).toBe(2);
    const callers = singletonProbe.getEvents().map((e) => e.caller);
    expect(callers).toContain('apps/shell');
    expect(callers).toContain('apps/storefront');
  });

  it('renders RemoteErrorComponent with accessible alert and actions inside router', async () => {
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
      render(<RouterProvider router={testRouter} />);
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

  it('renders PDP remote component on /nft/$nftId', async () => {
    const testRouter = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/nft/42'] }),
      defaultNotFoundComponent: NotFoundComponent,
      context: { session: null },
    });
    await testRouter.load();

    await act(async () => {
      render(<RouterProvider router={testRouter} />);
    });

    expect(await screen.findByTestId('remote-pdp-page')).toBeDefined();
  });

  it('renders Cart remote component on /carrinho with valid search params', async () => {
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
      render(<RouterProvider router={testRouter} />);
    });

    expect(await screen.findByTestId('remote-cart-page')).toBeDefined();
  });

  it('redirects unauthenticated users from protected route /checkout to /login', async () => {
    const testRouter = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/checkout'] }),
      defaultNotFoundComponent: NotFoundComponent,
      context: { session: null },
    });
    await testRouter.load();

    await act(async () => {
      render(<RouterProvider router={testRouter} />);
    });

    expect(testRouter.state.location.pathname).toBe('/login');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Entrar na Conta' }),
    ).toBeDefined();
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
      render(<RouterProvider router={testRouter} />);
    });

    expect(testRouter.state.location.pathname).toBe('/login');
    expect(testRouter.state.location.search).toEqual({
      redirect: '/perfil',
    });
  });

  it('renders protected route /checkout when user session is present in context', async () => {
    const testRouter = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/checkout'] }),
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
      render(<RouterProvider router={testRouter} />);
    });

    expect(await screen.findByTestId('remote-payment-page')).toBeDefined();
  });

  it('renders protected routes /pedidos/$orderId/confirmacao, /perfil and /carteiras when authenticated', async () => {
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
        initialEntries: ['/pedidos/ord-123/confirmacao'],
      }),
      defaultNotFoundComponent: NotFoundComponent,
      context: authenticatedContext,
    });
    await confirmationRouter.load();

    const { unmount } = render(
      <RouterProvider router={confirmationRouter} />,
    );
    expect(
      await screen.findByTestId('remote-confirmation-page'),
    ).toBeDefined();
    unmount();

    const profileRouter = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/perfil'] }),
      defaultNotFoundComponent: NotFoundComponent,
      context: authenticatedContext,
    });
    await profileRouter.load();

    render(<RouterProvider router={profileRouter} />);
    expect(await screen.findByTestId('remote-profile-page')).toBeDefined();
  });

  it('configures predictive preloading on router and navigation links (Task 3.4)', () => {
    expect(router.options.defaultPreload).toBe('intent');

    render(<HomeComponent />);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Jungle NFT Marketplace/i,
      }),
    ).toBeDefined();
  });

  it('renders isolated LoginComponent directly on /login', async () => {
    const testRouter = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/login'] }),
      defaultNotFoundComponent: NotFoundComponent,
      context: { session: null },
    });
    await testRouter.load();

    await act(async () => {
      render(<RouterProvider router={testRouter} />);
    });

    expect(
      screen.getByRole('heading', { level: 1, name: 'Entrar na Conta' }),
    ).toBeDefined();
  });

  it('renders SignUpPage on /cadastro route', async () => {
    const testRouter = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/cadastro'] }),
      defaultNotFoundComponent: NotFoundComponent,
      context: { session: null },
    });
    await testRouter.load();

    await act(async () => {
      render(<RouterProvider router={testRouter} />);
    });

    expect(
      screen.getByRole('heading', { level: 1, name: 'Criar Conta' }),
    ).toBeDefined();
  });
});
