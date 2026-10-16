import * as React from 'react';
import { cn } from '../../index';
import { IconHeart } from '../../icons/IconHeart';
import { IconHeartFilled } from '../../icons/IconHeartFilled';
import { IconCart } from '../../icons/IconCart';
import { Badge } from '../primitives/badge';
import { Button } from '../primitives/button';
import { EditionChip } from './edition-chip';

export interface NftCardProps {
  id: string;
  title: string;
  collectionName?: string | undefined;
  imageUrl: string;
  priceEth: string;
  previousPriceEth?: string | undefined;
  rarity?: string | undefined;
  edition?: ({ current: number; total: number } | string) | undefined;
  isFavorite?: boolean | undefined;
  onFavoriteToggle?: ((id: string) => void) | undefined;
  onAddToCart?: ((id: string) => void) | undefined;
  href?: string | undefined;
  className?: string | undefined;
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

  const formattedPrice = priceEth.includes('ETH') ? priceEth : `${priceEth} ETH`;
  const formattedPreviousPrice = previousPriceEth
    ? previousPriceEth.includes('ETH')
      ? previousPriceEth
      : `${previousPriceEth} ETH`
    : undefined;

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
        'group flex flex-col font-mono text-left select-none transition-transform duration-150 hover:-translate-y-1',
        className
      )}
    >
      {/* Container de imagem igual ao carrossel da PDP: bg-surface-card py-[20px] px-[4px] rounded-[16px] border border-border-default/40 */}
      <div className="relative w-full bg-surface-card py-[20px] px-[4px] sm:px-[8px] flex items-center justify-center rounded-[16px] border border-border-default/40 group-hover:border-border-accessible/60 transition-colors">
        {/* Imagem 212x212 com bordas 13px */}
        <div className="relative w-[212px] h-[212px] max-w-full aspect-square flex items-center justify-center overflow-hidden rounded-[13px]">
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            draggable={false}
            className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none"
          />
        </div>

        {/* Badges no canto superior esquerdo da imagem */}
        {(rarity || edition) && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap pointer-events-none z-10">
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
        )}

        {/* Botão de Favorito no canto superior direito da imagem */}
        {onFavoriteToggle && (
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? `Remover ${title} dos favoritos` : `Adicionar ${title} aos favoritos`}
            className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-surface-card/80 backdrop-blur-xs border border-border-default text-text-primary hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink cursor-pointer"
          >
            {isFavorite ? (
              <IconHeartFilled className="h-4 w-4 text-feedback-error" aria-hidden="true" />
            ) : (
              <IconHeart className="h-4 w-4 text-text-muted hover:text-text-primary" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {/* Coleção (se informada) */}
      {collectionName && (
        <span className="mt-2 text-tiny-10 text-text-muted truncate block uppercase tracking-wide">
          {collectionName}
        </span>
      )}

      {/* Nome do item (igual ao carrossel da PDP) */}
      <span
        className="mt-[10px] text-[15px] text-text-primary truncate block font-medium group-hover:text-accent transition-colors"
        title={title}
      >
        {title}
      </span>

      {/* Preço do item com suporte a desconto e botão de carrinho */}
      <div className="mt-0.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[16px] font-bold text-accent block">
            {formattedPrice}
          </span>
          {hasDiscount && (
            <span className="text-[14px] line-through text-text-muted ml-1">
              {formattedPreviousPrice}
            </span>
          )}
        </div>

        {onAddToCart && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddToCartClick}
            aria-label={`Adicionar ${title} ao carrinho`}
            className="h-7 w-7 p-0 flex items-center justify-center text-caption-12 rounded-md"
          >
            <IconCart className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-[16px]"
      >
        {cardContent}
      </a>
    );
  }

  return cardContent;
};

NftCard.displayName = 'NftCard';
