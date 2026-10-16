import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './alert';

const meta: Meta<typeof Alert> = {
  title: 'Primitives/Alert',
  component: Alert,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Informação',
    description: 'Os valores de taxa de gás são calculados automaticamente pela simulação.',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Transação Confirmada',
    description: 'Seu NFT foi adquirido com sucesso e transferido para a sua carteira.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Atenção ao Saldo',
    description: 'Saldo insuficiente para cobrir o valor total mais a taxa de gás estimada.',
  },
};

export const ErrorVariant: Story = {
  args: {
    variant: 'error',
    title: 'Falha no Pagamento',
    description: 'A transação foi rejeitada pela simulação da carteira.',
  },
};
