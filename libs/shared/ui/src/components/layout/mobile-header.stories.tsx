import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Menu, ShoppingCart, Filter, X } from 'lucide-react';
import { MobileHeader } from './mobile-header';

const meta: Meta<typeof MobileHeader> = {
  title: 'Layout/MobileHeader',
  component: MobileHeader,
  parameters: {
    layout: 'padded',
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        component:
          'Cabeçalho de navegação responsivo de 3 colunas para dispositivos móveis (visível em telas `< md`). Possui botão de voltar em bolinha 35x35px, título central com quebra de linha flexível e slot para ações na terceira coluna.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MobileHeader>;

/**
 * Padrão com botão de voltar, título e botão circular de menu.
 */
export const Default: Story = {
  args: {
    title: 'Dados do perfil',
    rightAction: (
      <button
        type="button"
        aria-label="Abrir menu"
        className="w-[35px] h-[35px] rounded-full bg-surface-card hover:bg-surface-raised flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
      >
        <Menu className="w-5 h-5" />
      </button>
    ),
  },
};

/**
 * Título longo com quebra de linha elegante ocupando o espaço central.
 */
export const LongTitle: Story = {
  args: {
    title: 'Histórico de Atividades e Transações Recentes',
    rightAction: (
      <button
        type="button"
        aria-label="Filtrar"
        className="w-[35px] h-[35px] rounded-full bg-surface-card hover:bg-surface-raised flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
      >
        <Filter className="w-4 h-4" />
      </button>
    ),
  },
};

/**
 * Variação para o Carrinho de NFTs com contador de itens na ação da direita.
 */
export const CartFlow: Story = {
  args: {
    title: 'Carrinho de NFTs',
    rightAction: (
      <div className="relative flex items-center justify-center w-[35px] h-[35px] rounded-full bg-surface-card text-text-secondary">
        <ShoppingCart className="w-4 h-4" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-ink">
          3
        </span>
      </div>
    ),
  },
};

/**
 * Variação com botão de fechar (X) na terceira coluna, ideal para modais ou etapas de checkout.
 */
export const WithCloseAction: Story = {
  args: {
    title: 'Confirmar Pedido',
    rightAction: (
      <button
        type="button"
        aria-label="Fechar"
        className="w-[35px] h-[35px] rounded-full bg-surface-card hover:bg-surface-raised flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    ),
  },
};

/**
 * Apenas título centralizado sem botão de voltar nem ação da direita.
 */
export const TitleOnly: Story = {
  args: {
    title: 'Minha Conta',
    showBackButton: false,
  },
};
