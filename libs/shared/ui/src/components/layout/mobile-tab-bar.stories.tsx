import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within, fn } from '@storybook/test';
import { MobileTabBar } from './mobile-tab-bar';

const meta: Meta<typeof MobileTabBar> = {
  title: 'Layout/MobileTabBar',
  component: MobileTabBar,
  tags: ['autodocs'],
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/dKMJKBVdX6q0Ym4OX5vd3V?node-id=14:5226',
    },
  },
  args: {
    cartCount: 3,
    activeId: 'catalog',
    onTabSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof MobileTabBar>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const cartTab = canvas.getByRole('link', { name: /Carrinho/i });
    await expect(cartTab).toBeInTheDocument();
    await userEvent.click(cartTab);
    await expect(args.onTabSelect).toHaveBeenCalledWith('cart');
  },
};

export const WithoutBadge: Story = {
  args: {
    cartCount: 0,
    activeId: 'account',
  },
};

export const ActiveByPath: Story = {
  args: {
    activePath: '/perfil',
    cartCount: 5,
  },
};
