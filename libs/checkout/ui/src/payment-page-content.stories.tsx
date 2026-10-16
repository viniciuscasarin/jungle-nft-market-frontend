import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { PaymentPageContent } from './payment-page-content';

const meta: Meta<typeof PaymentPageContent> = {
  title: 'Checkout/PaymentPageContent',
  component: PaymentPageContent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PaymentPageContent>;

export const DesktopFullPage: Story = {
  render: () => <PaymentPageContent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Perfil do colecionador')).toBeInTheDocument();
    await expect(canvas.getByText('Seus NFTs')).toBeInTheDocument();
    await expect(canvas.getByText('Carteira e rede')).toBeInTheDocument();
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
      <PaymentPageContent />
    </div>
  ),
};
