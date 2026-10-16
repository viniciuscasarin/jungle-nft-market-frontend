import * as React from 'react';
import { Header, Footer } from '@nft/shared-ui';
import { PdpPageContent } from '@nft/catalog-ui';
import { singletonProbe } from '@nft/shell-kit';

export function App() {
  const [probeCount, setProbeCount] = React.useState<number>(() => singletonProbe.getCount());
  const [activeView, setActiveView] = React.useState<'pdp' | 'catalog'>('pdp');

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
                onClick={() => setActiveView('pdp')}
                className={`px-2 py-0.5 rounded font-mono transition-colors ${
                  activeView === 'pdp' ? 'bg-primary text-text-primary font-bold' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Layout Detalhes (PDP)
              </button>
              <button
                type="button"
                onClick={() => setActiveView('catalog')}
                className={`px-2 py-0.5 rounded font-mono transition-colors ${
                  activeView === 'catalog' ? 'bg-primary text-text-primary font-bold' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Info do Remote
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-text-muted hidden md:inline">
              Sonda Singleton: <strong className="text-emerald-400" data-testid="singleton-probe-count">{probeCount}</strong>
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
          cartCount={1}
          activePath="/item/4092"
        />
      </div>

      {/* Conteúdo principal */}
      <main className="flex-1" role="region" aria-label="Catálogo Storefront">
        {activeView === 'pdp' ? (
          <PdpPageContent />
        ) : (
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="rounded-2xl border border-border-default bg-surface-card p-8">
              <span className="text-tiny-10 uppercase tracking-widest text-text-accent font-mono font-bold">
                Storefront Remote
              </span>
              <h2 className="mt-2 text-heading-28 font-bold text-text-primary">
                Vitrine & Catálogo de Colecionáveis
              </h2>
              <p className="mt-3 text-body-14 text-text-secondary leading-relaxed">
                Este remote é responsável pela vitrine de produtos, filtros por categoria, ordenação por preço e página de detalhes do NFT (PDP).
              </p>
              <div className="mt-6 pt-4 border-t border-border-soft flex gap-4 text-caption-12 text-text-muted">
                <button
                  type="button"
                  onClick={() => setActiveView('pdp')}
                  className="text-text-accent hover:underline font-bold"
                >
                  → Ver página de Detalhes do Produto (PDP)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Rodapé Oficial */}
      <Footer />
    </div>
  );
}

export default App;
