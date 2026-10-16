import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within, fn } from '@storybook/test';
import { NftCard } from './nft-card';

const meta: Meta<typeof NftCard> = {
  title: 'Widgets/NftCard',
  component: NftCard,
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/dKMJKBVdX6q0Ym4OX5vd3V?node-id=4:406',
    },
  },
  args: {
    id: 'nft-1',
    title: 'Cyber Ape #3421',
    collectionName: 'Jungle Genesis',
    imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=500&q=80',
    priceEth: '1.25',
    edition: { current: 1, total: 100 },
    rarity: 'Lendário',
    isFavorite: false,
    onFavoriteToggle: fn(),
    onAddToCart: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof NftCard>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const favoriteBtn = canvas.getByRole('button', { name: /favoritos/i });
    await expect(favoriteBtn).toBeInTheDocument();
    await userEvent.click(favoriteBtn);
    await expect(args.onFavoriteToggle).toHaveBeenCalledWith('nft-1');

    const addBtn = canvas.getByRole('button', { name: /adicionar ao carrinho/i });
    await userEvent.click(addBtn);
    await expect(args.onAddToCart).toHaveBeenCalledWith('nft-1');
  },
};

export const PromotionalPrice: Story = {
  args: {
    priceEth: '0.85',
    previousPriceEth: '1.50',
    rarity: 'Raro',
    edition: { current: 15, total: 50 },
  },
};

export const Favorited: Story = {
  args: {
    isFavorite: true,
  },
};
