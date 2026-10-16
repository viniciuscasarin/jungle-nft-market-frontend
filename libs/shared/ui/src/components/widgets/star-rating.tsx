import * as React from 'react';
import { cn } from '../../index';
import { IconStar } from '../../icons/IconStar';
import { IconStarFilled } from '../../icons/IconStarFilled';
import { Tooltip } from '../primitives/tooltip';

export interface StarRatingProps {
  rating: number;
  maxStars?: number;
  reviewCount?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  tooltipText?: string;
}

const sizeClasses = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  reviewCount,
  showCount = true,
  size = 'md',
  className,
  tooltipText,
}) => {
  const roundedRating = Math.round(rating * 10) / 10;
  const fullStars = Math.floor(rating);

  const starElements = Array.from({ length: maxStars }, (_, index) => {
    const isFilled = index < fullStars;
    const starClass = cn(sizeClasses[size], 'text-accent shrink-0');

    return isFilled ? (
      <IconStarFilled key={index} className={starClass} aria-hidden="true" />
    ) : (
      <IconStar key={index} className={cn(starClass, 'text-text-muted opacity-40')} aria-hidden="true" />
    );
  });

  const ratingSummary = `${roundedRating.toFixed(1)} de ${maxStars} estrelas`;
  const defaultTooltip = reviewCount !== undefined
    ? `${ratingSummary} (${reviewCount} avaliações)`
    : ratingSummary;

  const content = (
    <div
      role="img"
      aria-label={defaultTooltip}
      className={cn('inline-flex items-center gap-1.5 font-mono select-none', className)}
    >
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {starElements}
      </div>

      <span className="text-caption-12 font-bold text-text-primary">
        {roundedRating.toFixed(1)}
      </span>

      {showCount && reviewCount !== undefined && (
        <span className="text-caption-12 text-text-muted">
          ({reviewCount})
        </span>
      )}
    </div>
  );

  return (
    <Tooltip content={tooltipText ?? defaultTooltip}>
      {content}
    </Tooltip>
  );
};

StarRating.displayName = 'StarRating';
