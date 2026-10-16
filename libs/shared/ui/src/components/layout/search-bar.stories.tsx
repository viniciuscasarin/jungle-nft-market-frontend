import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within, fn } from '@storybook/test';
import { SearchBar } from './search-bar';

const meta: Meta<typeof SearchBar> = {
  title: 'Layout/SearchBar',
  component: SearchBar,
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/dKMJKBVdX6q0Ym4OX5vd3V?node-id=EL-15486c3a',
    },
  },
  args: {
    onSubmit: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('searchbox');
    await expect(input).toBeInTheDocument();
    await userEvent.type(input, 'Cyber Ape{enter}');
    await expect(args.onSubmit).toHaveBeenCalledWith('Cyber Ape');
  },
};
