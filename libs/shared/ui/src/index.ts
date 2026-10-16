import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

export const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-tiny-9',
        'text-tiny-10',
        'text-caption-12',
        'text-caption-13',
        'text-body-14',
        'text-body-15',
        'text-body-large-16',
        'text-body-large-17',
        'text-body-large-18',
        'text-title-20',
        'text-heading-24',
        'text-heading-28',
        'text-display-43',
      ],
      'text-color': [
        'text-surface-default',
        'text-surface-card',
        'text-surface-raised',
        'text-surface-dark',
        'text-ink',
        'text-surface',
        'text-card',
        'text-raised',
        'text-primary',
        'text-primary-hover',
        'text-secondary',
        'text-muted',
        'text-accent',
        'text-coral',
        'text-success',
        'text-error',
        'text-text-primary',
        'text-text-secondary',
        'text-text-muted',
        'text-text-accent',
        'text-text-coral',
        'text-feedback-success',
        'text-feedback-error',
      ],
      'bg-color': [
        'bg-surface-default',
        'bg-surface-card',
        'bg-surface-raised',
        'bg-surface-dark',
        'bg-ink',
        'bg-surface',
        'bg-card',
        'bg-raised',
        'bg-primary',
        'bg-primary-hover',
        'bg-action-disabled',
        'bg-accent',
        'bg-feedback-success',
        'bg-feedback-error',
        'bg-success',
        'bg-error',
      ],
      'border-color': [
        'border-border-default',
        'border-border-soft',
        'border-border-accessible',
        'border-border',
        'border-primary',
        'border-accent',
        'border-feedback-success',
        'border-feedback-error',
      ],
      rounded: [
        'rounded-xs',
        'rounded-sm',
        'rounded-md',
        'rounded-lg',
        'rounded-xl',
        'rounded-mobile-frame',
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return customTwMerge(clsx(inputs));
}

export * from './icons';
export * from './components/primitives';
export * from './components/layout';
export * from './components/widgets';
