import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { CartRecommendedCarousel } from './cart-recommended-carousel';

const meta: Meta<typeof CartRecommendedCarousel> = {
  title: 'Cart/CartRecommendedCarousel',
  component: CartRecommendedCarousel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof CartRecommendedCarousel>;

export const Default: Story = {
  render: () => (
    <div className="max-w-[1200px] p-6 bg-surface-default text-text-primary">
      <CartRecommendedCarousel onSelectItem={(item) => alert(item.name)} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Colecionadores também viram')).toBeInTheDocument();
    await expect(canvas.getByText('Cosmic Bloom #118')).toBeInTheDocument();
    await expect(canvas.getByText('Golden Beat #207')).toBeInTheDocument();
  },
};
