import * as React from 'react';
import { cn } from '../../index';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const tooltipId = React.useId();

  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);
  const handleFocus = () => setIsOpen(true);
  const handleBlur = () => setIsOpen(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const sideClasses: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {React.isValidElement(children)
        ? React.cloneElement(children, {
            'aria-describedby': isOpen ? tooltipId : undefined,
            onFocus: (e: React.FocusEvent) => {
              (children.props as { onFocus?: (e: React.FocusEvent) => void }).onFocus?.(e);
              handleFocus();
            },
            onBlur: (e: React.FocusEvent) => {
              (children.props as { onBlur?: (e: React.FocusEvent) => void }).onBlur?.(e);
              handleBlur();
            },
            onKeyDown: (e: React.KeyboardEvent) => {
              (children.props as { onKeyDown?: (e: React.KeyboardEvent) => void }).onKeyDown?.(e);
              handleKeyDown(e);
            },
          } as React.HTMLAttributes<HTMLElement>)
        : children}

      {isOpen && (
        <div
          id={tooltipId}
          role="tooltip"
          className={cn(
            'absolute z-50 whitespace-nowrap rounded-sm bg-surface-raised border border-border-default px-2.5 py-1 font-mono text-caption-12 text-text-primary shadow-dropdown pointer-events-none transition-opacity duration-150 motion-reduce:transition-none',
            sideClasses[side],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};

Tooltip.displayName = 'Tooltip';
