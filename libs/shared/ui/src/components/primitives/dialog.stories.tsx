import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './dialog';
import { Button } from './button';

const meta: Meta<typeof Dialog> = {
  title: 'Primitives/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/dKMJKBVdX6q0Ym4OX5vd3V?node-id=70381:239',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="primary">Conectar Carteira</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Conectar Carteira Web3</DialogTitle>
          <DialogDescription>
            Selecione uma carteira simulada para autenticar e gerenciar seus NFTs no marketplace.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-body-14 text-text-secondary">
          Esta é uma demonstração simulada com MSW. Nenhuma chave privada é solicitada.
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button variant="primary">Continuar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Conectar Carteira/i });
    await expect(trigger).toBeInTheDocument();
    await userEvent.click(trigger);

    // Dialog is portaled to document body
    const body = within(document.body);
    const title = await body.findByText('Conectar Carteira Web3');
    await expect(title).toBeInTheDocument();

    const closeBtn = body.getByLabelText('Fechar diálogo');
    await userEvent.click(closeBtn);
  },
};
