import React from 'react';

export function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <span className="text-lg font-extrabold tracking-tight text-emerald-400">
              Account Remote
            </span>
          </div>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            Porta 4203
          </span>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-12" role="region" aria-label="Painel de Conta e Carteiras">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl backdrop-blur sm:p-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            Perfil & Carteiras
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-100 sm:text-4xl">
            Account Remote
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400">
            Módulo responsável pela gestão do perfil do colecionador, preferências e gerenciamento seguro de carteiras Ethereum simuladas.
          </p>
          <div className="mt-8 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-6 text-sm text-slate-500">
            <p className="font-medium text-slate-400">Status de Integração</p>
            <p className="mt-1">
              Pronto para execução independente em desenvolvimento ou consumo via Module Federation pelo host shell.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Jungle NFT Market - Remote Independente</p>
      </footer>
    </div>
  );
}

export default App;
