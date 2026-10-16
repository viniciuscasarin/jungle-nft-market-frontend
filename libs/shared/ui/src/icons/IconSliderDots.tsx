import type { IconProps } from './types';

export function IconSliderDots({ title, size, width = 40, height = 8, className, ...props }: IconProps) {
  const isAriaHidden = !title;
  return (
    <svg
      width={size ?? width}
      height={size ?? height}
      viewBox="0 0 40 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...(isAriaHidden ? { 'aria-hidden': 'true' } : { role: 'img' })}
      {...props}
    >
      {title && <title>{title}</title>}
      <circle cx="20" cy="4" r="4" fill="currentColor"/><circle cx="36" cy="4" r="4" fill="currentColor"/><circle cx="4" cy="4" r="4" fill="currentColor"/>
    </svg>
  );
}
