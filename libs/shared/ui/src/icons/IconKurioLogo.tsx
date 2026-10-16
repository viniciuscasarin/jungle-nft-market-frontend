import type { IconProps } from './types';

export function IconKurioLogo({ title, size, width = 120, height = 32, className, ...props }: IconProps) {
  const isAriaHidden = !title;
  return (
    <svg
      width={size ?? width}
      height={size ?? height}
      viewBox="0 0 120 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...(isAriaHidden ? { 'aria-hidden': 'true' } : { role: 'img' })}
      {...props}
    >
      {title && <title>{title}</title>}
      <text x="0" y="24" fontFamily="'Roboto Mono', monospace" fontSize="22" fontWeight="700" letterSpacing="3" fill="currentColor">KURIO</text>
    </svg>
  );
}
