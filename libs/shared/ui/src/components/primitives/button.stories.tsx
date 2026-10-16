import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within, fn } from '@storybook/test';
import { Button } from './button';
import { IconCart } from '../../icons';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/dKMJKBVdX6q0Ym4OX5vd3V?node-id=3:127',
    },
  },
  args: {
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Comprar Agora',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /Comprar Agora/i });
    await expect(button).toBeInTheDocument();
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalled();
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Ver Coleção',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Cancelar',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Limpar Filtros',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Remover Item',
  },
};

export const WithIcon: Story = {
  args: {
    variant: 'primary',
    leftIcon: <IconCart className="w-4 h-4" />,
    children: 'Adicionar ao Carrinho',
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
    loadingLabel: 'Processando pedido...',
    children: 'Confirmar Pagamento',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Indisponível',
  },
};
