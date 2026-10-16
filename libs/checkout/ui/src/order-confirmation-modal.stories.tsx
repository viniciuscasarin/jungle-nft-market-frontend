import type { Meta, StoryObj } from '@storybook/react';
import { OrderConfirmationModal, DEFAULT_ORDER_CONFIRMATION } from './order-confirmation-modal';

const meta: Meta<typeof OrderConfirmationModal> = {
  title: 'Checkout/OrderConfirmationModal',
  component: OrderConfirmationModal,
  parameters: {
    layout: 'centered',
  },
  args: {
    isInline: true,
    isOpen: true,
    data: DEFAULT_ORDER_CONFIRMATION,
  },
};

export default meta;
type Story = StoryObj<typeof OrderConfirmationModal>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[600px] p-4 bg-surface-default">
      <OrderConfirmationModal {...args} />
    </div>
  ),
};

export const AsOverlayModal: Story = {
  args: {
    isInline: false,
    isOpen: true,
  },
};
