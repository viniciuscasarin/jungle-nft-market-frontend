import type { IconProps } from './types';

export function IconCheck({ title, size, width = 16, height = 16, className, ...props }: IconProps) {
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
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
