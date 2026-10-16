import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within, fn } from '@storybook/test';
import { Header } from './header';

const meta: Meta<typeof Header> = {
  title: 'Layout/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/dKMJKBVdX6q0Ym4OX5vd3V?node-id=2:2',
    },
  },
  args: {
    cartCount: 2,
    activePath: '/',
    onLoginClick: fn(),
    onLogoutClick: fn(),
    onCartClick: fn(),
    onSearchClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Guest: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const cartLink = canvas.getByRole('link', { name: /carrinho/i });
    await expect(cartLink).toBeInTheDocument();
    await userEvent.click(cartLink);
    await expect(args.onCartClick).toHaveBeenCalled();
  },
};

export const AuthenticatedWithDropdown: Story = {
  args: {
    user: {
      name: 'Vinicius Casarin',
      walletAddress: '0x71C...394A',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    },
    cartCount: 4,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const userMenuButton = canvas.getByRole('button', { name: /menu de vinicius/i });
    await expect(userMenuButton).toBeInTheDocument();
    await userEvent.click(userMenuButton);
    const logoutItem = await within(document.body).findByRole('menuitem', { name: /sair/i });
    await expect(logoutItem).toBeInTheDocument();
    await userEvent.click(logoutItem);
    await expect(args.onLogoutClick).toHaveBeenCalled();
  },
};

export const MarketRouteActive: Story = {
  args: {
    activePath: '/mercado',
    cartCount: 0,
  },
};

export const WithManyCartItems: Story = {
  args: {
    cartCount: 120,
  },
};

export const WithoutCartBadge: Story = {
  args: {
    cartCount: 0,
  },
};
