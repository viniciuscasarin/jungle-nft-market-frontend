import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { EditionChip } from './edition-chip';
import { StarRating } from './star-rating';
import { PriceRangeSlider } from './price-range-slider';
import { NftCard } from './nft-card';

describe('Catalog & Discovery Widgets', () => {
  describe('EditionChip', () => {
    it('renders zero-padded edition counter and accessible aria-label', () => {
      render(<EditionChip current={42} total={100} variant="accent" />);

      const chip = screen.getByLabelText('Edição 42 de 100');
      expect(chip).toBeInTheDocument();
      expect(chip).toHaveTextContent('#042/100');
      expect(chip.className).toContain('text-text-accent');
    });
  });

  describe('StarRating', () => {
    it('renders accessible rating with review count and tooltip summary', () => {
      render(<StarRating rating={4.8} maxStars={5} reviewCount={124} />);

      const ratingImg = screen.getByRole('img', {
        name: '4.8 de 5 estrelas (124 avaliações)',
      });
      expect(ratingImg).toBeInTheDocument();
      expect(screen.getByText('4.8')).toBeInTheDocument();
      expect(screen.getByText('(124)')).toBeInTheDocument();
    });
  });

  describe('PriceRangeSlider', () => {
    it('renders dual sliders and calls onChange with updated ranges', () => {
      const handleChange = vi.fn();
      render(
        <PriceRangeSlider
          min={0}
          max={10}
          step={0.5}
          value={[1.5, 7.0]}
          onChange={handleChange}
        />
      );

      expect(screen.getByText('1.50 - 7.00 ETH')).toBeInTheDocument();

      const minSlider = screen.getByRole('slider', { name: 'Preço mínimo' });
      const maxSlider = screen.getByRole('slider', { name: 'Preço máximo' });

      expect(minSlider).toHaveValue('1.5');
      expect(maxSlider).toHaveValue('7');

      fireEvent.change(minSlider, { target: { value: '2.5' } });
      expect(handleChange).toHaveBeenCalledWith([2.5, 7.0]);

      fireEvent.change(maxSlider, { target: { value: '8.5' } });
      expect(handleChange).toHaveBeenCalledWith([1.5, 8.5]);
    });
  });

  describe('NftCard', () => {
    it('renders basic NFT details with ETH price formatted as string', () => {
      render(
        <NftCard
          id="nft-1"
          title="Cyber Kong #100"
          collectionName="Genesis Kongz"
          imageUrl="https://example.com/kong.png"
          priceEth="2.45"
        />
      );

      expect(screen.getByText('Cyber Kong #100')).toBeInTheDocument();
      expect(screen.getByText('Genesis Kongz')).toBeInTheDocument();
      expect(screen.getByText(/2.45 ETH/)).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'Cyber Kong #100' })).toHaveAttribute(
        'src',
        'https://example.com/kong.png'
      );
    });

    it('renders strikethrough previous price when promotional price is distinct', () => {
      render(
        <NftCard
          id="nft-promo"
          title="Mutant Ape #42"
          imageUrl="https://example.com/ape.png"
          priceEth="1.85"
          previousPriceEth="2.50"
        />
      );

      const currentPrice = screen.getByText('1.85 ETH');
      expect(currentPrice.className).toContain('text-accent');

      const previousPrice = screen.getByText('2.50 ETH');
      expect(previousPrice.className).toContain('line-through');
      expect(previousPrice.className).toContain('text-text-muted');
    });

    it('renders rarity badge and edition chip', () => {
      render(
        <NftCard
          id="nft-rare"
          title="Legendary Droid"
          imageUrl="https://example.com/droid.png"
          priceEth="5.00"
          rarity="Legendary"
          edition={{ current: 1, total: 50 }}
        />
      );

      expect(screen.getByText('Legendary')).toBeInTheDocument();
      expect(screen.getByText('#1/50')).toBeInTheDocument();
    });

    it('triggers onFavoriteToggle and onAddToCart callbacks', () => {
      const handleFavorite = vi.fn();
      const handleCart = vi.fn();

      render(
        <NftCard
          id="nft-interactive"
          title="Interactive NFT"
          imageUrl="https://example.com/item.png"
          priceEth="0.50"
          onFavoriteToggle={handleFavorite}
          onAddToCart={handleCart}
        />
      );

      const favBtn = screen.getByRole('button', {
        name: 'Adicionar Interactive NFT aos favoritos',
      });
      fireEvent.click(favBtn);
      expect(handleFavorite).toHaveBeenCalledWith('nft-interactive');

      const cartBtn = screen.getByRole('button', {
        name: 'Adicionar Interactive NFT ao carrinho',
      });
      fireEvent.click(cartBtn);
      expect(handleCart).toHaveBeenCalledWith('nft-interactive');
    });
  });
});
