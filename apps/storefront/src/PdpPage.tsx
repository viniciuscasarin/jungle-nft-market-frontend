import React from 'react';
import { useParams } from '@nft/shared-router';
import { useShell, useSession } from '@nft/shell-kit';

export function PdpPage() {
  const { queryClient } = useShell();
  const session = useSession();

  let nftId: string | undefined;
  try {
    const params = useParams({ strict: false }) as Record<string, string>;
    nftId = params['nftId'];
  } catch {
    // Standalone or unrouted fallback
  }

  return (
    <div
      data-testid="storefront-pdp-page"
      className="max-w-4xl mx-auto p-6 space-y-4"
    >
      <div className="border border-border-default rounded-lg p-6 bg-surface-card">
        <span className="text-tiny-10 uppercase tracking-widest text-text-accent font-mono font-bold">
          Storefront Remote
        </span>
        <h1 className="text-heading-24 font-bold text-text-primary mt-2">
          Detalhes do NFT {nftId ? `#${nftId}` : ''}
        </h1>
        <p className="text-body-14 text-text-secondary mt-2">
          Página de detalhes do item colecionável (PDP). Carregada via Module Federation.
        </p>
        <div className="mt-4 pt-4 border-t border-border-soft flex gap-4 text-caption-12 text-text-muted font-mono">
          <span>QueryClient: {queryClient ? 'Conectado' : 'Ausente'}</span>
          <span>Sessão: {session ? session.name : 'Visitante'}</span>
        </div>
      </div>
    </div>
  );
}

export default PdpPage;
