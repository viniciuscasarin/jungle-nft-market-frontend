import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act, type RenderResult } from '@testing-library/react';
import {
  createRouter,
  createRoute,
  createRootRouteWithContext,
  createMemoryHistory,
  RouterProvider,
} from '@tanstack/react-router';
import { AppLayout } from './app-layout';
import { ModalLayout } from './modal-layout';
import {
  ShellPageChromeProvider,
  ShellProvider,
  globalFeedback,
  usePageChrome,
  type ShellContextValue,
} from '@nft/shell-kit';
import { ANCHORS } from '@nft/shared-router';

interface TestRouterContext {
  dummy?: boolean;
}

function createTestRouter(initialPath: string, layoutComponent: React.ComponentType) {
  const rootRoute = createRootRouteWithContext<TestRouterContext>()({
    component: layoutComponent,
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <div data-testid="child-home">Home Child</div>,
  });

  const cartRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/carrinho',
    component: () => <div data-testid="child-cart">Cart Child</div>,
  });

  function PdpChildComponent() {
    usePageChrome({ breadcrumbLabel: 'Gato Cósmico' });
    return <div data-testid="child-pdp">PDP Child</div>;
  }

  const dynamicPdpRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/nft/$nftId',
    component: PdpChildComponent,
  });

  const routeTree = rootRoute.addChildren([indexRoute, cartRoute, dynamicPdpRoute]);

  const testRouter = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
    context: {},
  });

  return testRouter;
}

type AppTestRouter = ReturnType<typeof createTestRouter>;

function renderRouterWithProviders(router: AppTestRouter) {
  const dummyShell = {
    queryClient: {} as ShellContextValue['queryClient'],
    httpClient: {} as ShellContextValue['httpClient'],
    realtimeClient: {} as ShellContextValue['realtimeClient'],
    session: null,
    navigate: (to: string) => void router.navigate({ to }),
    feedback: globalFeedback,
  };

  return render(
    <ShellProvider value={dummyShell}>
      <ShellPageChromeProvider>
        <RouterProvider router={router} />
      </ShellPageChromeProvider>
    </ShellProvider>
  );
}

describe('AppLayout and ModalLayout', () => {
  beforeEach(() => {
    window.scrollTo = () => {};
  });

  describe('AppLayout', () => {
    it('renders skip link as the first focusable link targeting main content', async () => {
      const router = createTestRouter('/', AppLayout);
      await router.load();

      await act(async () => {
        renderRouterWithProviders(router);
      });

      const skipLink = screen.getByRole('link', { name: /Pular para o conteúdo/i });
      expect(skipLink).toBeDefined();
      expect(skipLink.getAttribute('href')).toBe(ANCHORS.MAIN_CONTENT);
    });

    it('renders all accessibility landmarks: header, nav, main, footer', async () => {
      const router = createTestRouter('/', AppLayout);
      await router.load();

      await act(async () => {
        renderRouterWithProviders(router);
      });

      const headers = screen.getAllByRole('banner');
      expect(headers.length).toBeGreaterThanOrEqual(1);

      const navs = screen.getAllByRole('navigation');
      expect(navs.length).toBeGreaterThanOrEqual(1);

      const main = screen.getByRole('main');
      expect(main).toBeDefined();
      expect(main.getAttribute('id')).toBe('main-content');
      expect(main.getAttribute('tabIndex')).toBe('-1');

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeDefined();
    });

    it('renders outlet child content inside main landmark', async () => {
      const router = createTestRouter('/', AppLayout);
      await router.load();

      await act(async () => {
        renderRouterWithProviders(router);
      });

      const child = screen.getByTestId('child-home');
      const main = screen.getByRole('main');
      expect(main.contains(child)).toBe(true);
    });

    it('renders Breadcrumb when not on home route and updates dynamically via usePageChrome', async () => {
      const router = createTestRouter('/nft/item-123', AppLayout);
      await router.load();

      await act(async () => {
        renderRouterWithProviders(router);
      });

      const breadcrumbNav = screen.getByRole('navigation', { name: /Breadcrumb/i });
      expect(breadcrumbNav).toBeDefined();
      expect(screen.getByText('Gato Cósmico')).toBeDefined();
    });

    it('renders MobileTabBar with active tab', async () => {
      const router = createTestRouter('/carrinho', AppLayout);
      await router.load();

      await act(async () => {
        renderRouterWithProviders(router);
      });

      const mobileNav = screen.getByRole('navigation', { name: /Navegação móvel/i });
      expect(mobileNav).toBeDefined();
    });

    it('navigates and scrolls to catalog anchor when clicking search icon on Header', async () => {
      const router = createTestRouter('/', AppLayout);
      await router.load();

      const scrollIntoViewMock = vi.fn();
      const fakeCatalog = document.createElement('div');
      fakeCatalog.id = 'catalogo';
      fakeCatalog.scrollIntoView = scrollIntoViewMock;
      document.body.appendChild(fakeCatalog);

      await act(async () => {
        renderRouterWithProviders(router);
      });

      const searchLink = screen.getByRole('link', { name: /Ir para busca de NFTs/i });
      await act(async () => {
        searchLink.click();
      });

      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });

      document.body.removeChild(fakeCatalog);
    });

    it('navigates and scrolls to catalog anchor when clicking search tab on MobileTabBar', async () => {
      const router = createTestRouter('/', AppLayout);
      await router.load();

      const scrollIntoViewMock = vi.fn();
      const fakeCatalog = document.createElement('div');
      fakeCatalog.id = 'catalogo';
      fakeCatalog.scrollIntoView = scrollIntoViewMock;
      document.body.appendChild(fakeCatalog);

      await act(async () => {
        renderRouterWithProviders(router);
      });

      const searchTabLink = screen.getByRole('link', { name: /Buscar/i });
      await act(async () => {
        searchTabLink.click();
      });

      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });

      document.body.removeChild(fakeCatalog);
    });
  });

  describe('ModalLayout', () => {
    it('renders without Header, Footer, Breadcrumb, or BottomTabBar', async () => {
      const router = createTestRouter('/', ModalLayout);
      await router.load();

      await act(async () => {
        renderRouterWithProviders(router);
      });

      expect(screen.queryByRole('banner')).toBeNull();
      expect(screen.queryByRole('contentinfo')).toBeNull();
      expect(screen.queryByRole('navigation')).toBeNull();
    });

    it('renders decorative background with aria-hidden="true"', async () => {
      const router = createTestRouter('/', ModalLayout);
      await router.load();

      let rendered: RenderResult | undefined;
      await act(async () => {
        rendered = renderRouterWithProviders(router);
      });

      const decorativeBg = rendered?.container.querySelector('[aria-hidden="true"]');
      expect(decorativeBg).not.toBeNull();
    });

    it('renders main landmark with id="main-content" and tabIndex="-1" containing the child outlet', async () => {
      const router = createTestRouter('/', ModalLayout);
      await router.load();

      await act(async () => {
        renderRouterWithProviders(router);
      });

      const main = screen.getByRole('main');
      expect(main).toBeDefined();
      expect(main.getAttribute('id')).toBe('main-content');
      expect(main.getAttribute('tabIndex')).toBe('-1');

      const child = screen.getByTestId('child-home');
      expect(main.contains(child)).toBe(true);
    });
  });
});
