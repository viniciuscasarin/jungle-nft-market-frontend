import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
} from '@tanstack/react-router';

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
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Voltar para o Início
          </Link>
        </div>
      </div>
    </main>
  );
}

export function RootComponent() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-emerald-400 transition hover:opacity-90"
          >
            <span>🌿</span>
            <span>Jungle NFT Market</span>
          </Link>
          <nav aria-label="Navegação Principal" className="flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link to="/" className="transition hover:text-emerald-400">
              Início
            </Link>
            <span
              className="cursor-not-allowed text-xs text-slate-500"
              title="Disponível na integração de remotes"
            >
              Catálogo
            </span>
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

export const rootRoute = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomeComponent,
});

export const routeTree = rootRoute.addChildren([indexRoute]);

export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFoundComponent,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
