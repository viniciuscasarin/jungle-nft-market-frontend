import type { IconProps } from './types';

export function IconGrid({ title, size, width = 20, height = 20, className, ...props }: IconProps) {
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
      <rect width="7" height="7" x="3" y="3" rx="1" stroke="currentColor" strokeWidth="2" fill="none" /><rect width="7" height="7" x="14" y="3" rx="1" stroke="currentColor" strokeWidth="2" fill="none" /><rect width="7" height="7" x="14" y="14" rx="1" stroke="currentColor" strokeWidth="2" fill="none" /><rect width="7" height="7" x="3" y="14" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}
