import * as React from 'react';
import { cn } from '../../index';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ invalid = false, leftIcon, rightIcon, className, type = 'text', disabled, ...props }, ref) => {
    const isInvalid = invalid || props['aria-invalid'] === true || props['aria-invalid'] === 'true';

    return (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <span className="absolute left-3 flex items-center pointer-events-none text-text-muted">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          aria-invalid={isInvalid ? 'true' : undefined}
          className={cn(
            'w-full h-10 rounded-md font-mono text-body-14 text-text-primary placeholder:text-text-muted bg-surface-raised border transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-dark',
            isInvalid ? 'border-feedback-error' : 'border-border-default hover:border-border-soft',
            leftIcon ? 'pl-9' : 'px-3',
            rightIcon ? 'pr-9' : 'px-3',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 flex items-center pointer-events-none text-text-muted">
            {rightIcon}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
