import * as React from 'react';
import { cn } from '../../index';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  invalid?: boolean;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, invalid = false, className, id, disabled, checked, defaultChecked, onChange, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false);
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(e.target.checked);
      }
      onChange?.(e);
    };

    return (
      <div className={cn('flex items-start gap-2.5 font-mono select-none', className)}>
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            id={inputId}
            type="radio"
            checked={checked}
            defaultChecked={defaultChecked}
            disabled={disabled}
            onChange={handleChange}
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={inputId}
            className={cn(
              'h-5 w-5 rounded-full border transition-colors flex items-center justify-center cursor-pointer',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-ink',
              disabled && 'opacity-50 cursor-not-allowed',
              isChecked
                ? 'border-primary bg-surface-raised'
                : 'border-border-default bg-surface-raised hover:border-border-soft',
              invalid && !isChecked && 'border-feedback-error'
            )}
          >
            {isChecked && <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />}
          </label>
        </div>

        {(label || description) && (
          <div className="flex flex-col text-body-14">
            {label && (
              <label
                htmlFor={inputId}
                className={cn(
                  'font-medium text-text-primary cursor-pointer',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <span className="text-caption-12 text-text-secondary mt-0.5">
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';
