import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { OrderSummaryCard } from './order-summary-card';
import { CartOrderSummary } from './types';

const sampleSummary: CartOrderSummary = {
  subtotalEth: '26.83 ETH',
  discountEth: '00.00',
  networkFeeEth: '0.016 ETH',
  totalEth: '26.846 ETH',
  appliedCoupon: null,
};

const meta: Meta<typeof OrderSummaryCard> = {
  title: 'Cart/OrderSummaryCard',
  component: OrderSummaryCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof OrderSummaryCard>;

function OrderSummaryCardDemo() {
  const [summary, setSummary] = React.useState(sampleSummary);
  return (
    <div className="max-w-[420px] p-4 bg-surface-default text-text-primary">
      <OrderSummaryCard
        summary={summary}
        onApplyCoupon={(code) =>
          setSummary((prev) => ({
            ...prev,
            appliedCoupon: code,
            discountEth: '2.68 ETH',
            totalEth: '24.166 ETH',
          }))
        }
        onRemoveCoupon={() =>
          setSummary((prev) => ({
            ...prev,
            appliedCoupon: null,
            discountEth: '00.00',
            totalEth: '26.846 ETH',
          }))
        }
        onCheckout={() => alert('Finalizar')}
        onContinueShopping={() => alert('Continuar')}
      />
    </div>
  );
}

export const DesktopView: Story = {
  render: () => <OrderSummaryCardDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Resumo da carteira')).toBeInTheDocument();
    await expect(canvas.getByText('26.83 ETH')).toBeInTheDocument();
    await expect(canvas.getByText('26.846 ETH')).toBeInTheDocument();
    await expect(canvas.getByText('Taxa estimada')).toBeInTheDocument();

    const input = canvas.getByPlaceholderText('Digite o código promocional...');
    const applyBtn = canvas.getByRole('button', { name: 'Aplicar' });

    await userEvent.type(input, 'JUNGLE10');
    await userEvent.click(applyBtn);

    await expect(canvas.getByText(/JUNGLE10/)).toBeInTheDocument();
    await expect(canvas.getByText('24.166 ETH')).toBeInTheDocument();
  },
};

export const MobileView: Story = {
  render: () => (
    <div className="max-w-[414px] p-4 bg-surface-default text-text-primary">
      <OrderSummaryCard
        isMobile
        summary={{
          subtotalEth: '8.92 ETH',
          discountEth: '00.00',
          networkFeeEth: '0.016 ETH',
          totalEth: '8.936 ETH',
          appliedCoupon: null,
        }}
      />
    </div>
  ),
};
