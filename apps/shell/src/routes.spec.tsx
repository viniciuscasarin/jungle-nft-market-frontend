import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { RouterProvider, createRouter, createMemoryHistory } from '@tanstack/react-router';
import { routeTree, NotFoundComponent, HomeComponent } from './routes';

describe('Shell routes and components', () => {
  it('renders HomeComponent inside router on root path', async () => {
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

  it('renders isolated HomeComponent directly', () => {
    render(<HomeComponent />);
    expect(screen.getByRole('heading', { level: 1, name: /Jungle NFT Marketplace/i })).toBeDefined();
  });
});
