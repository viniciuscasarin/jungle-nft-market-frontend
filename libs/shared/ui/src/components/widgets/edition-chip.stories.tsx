import type { Meta, StoryObj } from '@storybook/react';
import { EditionChip } from './edition-chip';

const meta: Meta<typeof EditionChip> = {
  title: 'Widgets/EditionChip',
  component: EditionChip,
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/dKMJKBVdX6q0Ym4OX5vd3V?node-id=I70522:3240;70504:3015;70486:523',
    },
  },
};

export default meta;
type Story = StoryObj<typeof EditionChip>;

export const Default: Story = {
  args: {
    current: 42,
    total: 100,
  },
};

export const Accent: Story = {
  args: {
    current: 1,
    total: 10,
    variant: 'accent',
  },
};
