import * as React from 'react';
import { cn } from '../../index';
import { Label } from './label';
import { IconAlertCircle } from '../../icons/IconAlertCircle';

export interface FormFieldProps {
  id?: string | undefined;
  label?: string | undefined;
  required?: boolean | undefined;
  description?: React.ReactNode | undefined;
  error?: string | undefined;
  className?: string | undefined;
  children: React.ReactNode;
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ id, label, required = false, description, error, className, children }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

    // Clone child to inject accessibility props if valid React element
    let clonedChild = children;
    if (React.isValidElement(children)) {
      const childProps = children.props as Record<string, unknown>;
      const existingDescribedBy = childProps['aria-describedby'] as string | undefined;
      const combinedDescribedBy = [existingDescribedBy, describedBy].filter(Boolean).join(' ') || undefined;

      clonedChild = React.cloneElement(children, {
        id: childProps['id'] ?? inputId,
        'aria-describedby': combinedDescribedBy,
        'aria-invalid': error ? 'true' : childProps['aria-invalid'],
        'aria-required': required ? 'true' : childProps['aria-required'],
      } as React.HTMLAttributes<HTMLElement>);
    }

    return (
      <div ref={ref} className={cn('flex flex-col space-y-1.5 w-full font-mono', className)}>
        {label && (
          <Label htmlFor={inputId} required={required}>
            {label}
          </Label>
        )}

        {clonedChild}

        {description && (
          <p id={descriptionId} className="text-caption-12 text-text-secondary">
            {description}
          </p>
        )}

        {error && (
          <p id={errorId} role="alert" className="text-caption-12 text-feedback-error flex items-center gap-1 mt-0.5">
            <IconAlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
