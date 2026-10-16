import React from 'react';
import { useShell, useSession } from '@nft/shell-kit';
import { HomePageContent } from '@nft/catalog-ui';

export function HomePage() {
  const { queryClient } = useShell();
  const session = useSession();

  return (
    <div
      data-testid="storefront-home-page"
      className="w-full min-h-screen bg-surface-default text-text-primary"
    >
      {/* Metadados acessíveis e de integração com host Shell */}
      <div className="sr-only">
        <span>Storefront Remote - Início</span>
        <span>QueryClient: {queryClient ? 'Conectado' : 'Ausente'}</span>
        <span>Sessão: {session ? session.name : 'Visitante'}</span>
      </div>

      <HomePageContent />
    </div>
  );
}

export default HomePage;
