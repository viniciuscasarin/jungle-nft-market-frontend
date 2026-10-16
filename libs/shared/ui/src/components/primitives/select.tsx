import * as React from 'react';
import { cn } from '../../index';
import { IconArrowDown2 } from '../../icons/IconArrowDown2';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  invalid?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, placeholder, invalid = false, className, disabled, children, ...props }, ref) => {
    const isInvalid = invalid || props['aria-invalid'] === true || props['aria-invalid'] === 'true';

    return (
      <div className="relative flex items-center w-full">
        <select
          ref={ref}
          disabled={disabled}
          aria-invalid={isInvalid ? 'true' : undefined}
          className={cn(
            'w-full h-10 appearance-none rounded-md font-mono text-body-14 text-text-primary bg-surface-raised border pl-3 pr-10 transition-colors cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-dark',
            isInvalid ? 'border-feedback-error' : 'border-border-default hover:border-border-soft',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="bg-surface-raised text-text-muted">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className="bg-surface-raised text-text-primary"
            >
              {option.label}
            </option>
          ))}
          {children}
        </select>
        <span className="absolute right-3 flex items-center pointer-events-none text-text-muted">
          <IconArrowDown2 className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    );
  }
);

Select.displayName = 'Select';
