import * as React from 'react';
import { cn } from '../../index';
import { IconEthereum } from '../../icons/IconEthereum';
import { IconHeart } from '../../icons/IconHeart';
import { IconHeartFilled } from '../../icons/IconHeartFilled';
import { IconCart } from '../../icons/IconCart';
import { Badge } from '../primitives/badge';
import { Button } from '../primitives/button';
import { EditionChip } from './edition-chip';

export interface NftCardProps {
  id: string;
  title: string;
  collectionName?: string;
  imageUrl: string;
  priceEth: string;
  previousPriceEth?: string;
  rarity?: string;
  edition?: { current: number; total: number } | string;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string) => void;
  onAddToCart?: (id: string) => void;
  href?: string;
  className?: string;
}

export const NftCard: React.FC<NftCardProps> = ({
  id,
  title,
  collectionName,
  imageUrl,
  priceEth,
  previousPriceEth,
  rarity,
  edition,
  isFavorite = false,
  onFavoriteToggle,
  onAddToCart,
  href,
  className,
}) => {
  const hasDiscount = Boolean(previousPriceEth && previousPriceEth !== priceEth);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.(id);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(id);
  };

  const cardContent = (
    <div
      className={cn(
        'group relative flex flex-col rounded-lg border border-border-default bg-surface-card overflow-hidden font-mono shadow-card transition-all duration-200',
        'hover:border-border-accessible hover:shadow-dropdown',
        className
      )}
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-surface-raised">
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none"
        />

        {/* Top Badges overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            {rarity && (
              <Badge variant="rarity" size="sm">
                {rarity}
              </Badge>
            )}
            {edition && typeof edition === 'object' && (
              <EditionChip current={edition.current} total={edition.total} variant="accent" />
            )}
            {edition && typeof edition === 'string' && (
              <Badge variant="edition" size="sm">
                {edition}
              </Badge>
            )}
          </div>

          {/* Favorite Toggle Button */}
          {onFavoriteToggle && (
            <button
              type="button"
              onClick={handleFavoriteClick}
              aria-label={isFavorite ? `Remover ${title} dos favoritos` : `Adicionar ${title} aos favoritos`}
              className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-surface-card/80 backdrop-blur-xs border border-border-default text-text-primary hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink cursor-pointer"
            >
              {isFavorite ? (
                <IconHeartFilled className="h-4 w-4 text-feedback-error" aria-hidden="true" />
              ) : (
                <IconHeart className="h-4 w-4 text-text-muted hover:text-text-primary" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Details Container */}
      <div className="flex flex-col p-4 flex-1 justify-between gap-3">
        <div>
          {collectionName && (
            <p className="text-tiny-10 text-text-secondary truncate uppercase tracking-wide">
              {collectionName}
            </p>
          )}
          <h4 className="text-body-14 font-bold text-text-primary truncate mt-0.5 group-hover:text-primary transition-colors">
            {title}
          </h4>
        </div>

        {/* Price & Action Row */}
        <div className="flex items-end justify-between gap-2 pt-2 border-t border-border-default/60">
          <div className="flex flex-col">
            <span className="text-tiny-10 text-text-muted">Preço</span>
            <div className="flex items-center gap-1">
              <IconEthereum className="h-4 w-4 text-text-primary shrink-0" aria-hidden="true" />
              <span className="text-body-14 font-bold text-accent">
                {priceEth} ETH
              </span>
              {hasDiscount && (
                <span className="text-caption-12 line-through text-text-muted ml-1">
                  {previousPriceEth} ETH
                </span>
              )}
            </div>
          </div>

          {/* Quick Add to Cart CTA */}
          {onAddToCart && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddToCartClick}
              aria-label={`Adicionar ${title} ao carrinho`}
              className="h-8 px-2.5 text-caption-12"
            >
              <IconCart className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-lg"
      >
        {cardContent}
      </a>
    );
  }

  return cardContent;
};

NftCard.displayName = 'NftCard';
