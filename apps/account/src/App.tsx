import * as React from 'react';
import { Header } from '@nft/shared-ui';
import {
  AccountLayout,
  AccountNavigation,
  AccountMobileHeader,
  ProfilePageContent,
  WalletsPageContent,
  AccountPlaceholderContent,
  type AccountMenuId,
} from '@nft/profile-ui';

const MENU_TITLES: Record<AccountMenuId, string> = {
  profile: 'Dados do perfil',
  wallets: 'Carteiras',
  activity: 'Atividade',
  wishlist: 'Lista de interesse',
  offers: 'Ofertas',
  downloads: 'Arquivos baixados',
  support: 'Suporte',
  logout: 'Sair',
};

export function App() {
  const [activeMenu, setActiveMenu] = React.useState<AccountMenuId>('profile');

  const renderContent = () => {
    switch (activeMenu) {
      case 'profile':
        return <ProfilePageContent />;
      case 'wallets':
        return <WalletsPageContent />;
      default:
        return <AccountPlaceholderContent menuId={activeMenu} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-default text-text-primary font-mono antialiased">
      {/* Barra de identificação do Remote Account (Dev Mode) */}
      <div className="border-b border-border-default/60 bg-[#1e130f] px-4 py-1.5 text-xs text-text-muted">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            <span className="font-semibold text-text-secondary">Account Remote • Worktree de Layouts</span>
          </div>
          <span className="rounded border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[11px] text-text-accent">
            Porta 4203
          </span>
        </div>
      </div>

      {/* Header oficial Kurio */}
      <div className="px-4 sm:px-6 md:px-10 lg:px-[120px] max-w-[1440px] mx-auto w-full pt-4">
        <Header
          user={{
            name: 'Vinicius Casarin',
            walletAddress: '0x71C...3948',
          }}
          cartCount={3}
          activePath="/conta"
        />
      </div>

      {/* Layout principal com sidebar fixa de 310px e gap de 28px no desktop, e mobileHeader de 3 colunas no mobile */}
      <main className="flex-1" role="region" aria-label="Painel de Conta e Carteiras">
        <AccountLayout
          sidebar={
            <AccountNavigation
              activeMenu={activeMenu}
              onSelectMenu={setActiveMenu}
            />
          }
          mobileHeader={
            <AccountMobileHeader
              title={MENU_TITLES[activeMenu]}
              activeMenu={activeMenu}
              onSelectMenu={setActiveMenu}
            />
          }
        >
          {renderContent()}
        </AccountLayout>
      </main>
    </div>
  );
}

export default App;
