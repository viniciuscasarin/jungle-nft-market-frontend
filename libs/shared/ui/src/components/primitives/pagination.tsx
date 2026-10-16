import * as React from 'react';
import { cn } from '../../index';
import { IconArrowRight2 } from '../../icons/IconArrowRight2';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}) => {
  if (totalPages <= 1) return null;

  const range = (start: number, end: number) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
  };

  const generatePagination = () => {
    const totalPageNumbers = siblingCount * 2 + 5; // siblings + first + last + current + 2 ellipses

    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, 'dots', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [1, 'dots', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [1, 'dots', ...middleRange, 'dots', totalPages];
    }

    return range(1, totalPages);
  };

  const pages = generatePagination();

  return (
    <nav aria-label="Paginação" className={cn('flex items-center justify-center gap-1 font-mono', className)}>
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Página anterior"
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-md border border-border-default bg-surface-raised text-text-secondary transition-colors cursor-pointer',
          'hover:text-text-primary hover:border-border-soft hover:bg-surface-dark',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
          'disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed'
        )}
      >
        <span className="rotate-180 inline-flex">
          <IconArrowRight2 className="h-4 w-4" aria-hidden="true" />
        </span>
      </button>

      {pages.map((page, index) => {
        if (page === 'dots') {
          return (
            <span
              key={`dots-${index}`}
              aria-hidden="true"
              className="flex h-10 w-8 items-center justify-center text-text-muted text-body-14 select-none"
            >
              ...
            </span>
          );
        }

        const pageNumber = page as number;
        const isCurrent = pageNumber === currentPage;

        return (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            aria-current={isCurrent ? 'page' : undefined}
            aria-label={`Página ${pageNumber}`}
            className={cn(
              'flex h-10 min-w-10 px-3 items-center justify-center rounded-md border font-medium text-body-14 transition-colors cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
              isCurrent
                ? 'border-primary bg-primary text-text-primary font-bold'
                : 'border-border-default bg-surface-raised text-text-secondary hover:text-text-primary hover:border-border-soft hover:bg-surface-dark'
            )}
          >
            {pageNumber}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Próxima página"
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-md border border-border-default bg-surface-raised text-text-secondary transition-colors cursor-pointer',
          'hover:text-text-primary hover:border-border-soft hover:bg-surface-dark',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
          'disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed'
        )}
      >
        <IconArrowRight2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
};

Pagination.displayName = 'Pagination';
