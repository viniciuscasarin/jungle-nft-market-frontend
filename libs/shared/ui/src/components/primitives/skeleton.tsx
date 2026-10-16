import * as React from 'react';
import { cn } from '../../index';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  ariaLabel?: string;
}

const roundedClasses: Record<string, string> = {
  xs: 'rounded-xs',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      width,
      height,
      rounded = 'md',
      ariaLabel = 'Carregando conteúdo...',
      className,
      style,
      ...props
    },
    ref
  ) => {
    const inlineStyle: React.CSSProperties = {
      ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
      ...(height !== undefined ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
      ...style,
    };

    return (
      <div
        ref={ref}
        role="status"
        aria-busy="true"
        aria-label={ariaLabel}
        style={inlineStyle}
        className={cn(
          'animate-pulse motion-reduce:animate-none bg-surface-raised border border-border-default select-none shrink-0',
          roundedClasses[rounded],
          className
        )}
        {...props}
      >
        <span className="sr-only">{ariaLabel}</span>
      </div>
    );
  }
);

Skeleton.displayName = 'Skeleton';
