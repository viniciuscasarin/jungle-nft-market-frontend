import type { Meta, StoryObj } from '@storybook/react';
import { StarRating } from './star-rating';

const meta: Meta<typeof StarRating> = {
  title: 'Widgets/StarRating',
  component: StarRating,
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/dKMJKBVdX6q0Ym4OX5vd3V?node-id=2:2',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StarRating>;

export const Default: Story = {
  args: {
    rating: 4.8,
    reviewCount: 142,
  },
};

export const PerfectScore: Story = {
  args: {
    rating: 5.0,
    reviewCount: 38,
  },
};
