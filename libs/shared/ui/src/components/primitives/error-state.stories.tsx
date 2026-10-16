import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within, fn } from '@storybook/test';
import { ErrorState } from './error-state';

const meta: Meta<typeof ErrorState> = {
  title: 'Primitives/ErrorState',
  component: ErrorState,
  tags: ['autodocs'],
  args: {
    title: 'Falha ao carregar catálogo',
    description: 'Não foi possível carregar os NFTs devido a uma instabilidade de rede simulada.',
    onRetry: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ErrorState>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const retryBtn = canvas.getByRole('button', { name: /Tentar novamente/i });
    await expect(retryBtn).toBeInTheDocument();
    await userEvent.click(retryBtn);
    await expect(args.onRetry).toHaveBeenCalled();
  },
};

export const Retrying: Story = {
  args: {
    isRetrying: true,
  },
};
