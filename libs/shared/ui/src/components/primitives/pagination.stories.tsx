import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within, fn } from '@storybook/test';
import React, { useState } from 'react';
import { Pagination, type PaginationProps } from './pagination';

function PaginationDemo(props: PaginationProps) {
  const [page, setPage] = useState(3);
  const handlePageChange = (p: number) => {
    setPage(p);
    props.onPageChange(p);
  };
  return <Pagination currentPage={page} totalPages={10} onPageChange={handlePageChange} />;
}

const meta: Meta<typeof Pagination> = {
  title: 'Primitives/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  args: {
    onPageChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  render: (args) => <PaginationDemo {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page4Btn = canvas.getByRole('button', { name: 'Página 4' });
    await expect(page4Btn).toBeInTheDocument();
    await userEvent.click(page4Btn);
    await expect(args.onPageChange).toHaveBeenCalledWith(4);
  },
};
