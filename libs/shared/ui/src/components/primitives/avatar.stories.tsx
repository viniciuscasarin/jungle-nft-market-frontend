import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Primitives/Avatar',
  component: Avatar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    alt: 'Collector Profile',
    size: 'lg',
  },
};

export const WithFallback: Story = {
  args: {
    fallback: 'VC',
    size: 'lg',
  },
};

export const IconFallback: Story = {
  args: {
    size: 'lg',
  },
};
