import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { OrderConfirmationModal, DEFAULT_ORDER_CONFIRMATION } from './order-confirmation-modal';

const meta: Meta<typeof OrderConfirmationModal> = {
  title: 'Orders/OrderConfirmationModal',
  component: OrderConfirmationModal,
  tags: ['autodocs'],
  args: {
    isOpen: true,
    isInline: true,
    data: DEFAULT_ORDER_CONFIRMATION,
    onClose: fn(),
    onEtherscanClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof OrderConfirmationModal>;

export const Default: Story = {};

export const ModalOverlay: Story = {
  args: {
    isInline: false,
  },
};
