import * as React from 'react';
import { cn } from '../../index';
import { IconUser } from '../../icons/IconUser';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | undefined;
  alt?: string | undefined;
  fallback?: string | undefined;
  size?: AvatarSize | undefined;
}

const sizeClasses: Record<AvatarSize, { container: string; text: string; icon: string }> = {
  sm: { container: 'h-8 w-8', text: 'text-caption-12', icon: 'h-4 w-4' },
  md: { container: 'h-10 w-10', text: 'text-body-14', icon: 'h-5 w-5' },
  lg: { container: 'h-14 w-14', text: 'text-title-20', icon: 'h-7 w-7' },
  xl: { container: 'h-20 w-20', text: 'text-heading-24', icon: 'h-10 w-10' },
};

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt = 'Avatar', fallback, size = 'md', className, ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false);
    const config = sizeClasses[size];

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center rounded-full border border-border-default bg-surface-raised font-mono overflow-hidden select-none',
          config.container,
          className
        )}
        {...props}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={alt}
            onError={() => setHasError(true)}
            className="h-full w-full object-cover"
          />
        ) : fallback ? (
          <span className={cn('font-bold text-text-primary uppercase', config.text)}>
            {fallback.slice(0, 2)}
          </span>
        ) : (
          <IconUser className={cn('text-text-muted', config.icon)} aria-hidden="true" />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
