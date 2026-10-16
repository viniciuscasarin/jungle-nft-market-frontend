import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within, fn } from '@storybook/test';
import { AccountSidebar } from './account-sidebar';

const meta: Meta<typeof AccountSidebar> = {
  title: 'Widgets/AccountSidebar',
  component: AccountSidebar,
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/dKMJKBVdX6q0Ym4OX5vd3V?node-id=70381:239',
    },
  },
  args: {
    user: {
      name: 'Vinicius Casarin',
      email: 'vinicius@casarin.dev',
      walletAddress: '0x71C...394A',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    },
    activePath: '/perfil',
    onNavigate: fn(),
    onLogout: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof AccountSidebar>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const logoutBtn = canvas.getByRole('button', { name: /Desconectar/i });
    await expect(logoutBtn).toBeInTheDocument();
    await userEvent.click(logoutBtn);
    await expect(args.onLogout).toHaveBeenCalled();
  },
};
