import * as React from 'react';
import { cn } from '../../index';
import { IconArrowRight2 } from '../../icons/IconArrowRight2';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator,
  className,
}) => {
  if (items.length === 0) return null;

  const defaultSeparator = (
    <IconArrowRight2 className="h-3 w-3 text-text-muted shrink-0" aria-hidden="true" />
  );

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center font-mono text-caption-12', className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-medium text-text-primary truncate max-w-xs"
                >
                  {item.label}
                </span>
              ) : (
                <>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-text-secondary">{item.label}</span>
                  )}
                  <span aria-hidden="true" className="flex items-center">
                    {separator ?? defaultSeparator}
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

Breadcrumb.displayName = 'Breadcrumb';
