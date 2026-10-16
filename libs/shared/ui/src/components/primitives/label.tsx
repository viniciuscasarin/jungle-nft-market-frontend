import * as React from 'react';
import { cn } from '../../index';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ required = false, className, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 font-mono text-caption-12 font-medium text-text-primary select-none cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span className="text-feedback-error ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = 'Label';
