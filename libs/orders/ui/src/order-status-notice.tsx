import type * as React from 'react';

export interface OrderStatusNoticeProps {
  label: string;
  description: string;
  tone: 'neutral' | 'success' | 'danger';
  className?: string | undefined;
}

const toneClasses: Record<OrderStatusNoticeProps['tone'], string> = {
  neutral: 'border-border-default bg-surface-card text-text-primary',
  success: 'border-feedback-success bg-surface-card text-feedback-success',
  danger: 'border-feedback-error bg-surface-card text-feedback-error',
};

export const OrderStatusNotice: React.FC<OrderStatusNoticeProps> = ({
  label,
  description,
  tone,
  className = '',
}) => (
  <section role="status" className={`border p-4 ${toneClasses[tone]} ${className}`}>
    <h2 className="font-mono font-bold">{label}</h2>
    <p className="mt-1 text-body-14 text-text-secondary">{description}</p>
  </section>
);
