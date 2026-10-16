import * as React from 'react';
import { Header, Footer } from '@nft/shared-ui';
import { HomePageContent, PdpPageContent } from '@nft/catalog-ui';
import { singletonProbe } from '@nft/shell-kit';

export function App() {
  const [probeCount, setProbeCount] = React.useState<number>(() => singletonProbe.getCount());
  const [activeView, setActiveView] = React.useState<'home' | 'pdp'>('home');

  React.useEffect(() => {
    const nextCount = singletonProbe.increment('apps/storefront');
    setProbeCount(nextCount);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-surface-default text-text-primary font-mono antialiased">
      {/* Barra de identificação do Remote Storefront (Dev Mode - oculta no mobile para fidelidade ao frame) */}
      <div className="hidden lg:block border-b border-border-default/60 bg-[#0f1d18] px-4 py-1.5 text-xs text-text-muted">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            <h1 className="text-xs font-bold text-text-secondary m-0">Storefront Remote</h1>
            <span className="text-text-muted hidden sm:inline">• Worktree de Layouts</span>
            <div className="hidden sm:flex items-center gap-1 bg-surface-dark px-2 py-0.5 rounded border border-border-soft text-tiny-10">
              <button
                type="button"
                onClick={() => setActiveView('home')}
                className={`px-2 py-0.5 rounded font-mono transition-colors ${
                  activeView === 'home'
                    ? 'bg-primary text-text-primary font-bold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Layout Início (Home)
              </button>
              <button
                type="button"
                onClick={() => setActiveView('pdp')}
                className={`px-2 py-0.5 rounded font-mono transition-colors ${
                  activeView === 'pdp'
                    ? 'bg-primary text-text-primary font-bold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Layout Detalhes (PDP)
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-text-muted hidden md:inline">
              Sonda Singleton:{' '}
              <strong className="text-emerald-400" data-testid="singleton-probe-count">
                {probeCount}
              </strong>
            </span>
            <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-400 font-bold">
              Porta 4201
            </span>
          </div>
        </div>
      </div>

      {/* Header oficial Kurio (oculto abaixo de 1024px) */}
      <div className="hidden lg:block px-4 sm:px-6 md:px-10 lg:px-[120px] max-w-[1440px] mx-auto w-full pt-4">
        <Header
          user={{
            name: 'Vinicius Casarin',
            walletAddress: '0x71C...3948',
          }}
          cartCount={6}
          activePath={activeView === 'home' ? '/' : '/item/4092'}
        />
      </div>

      {/* Conteúdo principal */}
      <main className="flex-1" role="region" aria-label="Catálogo Storefront">
        {activeView === 'home' ? (
          <HomePageContent
            onSelectNft={() => {
              setActiveView('pdp');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          <PdpPageContent
            onBack={() => {
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Rodapé Oficial */}
      <Footer />
    </div>
  );
}

export default App;
