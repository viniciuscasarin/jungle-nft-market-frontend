import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within, fn } from '@storybook/test';
import { SearchBar, MobileSearchBar } from './search-bar';

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
    onClear: fn(),
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

export const WithClearAction: Story = {
  args: {
    defaultValue: 'Monkey',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const clearBtn = canvas.getByRole('button', { name: 'Limpar busca' });
    await expect(clearBtn).toBeInTheDocument();
    await userEvent.click(clearBtn);
    await expect(args.onClear).toHaveBeenCalled();
  },
};

export const MobileVariant: Story = {
  render: (args) => <MobileSearchBar {...args} />,
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};
