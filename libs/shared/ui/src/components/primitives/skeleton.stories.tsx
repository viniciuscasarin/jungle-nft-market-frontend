import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Primitives/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    width: 280,
    height: 180,
    rounded: 'lg',
  },
};

export const NftCardSkeleton: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4 rounded-lg border border-border-default bg-surface-card max-w-[280px]">
      <Skeleton width="100%" height={240} rounded="lg" />
      <Skeleton width="60%" height={20} rounded="sm" />
      <Skeleton width="40%" height={16} rounded="sm" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton width="30%" height={16} rounded="sm" />
        <Skeleton width="40%" height={32} rounded="md" />
      </div>
    </div>
  ),
};
