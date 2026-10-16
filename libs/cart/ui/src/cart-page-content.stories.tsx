import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { CartPageContent } from './cart-page-content';

const meta: Meta<typeof CartPageContent> = {
  title: 'Cart/CartPageContent',
  component: CartPageContent,
  tags: ['autodocs'],
  args: {
    initialItems: [
      {
        id: 'emerald',
        name: 'Emerald Ape #042',
        tokenId: '#0042',
        imageUrl: '/assets/images/nft-03-emerald-ape.png',
        priceEth: '1.19 ETH',
        totalEth: '2.38 ETH',
        quantity: 2,
        maxQuantity: 50,
        edition: '1/50',
      },
      {
        id: 'violet',
        name: 'Violet Nomad #314',
        tokenId: '#0009',
        imageUrl: '/assets/images/nft-07-violet-nomad.png',
        priceEth: '1.39 ETH',
        totalEth: '1.39 ETH',
        quantity: 1,
        maxQuantity: 10,
        edition: '1/10',
      },
      {
        id: 'ivory',
        name: 'Ivory Baron #088',
        tokenId: '#0552',
        imageUrl: '/assets/images/nft-08-ivory-baron.png',
        priceEth: '1.79 ETH',
        totalEth: '1.79 ETH',
        quantity: 1,
        maxQuantity: 10,
        edition: '1/10',
      },
    ],
    summary: {
      subtotalEth: '5.56 ETH',
      discountEth: '0 ETH',
      networkFeeEth: '0.005 ETH',
      totalEth: '5.565 ETH',
    },
    recommendedItems: [
      {
        id: 'other',
        name: 'Cyber Panther',
        price: '2 ETH',
        imageUrl: '/assets/images/nft-03-emerald-ape.png',
      },
    ],
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CartPageContent>;

export const DesktopFullPage: Story = {
  render: args => <CartPageContent {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Verifica elementos do cabe├ºalho / tabela desktop
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
  render: args => (
    <div className="max-w-[414px] mx-auto">
      <CartPageContent {...args} />
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
