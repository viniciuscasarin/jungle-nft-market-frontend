import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { AccountNavigation, type AccountMenuId } from './account-navigation';

const meta: Meta<typeof AccountNavigation> = {
  title: 'Profile/AccountNavigation',
  component: AccountNavigation,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Menu lateral de navegação da conta com largura fixa de 310px, indicador lateral ativo, 7 seções com ícones fiéis ao Figma e ação delimitada de logout.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AccountNavigation>;

/**
 * Estado padrão com a primeira aba "Dados do perfil" selecionada.
 */
export const ProfileActive: Story = {
  args: {
    activeMenu: 'profile',
  },
};

/**
 * Aba "Carteiras" selecionada.
 */
export const WalletsActive: Story = {
  args: {
    activeMenu: 'wallets',
  },
};

/**
 * Aba "Atividade" selecionada.
 */
export const ActivityActive: Story = {
  args: {
    activeMenu: 'activity',
  },
};

/**
 * Aba "Suporte" selecionada.
 */
export const SupportActive: Story = {
  args: {
    activeMenu: 'support',
  },
};

/**
 * Menu interativo completo permitindo alternar abas dinamicamente ao clicar.
 */
export const Interactive: Story = {
  render: function InteractiveStory() {
    const [active, setActive] = React.useState<AccountMenuId>('profile');

    return (
      <div className="flex flex-col gap-4 font-mono">
        <div className="text-xs text-text-muted">
          Aba ativa: <span className="font-bold text-primary">{active}</span>
        </div>
        <AccountNavigation activeMenu={active} onSelectMenu={setActive} />
      </div>
    );
  },
};
