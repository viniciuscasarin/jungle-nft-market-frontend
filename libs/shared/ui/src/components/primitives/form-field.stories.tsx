import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { FormField } from './form-field';
import { Input } from './input';

const meta: Meta<typeof FormField> = {
  title: 'Primitives/FormField',
  component: FormField,
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/dKMJKBVdX6q0Ym4OX5vd3V?node-id=I70492:696;70491:1283',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormField>;

export const Default: Story = {
  render: () => (
    <FormField label="E-mail" description="Usaremos seu e-mail para confirmação da compra.">
      <Input placeholder="seu@email.com" />
    </FormField>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('seu@email.com');
    await expect(input).toBeInTheDocument();
    await userEvent.type(input, 'collector@nft.market');
    await expect(input).toHaveValue('collector@nft.market');
  },
};

export const WithError: Story = {
  render: () => (
    <FormField label="Endereço ETH" error="Endereço de carteira inválido (deve iniciar com 0x)">
      <Input placeholder="0x..." aria-invalid="true" />
    </FormField>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const errorMsg = canvas.getByRole('alert');
    await expect(errorMsg).toBeInTheDocument();
    await expect(errorMsg).toHaveTextContent(/Endereço de carteira inválido/i);
  },
};

export const RequiredField: Story = {
  render: () => (
    <FormField label="Nome Completo" required>
      <Input placeholder="Seu nome" />
    </FormField>
  ),
};
