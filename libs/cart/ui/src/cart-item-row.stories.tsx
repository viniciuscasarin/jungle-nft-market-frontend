import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { CartItemRow } from './cart-item-row';
import { CartItem } from './types';

const sampleItem: CartItem = {
  id: 'emerald-ape-042',
  name: 'Emerald Ape #042',
  tokenId: '#0042',
  imageUrl: '/assets/images/nft-03-emerald-ape.png',
  priceEth: '1.19 ETH',
  quantity: 2,
  maxQuantity: 50,
  edition: '1/50',
};

const meta: Meta<typeof CartItemRow> = {
  title: 'Cart/CartItemRow',
  component: CartItemRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof CartItemRow>;

function CartItemRowDemo() {
  const [item, setItem] = React.useState(sampleItem);
  return (
    <div className="max-w-4xl p-6 bg-surface-default text-text-primary">
      <table className="w-full text-left font-mono">
        <tbody>
          <CartItemRow
            item={item}
            onQuantityChange={(_id, qty) => setItem((prev) => ({ ...prev, quantity: qty }))}
            onRemove={() => alert('Remover item')}
          />
        </tbody>
      </table>
    </div>
  );
}

export const Default: Story = {
  render: () => <CartItemRowDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Emerald Ape #042')).toBeInTheDocument();
    await expect(canvas.getByText('ID do token: #0042')).toBeInTheDocument();
    await expect(canvas.getByText('1.19 ETH')).toBeInTheDocument();
    await expect(canvas.getByText('2.38 ETH')).toBeInTheDocument();

    const incBtn = canvas.getByRole('button', { name: 'Aumentar quantidade' });
    await userEvent.click(incBtn);
    await expect(canvas.getByText('3.57 ETH')).toBeInTheDocument();
  },
};
