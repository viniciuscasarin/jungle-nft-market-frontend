import type { IconProps } from './types';

export function IconCoinbase({ title, size, width = 32, height = 32, className, ...props }: IconProps) {
  const isAriaHidden = !title;
  return (
    <svg
      width={size ?? width}
      height={size ?? height}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...(isAriaHidden ? { 'aria-hidden': 'true' } : { role: 'img' })}
      {...props}
    >
      {title && <title>{title}</title>}
      <rect width="32" height="32" rx="16" fill="currentColor"/><rect x="12" y="12" width="8" height="8" rx="2" fill="currentColor"/>
    </svg>
  );
}
