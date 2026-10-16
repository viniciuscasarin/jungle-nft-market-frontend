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
    onCartClick: fn(),
    onSearchSubmit: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Guest: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const cartButton = canvas.getByRole('button', { name: /carrinho/i });
    await expect(cartButton).toBeInTheDocument();
    await userEvent.click(cartButton);
    await expect(args.onCartClick).toHaveBeenCalled();
  },
};

export const AuthenticatedUser: Story = {
  args: {
    user: {
      name: 'Vinicius Casarin',
      walletAddress: '0x71C...394A',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    },
    cartCount: 4,
  },
};
