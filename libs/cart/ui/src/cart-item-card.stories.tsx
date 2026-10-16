import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { CartItemCard } from './cart-item-card';
import { CartItem } from './types';

const sampleItem: CartItem = {
  id: 'emerald-ape-042',
  name: 'Emerald Ape #042',
  tokenId: '#0042',
  imageUrl: '/assets/images/nft-03-emerald-ape.png',
  priceEth: '1.19 ETH',
  quantity: 1,
  maxQuantity: 50,
  edition: '1/50',
};

const meta: Meta<typeof CartItemCard> = {
  title: 'Cart/CartItemCard',
  component: CartItemCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof CartItemCard>;

function CartItemCardDemo() {
  const [item, setItem] = React.useState(sampleItem);
  return (
    <div className="max-w-[414px] p-4 bg-surface-default text-text-primary">
      <CartItemCard
        item={item}
        onQuantityChange={(_id, qty) => setItem((prev) => ({ ...prev, quantity: qty }))}
        onRemove={() => alert('Remover')}
      />
    </div>
  );
}

export const MobileCard: Story = {
  render: () => <CartItemCardDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Emerald Ape #042')).toBeInTheDocument();
    await expect(canvas.getByText('Edição: 1/50')).toBeInTheDocument();
    await expect(canvas.getByText('1.19 ETH')).toBeInTheDocument();
  },
};
