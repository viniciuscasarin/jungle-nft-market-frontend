import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within, fn } from '@storybook/test';
import { ModalLayout } from './modal-layout';
import { Button } from '../primitives/button';
import { FormField } from '../primitives/form-field';
import { Input } from '../primitives/input';

const meta: Meta<typeof ModalLayout> = {
  title: 'Widgets/ModalLayout',
  component: ModalLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/dKMJKBVdX6q0Ym4OX5vd3V?node-id=70381:239',
    },
  },
  args: {
    onClose: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ModalLayout>;

export const LoginModal: Story = {
  args: {
    title: 'Acesse sua Conta',
    subtitle: 'Informe suas credenciais simuladas para entrar no marketplace.',
    children: (
      <div className="flex flex-col gap-4">
        <FormField label="E-mail">
          <Input placeholder="usuario@exemplo.com" />
        </FormField>
        <FormField label="Senha">
          <Input type="password" placeholder="••••••••" />
        </FormField>
        <Button variant="primary" className="w-full mt-2">
          Entrar
        </Button>
      </div>
    ),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const closeBtn = canvas.getByLabelText('Fechar janela');
    await expect(closeBtn).toBeInTheDocument();
    await userEvent.click(closeBtn);
    await expect(args.onClose).toHaveBeenCalled();
  },
};
