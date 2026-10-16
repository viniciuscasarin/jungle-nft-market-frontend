import type { IconProps } from './types';

export function IconAlertCircle({ title, size, width = 20, height = 20, className, ...props }: IconProps) {
  const isAriaHidden = !title;
  return (
    <svg
      width={size ?? width}
      height={size ?? height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...(isAriaHidden ? { 'aria-hidden': 'true' } : { role: 'img' })}
      {...props}
    >
      {title && <title>{title}</title>}
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><line x1="12" x2="12" y1="8" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="12" x2="12.01" y1="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
