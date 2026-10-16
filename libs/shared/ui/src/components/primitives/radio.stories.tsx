import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Radio } from './radio';

const meta: Meta<typeof Radio> = {
  title: 'Primitives/Radio',
  component: Radio,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Radio name="option" value="eth" label="Pagamento em ETH" description="Transferência via carteira simulada" defaultChecked />
      <Radio name="option" value="usdc" label="Pagamento em USDC" description="Stablecoin pareada ao dólar" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const usdcRadio = canvas.getByRole('radio', { name: /Pagamento em USDC/i });
    await expect(usdcRadio).not.toBeChecked();
    await userEvent.click(usdcRadio);
    await expect(usdcRadio).toBeChecked();
  },
};
