import * as React from 'react';
import { cn } from '../../index';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
  'data-testid'?: string;
  ariaLabel?: string;
}

/**
 * Componente Breadcrumb padrão do design system KURIO (#10:244 e #11:1278).
 * Baseado no padrão visual oficial da PDP:
 * - Separador padrão: '/' em fonte mono
 * - Tipografia: 13px mono text-primary
 * - Links com transição suave para text-accent no hover
 * - Página ativa/atual em negrito
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator,
  className,
  'data-testid': testId,
  ariaLabel = 'Breadcrumb',
}) => {
  if (items.length === 0) return null;

  const defaultSeparator = (
    <span className="text-text-primary/70 select-none" aria-hidden="true">
      /
    </span>
  );

  return (
    <nav
      data-testid={testId}
      aria-label={ariaLabel}
      className={cn('flex items-center font-mono text-[13px] text-text-primary select-none', className)}
    >
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-bold text-text-primary truncate max-w-xs"
                >
                  {item.label}
                </span>
              ) : (
                <>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-text-primary hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs cursor-pointer"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-text-primary hover:text-accent cursor-pointer transition-colors">
                      {item.label}
                    </span>
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

