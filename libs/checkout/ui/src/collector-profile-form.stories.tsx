import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { CollectorProfileForm } from './collector-profile-form';

const meta: Meta<typeof CollectorProfileForm> = {
  title: 'Checkout/CollectorProfileForm',
  component: CollectorProfileForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof CollectorProfileForm>;

export const Default: Story = {
  render: () => (
    <div className="max-w-[700px] p-6 bg-surface-default text-text-primary">
      <CollectorProfileForm />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Perfil do colecionador')).toBeInTheDocument();
    await expect(canvas.getByLabelText(/Nome de exibição/)).toBeInTheDocument();
    await expect(canvas.getByLabelText(/Nome de usuário/)).toBeInTheDocument();
    await expect(canvas.getByLabelText(/Rede/)).toBeInTheDocument();
    await expect(canvas.getByLabelText(/Endereço da carteira/)).toBeInTheDocument();
    await expect(canvas.getByText('Usar outra carteira?')).toBeInTheDocument();
  },
};
