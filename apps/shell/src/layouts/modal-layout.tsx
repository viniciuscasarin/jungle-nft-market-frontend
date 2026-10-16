import React from 'react';
import { Outlet } from '@nft/shared-router';

export function ModalLayout() {
  return (
    <div className="relative min-h-screen bg-background font-mono text-text-primary flex flex-col justify-center items-center overflow-x-hidden antialiased select-none">
      {/* Fundo decorativo marketplace com aria-hidden="true" (não monta a Home real) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0"
      >
        <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
      </div>

      {/* Conteúdo principal acessível */}
      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 w-full flex-1 flex flex-col items-center justify-center p-4 sm:p-6 focus:outline-none"
      >
        <Outlet />
      </main>
    </div>
  );
}
