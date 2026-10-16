import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { CartRecommendedCarousel } from './cart-recommended-carousel';
import type { NftCarouselItem } from '@nft/shared-ui';

const mockRecommendedItems: NftCarouselItem[] = [
  {
    id: 'cosmic-bloom-118',
    name: 'Cosmic Bloom #118',
    imageUrl: '/assets/images/nft-05-cosmic-bloom.png',
    price: '0.89 ETH',
  },
  {
    id: 'golden-beat-207',
    name: 'Golden Beat #207',
    imageUrl: '/assets/images/nft-06-golden-beat.png',
    price: '1.39 ETH',
  },
  {
    id: 'violet-nomad-314',
    name: 'Violet Nomad #314',
    imageUrl: '/assets/images/nft-07-violet-nomad.png',
    price: '1.39 ETH',
  },
];

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
      <CartRecommendedCarousel items={mockRecommendedItems} onSelectItem={(item) => alert(item.name)} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Colecionadores também viram')).toBeInTheDocument();
    await expect(canvas.getByText('Cosmic Bloom #118')).toBeInTheDocument();
    await expect(canvas.getByText('Golden Beat #207')).toBeInTheDocument();
  },
};
