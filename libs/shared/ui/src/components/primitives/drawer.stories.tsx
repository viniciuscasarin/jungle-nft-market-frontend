import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from './drawer';
import { Button } from './button';

const meta: Meta<typeof Drawer> = {
  title: 'Primitives/Drawer',
  component: Drawer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="primary">Abrir Carrinho (Drawer)</Button>
      </DrawerTrigger>
      <DrawerContent side="right">
        <DrawerHeader>
          <DrawerTitle>Seu Carrinho</DrawerTitle>
          <DrawerDescription>Revise seus itens antes de prosseguir para o checkout.</DrawerDescription>
        </DrawerHeader>
        <div className="py-6 text-body-14 text-text-secondary">
          2 itens adicionados ao carrinho de compras.
        </div>
        <DrawerFooter>
          <Button variant="primary">Finalizar Compra</Button>
          <DrawerClose asChild>
            <Button variant="outline">Continuar Comprando</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Abrir Carrinho/i });
    await expect(trigger).toBeInTheDocument();
    await userEvent.click(trigger);

    const body = within(document.body);
    const title = await body.findByText('Seu Carrinho');
    await expect(title).toBeInTheDocument();

    const closeBtn = body.getByLabelText('Fechar painel');
    await userEvent.click(closeBtn);
  },
};
