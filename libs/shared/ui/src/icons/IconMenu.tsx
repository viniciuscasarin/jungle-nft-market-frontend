import type { IconProps } from './types';

export function IconMenu({ title, size, width = 24, height = 24, className, ...props }: IconProps) {
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
      <line x1="4" x2="20" y1="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="4" x2="20" y1="6" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="4" x2="20" y1="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
