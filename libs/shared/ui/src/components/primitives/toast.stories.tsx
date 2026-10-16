import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { ToastProvider, useToast } from './toast';
import { Button } from './button';

function ToastDemo() {
  const { addToast } = useToast();

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="primary"
        onClick={() =>
          addToast({
            title: 'Item adicionado!',
            description: 'Cyber Ape #3421 foi incluído no seu carrinho.',
            variant: 'success',
          })
        }
      >
        Disparar Toast Sucesso
      </Button>
      <Button
        variant="destructive"
        onClick={() =>
          addToast({
            title: 'Erro na transação',
            description: 'Saldo insuficiente para cobrir o valor total.',
            variant: 'error',
          })
        }
      >
        Disparar Toast Erro
      </Button>
    </div>
  );
}

const meta: Meta = {
  title: 'Primitives/Toast',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Disparar Toast Sucesso/i });
    await expect(trigger).toBeInTheDocument();
    await userEvent.click(trigger);

    // Toast is rendered in portal container
    const body = within(document.body);
    const toast = await body.findByText('Item adicionado!');
    await expect(toast).toBeInTheDocument();
  },
};
