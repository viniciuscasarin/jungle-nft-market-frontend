import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './empty-state';
import { Button } from './button';

const meta: Meta<typeof EmptyState> = {
  title: 'Primitives/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    title: 'Nenhum NFT encontrado',
    description: 'Tente ajustar os filtros de busca ou redefinir a faixa de preço para ver outros resultados.',
    action: <Button variant="primary">Limpar Filtros</Button>,
  },
};

export const EmptyCart: Story = {
  args: {
    title: 'Seu carrinho está vazio',
    description: 'Explore o catálogo e adicione itens colecionáveis exclusivos ao seu carrinho.',
    action: <Button variant="primary">Explorar Catálogo</Button>,
  },
};
