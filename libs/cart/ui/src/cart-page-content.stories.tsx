import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { CartPageContent } from './cart-page-content';

const meta: Meta<typeof CartPageContent> = {
  title: 'Cart/CartPageContent',
  component: CartPageContent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CartPageContent>;

export const DesktopFullPage: Story = {
  render: () => <CartPageContent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Verifica elementos do cabeçalho / tabela desktop
    await expect(canvas.getByText('Emerald Ape #042')).toBeInTheDocument();
    await expect(canvas.getByText('Violet Nomad #314')).toBeInTheDocument();
    await expect(canvas.getByText('Ivory Baron #088')).toBeInTheDocument();
    await expect(canvas.getByText('Resumo da carteira')).toBeInTheDocument();
    await expect(canvas.getByText('Colecionadores também viram')).toBeInTheDocument();
  },
};

export const MobileResponsive: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => (
    <div className="max-w-[414px] mx-auto">
      <CartPageContent />
    </div>
  ),
};

export const EmptyCartState: Story = {
  render: () => <CartPageContent initialItems={[]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Seu carrinho está vazio')).toBeInTheDocument();
  },
};
