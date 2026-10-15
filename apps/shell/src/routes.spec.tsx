import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { RouterProvider, createRouter, createRoute, createMemoryHistory } from '@tanstack/react-router';
import { singletonProbe } from '@nft/shell-kit';
import { rootRoute, routeTree, NotFoundComponent, HomeComponent, RemoteErrorComponent } from './routes';

vi.mock('storefront/HomePage', () => ({
  default: () => {
    singletonProbe.increment('apps/storefront');
    return <div data-testid="remote-home-page">Storefront Remote Content</div>;
  },
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
    });
    await testRouter.load();

    await act(async () => {
      render(<RouterProvider router={testRouter} />);
    });

    expect(screen.getByRole('heading', { level: 1, name: /Jungle NFT Marketplace/i })).toBeDefined();
    expect(screen.getByText(/Ambiente integrado para descoberta/i)).toBeDefined();
    expect(singletonProbe.getCount()).toBe(1);
    expect(singletonProbe.getEvents()[0]?.caller).toBe('apps/shell');
  });

  it('renders accessible 404 page when navigating to a non-existent route', async () => {
    const testRouter = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/non-existent-page-404'] }),
      defaultNotFoundComponent: NotFoundComponent,
    });
    await testRouter.load();

    await act(async () => {
      render(<RouterProvider router={testRouter} />);
    });

    expect(screen.getByRole('heading', { level: 1, name: '404' })).toBeDefined();
    expect(screen.getByRole('heading', { level: 2, name: /Página Não Encontrada/i })).toBeDefined();
    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByRole('link', { name: /Voltar para o Início/i })).toBeDefined();
  });

  it('renders lazy loaded remote component on /catalogo and verifies singletonProbe count reaches 2', async () => {
    const testRouter = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/catalogo'] }),
      defaultNotFoundComponent: NotFoundComponent,
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
    const errorRoute = createRoute({
      getParentRoute: () => rootRoute,
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
      routeTree: rootRoute.addChildren([errorRoute]),
      history: createMemoryHistory({ initialEntries: ['/test-remote-error'] }),
      defaultNotFoundComponent: NotFoundComponent,
    });
    await testRouter.load();

    await act(async () => {
      render(<RouterProvider router={testRouter} />);
    });

    expect(screen.getByRole('region', { name: 'Falha ao carregar catálogo' })).toBeDefined();
    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByRole('heading', { level: 1, name: /Módulo Indisponível/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Tentar Novamente/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Voltar para o Início/i })).toBeDefined();
  });

  it('renders isolated HomeComponent directly', () => {
    render(<HomeComponent />);
    expect(screen.getByRole('heading', { level: 1, name: /Jungle NFT Marketplace/i })).toBeDefined();
  });
});
