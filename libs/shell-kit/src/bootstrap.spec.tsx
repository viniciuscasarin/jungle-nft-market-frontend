import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import * as ReactDOM from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { queryKeys, useQuery, useQueryClient } from '@nft/shared-query';
import {
  useNavigate,
  useSearch,
  Link,
  createMemoryHistory,
} from '@nft/shared-router';
import { parseCatalogSearchParams } from '@nft/shared-contracts';
import {
  bootstrapStandalone,
  resolveStandaloneDestination,
  resolveStandaloneHref,
  isSafeInternalPath,
  StandaloneLink,
} from './bootstrap';
import { useShell, useSession, type ShellContextValue } from './context';
import { usePageChrome } from './page-chrome';
import { singletonRegistry } from './singleton-registry';

vi.mock('react-dom/client', async (importOriginal) => {
  const original = await importOriginal<typeof ReactDOM>();
  return { ...original, createRoot: vi.fn(original.createRoot) };
});

describe('bootstrapStandalone (@nft/shell-kit)', () => {
  let container: HTMLDivElement;
  let mountedRoot: Root | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'root';
    document.body.appendChild(container);
    singletonRegistry.reset();
    vi.clearAllMocks();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(async () => {
    await act(async () => mountedRoot?.unmount());
    mountedRoot = null;
    singletonRegistry.get<ShellContextValue['queryClient']>('queryClient')?.clear();
    singletonRegistry.reset();
    vi.restoreAllMocks();
    document.body.removeChild(container);
  });

  it('shows accessible loading and waits for network, then session, before mounting the page', async () => {
    let releaseNetwork = () => {};
    const network = new Promise<void>((resolve) => { releaseNetwork = resolve; });
    const order: string[] = [];
    const initSession = vi.fn(async () => {
      order.push('session');
      return null;
    });
    function Page() {
      order.push('page');
      return <h1>Ready page</h1>;
    }
    let boot: Promise<Root | null>;
    act(() => {
      boot = bootstrapStandalone(Page, {
        mountPoint: container,
        initMsw: async () => { await network; order.push('network'); },
        initSession,
      });
    });
    expect(screen.getByRole('region', { name: 'Inicializando ambiente' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('heading', { name: 'Ready page' })).not.toBeInTheDocument();
    expect(initSession).not.toHaveBeenCalled();
    await act(async () => {
      releaseNetwork();
      mountedRoot = await boot;
    });
    expect(await screen.findByRole('heading', { name: 'Ready page' })).toBeInTheDocument();
    expect(order.slice(0, 3)).toEqual(['network', 'session', 'page']);
  });

  it.each(['network', 'session'])('recovers from rejected %s startup without another root or clients', async (failure) => {
    const initMsw = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const initSession = vi.fn<() => Promise<null>>().mockResolvedValue(null);
    if (failure === 'network') initMsw.mockRejectedValueOnce(new Error('Worker failed'));
    else initSession.mockRejectedValueOnce(new Error('Session failed'));
    await act(async () => {
      mountedRoot = await bootstrapStandalone(() => <h1>Recovered page</h1>, {
        mountPoint: container, initMsw, initSession,
      });
    });
    expect(screen.getByRole('alert', { name: 'Falha na inicialização' })).toHaveTextContent('Não foi possível iniciar o ambiente');
    expect(screen.queryByRole('heading', { name: 'Recovered page' })).not.toBeInTheDocument();
    if (failure === 'network') expect(initSession).not.toHaveBeenCalled();
    const clients = singletonRegistry.getAll();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('heading', { name: 'Recovered page' })).toBeInTheDocument();
    expect(ReactDOM.createRoot).toHaveBeenCalledTimes(1);
    for (const [key, value] of clients) expect(singletonRegistry.get(key)).toBe(value);
  });

  it('mounts the component inside the container and provides ShellContext', async () => {
    const TestComponent = () => {
      const { queryClient, httpClient, realtimeClient } = useShell();
      const session = useSession();

      return (
        <div>
          <h1>Standalone App</h1>
          <p data-testid="user">{session?.name}</p>
          <p data-testid="client-check">
            {queryClient && httpClient && realtimeClient ? 'clients-ready' : 'missing'}
          </p>
        </div>
      );
    };

    await act(async () => {
      mountedRoot = await bootstrapStandalone(TestComponent, {
        mountPoint: container,
        session: {
          userId: 'test-user',
          name: 'Test Standalone User',
          email: 'test@example.com',
        },
      });
    });

    expect(mountedRoot).not.toBeNull();

    await waitFor(() => {
      expect(container.querySelector('h1')).toHaveTextContent('Standalone App');
      expect(container.querySelector('[data-testid="user"]')).toHaveTextContent(
        'Test Standalone User',
      );
      expect(
        container.querySelector('[data-testid="client-check"]'),
      ).toHaveTextContent('clients-ready');
    });
  });

  it('awaits initMsw before mounting when provided', async () => {
    let mswInitialized = false;

    const initMsw = vi.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      mswInitialized = true;
    });

    const TestComponent = () => (
      <div>MSW Ready: {mswInitialized ? 'yes' : 'no'}</div>
    );

    await act(async () => {
      mountedRoot = await bootstrapStandalone(TestComponent, {
        mountPoint: container,
        initMsw,
      });
    });

    expect(initMsw).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(container).toHaveTextContent('MSW Ready: yes');
    });
  });

  it('provides real query, chrome and feedback consumers and preserves clients/root on query retry', async () => {
    const observedClients = new Set<ShellContextValue['queryClient']>();
    const observedHttp = new Set<ShellContextValue['httpClient']>();
    const observedRealtime = new Set<ShellContextValue['realtimeClient']>();
    const load = vi.fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('Temporary failure'))
      .mockResolvedValue('Query recovered');

    function ConnectedPage() {
      const shell = useShell();
      const queryClient = useQueryClient();
      const chrome = usePageChrome({ breadcrumbLabel: 'Standalone page' });
      const query = useQuery({
        queryKey: queryKeys.catalog.all(),
        queryFn: load,
        retry: false,
      });
      observedClients.add(queryClient);
      observedHttp.add(shell.httpClient);
      observedRealtime.add(shell.realtimeClient);

      return (
        <section aria-label="Connected page">
          <h1>{chrome.breadcrumbLabel}</h1>
          <p>{queryClient === shell.queryClient ? 'Shared query client' : 'Duplicate client'}</p>
          {query.isError && <button onClick={() => void query.refetch()}>Retry query</button>}
          {query.data && <p>{query.data}</p>}
          <button onClick={() => shell.feedback.notify({ message: 'Feedback ready' })}>Notify</button>
          <button onClick={() => shell.feedback.announce('Critical feedback', 'assertive')}>Announce</button>
        </section>
      );
    }

    await act(async () => {
      mountedRoot = await bootstrapStandalone(ConnectedPage, { mountPoint: container, session: null });
    });
    expect(await screen.findByRole('heading', { name: 'Standalone page' })).toBeInTheDocument();
    expect(screen.getByText('Shared query client')).toBeInTheDocument();
    const retry = await screen.findByRole('button', { name: 'Retry query' });
    const clientsBeforeRetry = singletonRegistry.getAll();
    fireEvent.click(retry);
    expect(await screen.findByText('Query recovered')).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
    expect(ReactDOM.createRoot).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole('region', { name: 'Connected page' })).toHaveLength(1);
    expect(observedClients.size).toBe(1);
    expect(observedHttp.size).toBe(1);
    expect(observedRealtime.size).toBe(1);
    for (const [key, instance] of clientsBeforeRetry) {
      expect(singletonRegistry.get(key)).toBe(instance);
    }

    fireEvent.click(screen.getByRole('button', { name: 'Notify' }));
    expect(within(screen.getByRole('region', { name: 'Notificações' })).getByText('Feedback ready')).toBeInTheDocument();
    expect(document.getElementById('shell-live-polite')).toHaveTextContent('Feedback ready');
    fireEvent.click(screen.getByRole('button', { name: 'Announce' }));
    expect(document.getElementById('shell-live-assertive')).toHaveTextContent('Critical feedback');
    expect(document.querySelectorAll('#shell-live-polite')).toHaveLength(1);
    expect(document.querySelectorAll('#shell-live-assertive')).toHaveLength(1);
  });

  it('returns null and does not mount if mount point element is not found', async () => {
    const TestComponent = () => <div>Ghost Component</div>;

    const root = await bootstrapStandalone(TestComponent, {
      mountPoint: '#non-existent-element',
    });

    expect(root).toBeNull();
  });

  it('supports local page descriptors rendered via Outlet and redirects', async () => {
    function ProfilePage() {
      return <h1>Página de Perfil</h1>;
    }
    function WalletsPage() {
      return <h1>Página de Carteiras</h1>;
    }

    await act(async () => {
      mountedRoot = await bootstrapStandalone({
        mountPoint: container,
        initialRoute: '/',
        pages: [
          { path: '/', redirect: '/perfil' },
          { path: '/perfil', component: ProfilePage },
          { path: '/carteiras', component: WalletsPage },
        ],
      });
    });

    expect(await screen.findByRole('heading', { name: 'Página de Perfil' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Página de Carteiras' })).not.toBeInTheDocument();
  });

  it('supports navigation via useNavigate hook, Link component, and useShell().navigate', async () => {
    const onNavigate = vi.fn();

    function PageA() {
      const navigate = useNavigate();
      return (
        <div>
          <h1>Página A</h1>
          <Link to="/carteiras">Ir via Link</Link>
          <button onClick={() => void navigate({ to: '/carteiras' })}>Ir via Hook</button>
        </div>
      );
    }

    function PageB() {
      const shell = useShell();
      return (
        <div>
          <h1>Página B</h1>
          <button onClick={() => shell.navigate('/perfil')}>Voltar via Shell</button>
        </div>
      );
    }

    await act(async () => {
      mountedRoot = await bootstrapStandalone({
        mountPoint: container,
        initialRoute: '/perfil',
        onNavigate,
        pages: [
          { path: '/perfil', component: PageA },
          { path: '/carteiras', component: PageB },
        ],
      });
    });

    expect(await screen.findByRole('heading', { name: 'Página A' })).toBeInTheDocument();

    // 1. Navigation via Link
    fireEvent.click(screen.getByRole('link', { name: 'Ir via Link' }));
    expect(await screen.findByRole('heading', { name: 'Página B' })).toBeInTheDocument();

    // 2. Navigation via useShell().navigate
    fireEvent.click(screen.getByRole('button', { name: 'Voltar via Shell' }));
    expect(await screen.findByRole('heading', { name: 'Página A' })).toBeInTheDocument();
    expect(onNavigate).toHaveBeenCalledWith('/perfil');

    // 3. Navigation via useNavigate hook
    fireEvent.click(screen.getByRole('button', { name: 'Ir via Hook' }));
    expect(await screen.findByRole('heading', { name: 'Página B' })).toBeInTheDocument();
  });

  it('supports back navigation and memory / browser history configurations', async () => {
    const memoryHistory = createMemoryHistory({ initialEntries: ['/perfil'] });

    function ProfilePage() {
      const { navigate } = useShell();
      return (
        <div>
          <h1>Perfil</h1>
          <button onClick={() => navigate('/carteiras')}>Ir para carteiras</button>
        </div>
      );
    }
    function WalletsPage() {
      return <h1>Carteiras</h1>;
    }

    await act(async () => {
      mountedRoot = await bootstrapStandalone({
        mountPoint: container,
        history: memoryHistory,
        pages: [
          { path: '/perfil', component: ProfilePage },
          { path: '/carteiras', component: WalletsPage },
        ],
      });
    });

    expect(await screen.findByRole('heading', { name: 'Perfil' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ir para carteiras' }));
    expect(await screen.findByRole('heading', { name: 'Carteiras' })).toBeInTheDocument();

    act(() => {
      memoryHistory.back();
    });
    expect(await screen.findByRole('heading', { name: 'Perfil' })).toBeInTheDocument();
  });

  it('validates search parameters with shared contracts and exposes them via useSearch', async () => {
    function CatalogPage() {
      const search = useSearch({ strict: false }) as { q?: string; tab?: string; page?: number };
      return (
        <div>
          <h1>Catálogo</h1>
          <p data-testid="search-q">{search.q ?? 'empty'}</p>
          <p data-testid="search-tab">{search.tab}</p>
          <p data-testid="search-page">{String(search.page)}</p>
        </div>
      );
    }

    await act(async () => {
      mountedRoot = await bootstrapStandalone({
        mountPoint: container,
        initialRoute: '/?q=panther&tab=trending&page=2',
        pages: [
          {
            path: '/',
            component: CatalogPage,
            validateSearch: parseCatalogSearchParams,
          },
        ],
      });
    });

    expect(await screen.findByRole('heading', { name: 'Catálogo' })).toBeInTheDocument();
    expect(screen.getByTestId('search-q')).toHaveTextContent('panther');
    expect(screen.getByTestId('search-tab')).toHaveTextContent('trending');
    expect(screen.getByTestId('search-page')).toHaveTextContent('2');
  });

  it('renders configured initialRoute directly on mount', async () => {
    function ProfilePage() {
      return <h1>Perfil Inicial</h1>;
    }
    function WalletsPage() {
      return <h1>Carteiras Inicial</h1>;
    }

    await act(async () => {
      mountedRoot = await bootstrapStandalone({
        mountPoint: container,
        initialRoute: '/carteiras',
        pages: [
          { path: '/perfil', component: ProfilePage },
          { path: '/carteiras', component: WalletsPage },
        ],
      });
    });

    expect(await screen.findByRole('heading', { name: 'Carteiras Inicial' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Perfil Inicial' })).not.toBeInTheDocument();
  });

  it('renders accessible not-found state with links to remote entry and shell on unknown URLs', async () => {
    await act(async () => {
      mountedRoot = await bootstrapStandalone({
        mountPoint: container,
        initialRoute: '/rota-desconhecida',
        shellOrigin: 'http://localhost:4200',
        pages: [
          { path: '/', component: () => <h1>Home</h1> },
        ],
      });
    });

    const notFoundRegion = await screen.findByRole('region', { name: 'Página não encontrada' });
    expect(notFoundRegion).toBeInTheDocument();
    expect(within(notFoundRegion).getByRole('alert')).toHaveTextContent('Página Não Encontrada');

    const remoteHomeLink = screen.getByRole('link', { name: 'Início do Remote' });
    expect(remoteHomeLink).toHaveAttribute('href', '/');

    const shellLink = screen.getByRole('link', { name: 'Abrir Shell Integrado' });
    expect(shellLink).toHaveAttribute('href', 'http://localhost:4200');
  });

  describe('external destination resolution and security', () => {
    const localPaths = ['/', '/perfil', '/carteiras'];

    it('identifies safe internal paths and rejects open redirect attempts', () => {
      expect(isSafeInternalPath('/perfil')).toBe(true);
      expect(isSafeInternalPath('/nft/cyber-panther-1?tab=bids#price')).toBe(true);
      expect(isSafeInternalPath('/login')).toBe(true);

      expect(isSafeInternalPath('')).toBe(false);
      expect(isSafeInternalPath('//evil.com')).toBe(false);
      expect(isSafeInternalPath('/\\evil.com')).toBe(false);
      expect(isSafeInternalPath('https://external.com')).toBe(false);
      expect(isSafeInternalPath('javascript:alert(1)')).toBe(false);
      expect(isSafeInternalPath('data:text/html,hack')).toBe(false);
    });

    it('resolves local destinations to local router paths', () => {
      const res1 = resolveStandaloneDestination('/perfil', { localPaths });
      expect(res1).toEqual({ type: 'local', path: '/perfil' });

      const res2 = resolveStandaloneDestination('/carteiras?filter=active#details', { localPaths });
      expect(res2).toEqual({ type: 'local', path: '/carteiras?filter=active#details' });
    });

    it('resolves external product destinations (PDP, login, checkout) to configured shellOrigin preserving search and hash', () => {
      const pdp = resolveStandaloneDestination('/nft/cyber-ape-42?ref=trending#history', {
        localPaths,
        shellOrigin: 'http://localhost:4200',
      });
      expect(pdp).toEqual({
        type: 'external',
        url: 'http://localhost:4200/nft/cyber-ape-42?ref=trending#history',
      });

      const login = resolveStandaloneDestination('/login?redirect=%2Fcarteiras', {
        localPaths,
        shellOrigin: 'http://localhost:4200',
      });
      expect(login).toEqual({
        type: 'external',
        url: 'http://localhost:4200/login?redirect=%2Fcarteiras',
      });

      // Alternative E2E test origin
      const e2e = resolveStandaloneDestination('/carrinho', {
        localPaths,
        shellOrigin: 'http://localhost:9999/',
      });
      expect(e2e).toEqual({
        type: 'external',
        url: 'http://localhost:9999/carrinho',
      });
    });

    it('rejects insecure external destinations to safe fallback', () => {
      expect(resolveStandaloneDestination('//evil.com/phish', { localPaths })).toEqual({
        type: 'invalid',
        path: '/',
      });
      expect(resolveStandaloneDestination('/\\evil.com', { localPaths })).toEqual({
        type: 'invalid',
        path: '/',
      });
      expect(resolveStandaloneDestination('javascript:alert(1)', { localPaths })).toEqual({
        type: 'invalid',
        path: '/',
      });
    });

    it('navigates to external product URLs or safe fallback via useShell().navigate', async () => {
      const onNavigate = vi.fn();
      const assignSpy = vi.fn();
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { ...window.location, assign: assignSpy, href: '' },
      });

      function PageWithNavigation() {
        const shell = useShell();
        return (
          <div>
            <h1>Navigation Test</h1>
            <button onClick={() => shell.navigate('/nft/nft-123?tab=price')}>Open PDP</button>
            <button onClick={() => shell.navigate('/login?redirect=%2Fperfil')}>Go Login</button>
            <button onClick={() => shell.navigate('//insecure-domain.com')}>Trigger Insecure</button>
          </div>
        );
      }

      await act(async () => {
        mountedRoot = await bootstrapStandalone({
          mountPoint: container,
          shellOrigin: 'http://localhost:4200',
          onNavigate,
          pages: [
            { path: '/', component: PageWithNavigation },
          ],
        });
      });

      // 1. External PDP
      fireEvent.click(screen.getByRole('button', { name: 'Open PDP' }));
      expect(onNavigate).toHaveBeenCalledWith('http://localhost:4200/nft/nft-123?tab=price');
      expect(assignSpy).toHaveBeenCalledWith('http://localhost:4200/nft/nft-123?tab=price');

      // 2. External Login
      fireEvent.click(screen.getByRole('button', { name: 'Go Login' }));
      expect(onNavigate).toHaveBeenCalledWith('http://localhost:4200/login?redirect=%2Fperfil');
      expect(assignSpy).toHaveBeenCalledWith('http://localhost:4200/login?redirect=%2Fperfil');

      // 3. Insecure Destination
      fireEvent.click(screen.getByRole('button', { name: 'Trigger Insecure' }));
      expect(onNavigate).toHaveBeenCalledWith('/');
    });

    it('renders StandaloneLink with local Link or external anchor based on destination and shell origin', async () => {
      function LinksPage() {
        return (
          <div>
            <h1>Links Page</h1>
            <StandaloneLink to="/carteiras" localPaths={localPaths}>
              Link Local Carteiras
            </StandaloneLink>
            <StandaloneLink
              to="/nft/cyber-panther-99?ref=banner"
              localPaths={localPaths}
              shellOrigin="http://localhost:4200"
            >
              Link Externo PDP
            </StandaloneLink>
            <StandaloneLink
              to="/login"
              localPaths={localPaths}
              shellOrigin="http://e2e.test:4300"
            >
              Link Externo E2E Login
            </StandaloneLink>
            <StandaloneLink to="//evil.com" localPaths={localPaths}>
              Link Inseguro
            </StandaloneLink>
          </div>
        );
      }

      await act(async () => {
        mountedRoot = await bootstrapStandalone({
          mountPoint: container,
          pages: [
            { path: '/', component: LinksPage },
            { path: '/carteiras', component: () => <h1>Carteiras</h1> },
          ],
        });
      });

      const localLink = screen.getByRole('link', { name: 'Link Local Carteiras' });
      expect(localLink).toHaveAttribute('href', '/carteiras');

      const pdpLink = screen.getByRole('link', { name: 'Link Externo PDP' });
      expect(pdpLink).toHaveAttribute('href', 'http://localhost:4200/nft/cyber-panther-99?ref=banner');

      const e2eLink = screen.getByRole('link', { name: 'Link Externo E2E Login' });
      expect(e2eLink).toHaveAttribute('href', 'http://e2e.test:4300/login');

      const insecureLink = screen.getByRole('link', { name: 'Link Inseguro' });
      expect(insecureLink).toHaveAttribute('href', '/');
    });
  });
});

