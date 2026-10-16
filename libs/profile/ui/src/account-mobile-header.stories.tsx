import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { AccountMobileHeader } from './account-mobile-header';
import type { AccountMenuId } from './account-navigation';

const meta: Meta<typeof AccountMobileHeader> = {
  title: 'Profile/AccountMobileHeader',
  component: AccountMobileHeader,
  parameters: {
    layout: 'padded',
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        component:
          'Cabeçalho móvel de 3 colunas para a conta do colecionador. Consome o componente desacoplado MobileHeader e inclui o modal interativo com os menus da conta ao tocar na bolinha da direita.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AccountMobileHeader>;

/**
 * Visualização padrão com "Dados do perfil" selecionado.
 */
export const Default: Story = {
  args: {
    title: 'Dados do perfil',
    activeMenu: 'profile',
  },
};

/**
 * Visualização com "Carteiras" selecionado.
 */
export const WalletsView: Story = {
  args: {
    title: 'Carteiras',
    activeMenu: 'wallets',
  },
};

/**
 * Demonstração interativa completa: clique no botão da direita para abrir o menu da conta e trocar de página.
 */
export const Interactive: Story = {
  render: function InteractiveStory() {
    const [active, setActive] = React.useState<AccountMenuId>('profile');

    const titles: Record<AccountMenuId, string> = {
      profile: 'Dados do perfil',
      wallets: 'Carteiras',
      activity: 'Atividade',
      wishlist: 'Lista de interesse',
      offers: 'Ofertas',
      downloads: 'Arquivos baixados',
      support: 'Suporte',
      logout: 'Sair',
    };

    return (
      <div className="max-w-md mx-auto p-4 font-mono bg-surface-default border border-border-default rounded-md">
        <AccountMobileHeader
          title={titles[active]}
          activeMenu={active}
          onSelectMenu={setActive}
        />
        <div className="p-6 text-center text-sm text-text-muted border border-dashed border-border-default rounded-xs">
          Conteúdo da tela: <span className="font-bold text-text-primary">{titles[active]}</span>
        </div>
      </div>
    );
  },
};
