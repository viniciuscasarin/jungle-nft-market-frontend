import React from 'react';
import { useParams } from '@nft/shared-router';
import { useShell, useSession } from '@nft/shell-kit';
import { PdpPageContent } from '@nft/catalog-ui';

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

  const title = nftId ? `Detalhes do NFT #${nftId}` : 'Detalhes do NFT #4092 - Cosmic Bloom';
  const tokenId = nftId ? `#${nftId}` : '#4092';

  return (
    <div
      data-testid="storefront-pdp-page"
      className="w-full min-h-screen bg-surface-default text-text-primary"
    >
      {/* Metadados acessíveis e de integração com host Shell */}
      <div className="sr-only">
        <span>Storefront Remote</span>
        <span>QueryClient: {queryClient ? 'Conectado' : 'Ausente'}</span>
        <span>Sessão: {session ? session.name : 'Visitante'}</span>
      </div>

      <PdpPageContent
        title={title}
        tokenId={tokenId}
      />
    </div>
  );
}

export default PdpPage;
