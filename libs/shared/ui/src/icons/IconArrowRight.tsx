import type { IconProps } from './types';

export function IconArrowRight({ title, size, width = 18, height = 18, className, ...props }: IconProps) {
  const isAriaHidden = !title;
  return (
    <svg
      width={size ?? width}
      height={size ?? height}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...(isAriaHidden ? { 'aria-hidden': 'true' } : { role: 'img' })}
      {...props}
    >
      {title && <title>{title}</title>}
      <path d="M14.8126 8.79443H3.56256" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M10.2748 4.27599C10.2748 4.27599 14.8123 6.72174 14.8123 8.79324C14.8123 10.8662 10.2748 13.3127 10.2748 13.3127" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
