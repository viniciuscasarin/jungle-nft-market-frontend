import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './tooltip';
import { Button } from './button';

const meta: Meta<typeof Tooltip> = {
  title: 'Primitives/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <div className="p-12 flex justify-center">
      <Tooltip content="Endereço de contrato verificado na rede Ethereum">
        <Button variant="outline" size="sm">Contrato Verificado</Button>
      </Tooltip>
    </div>
  ),
};
