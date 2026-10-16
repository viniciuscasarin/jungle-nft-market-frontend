import type { IconProps } from './types';

export function IconArrowDown2({ title, size, width = 16, height = 16, className, ...props }: IconProps) {
  const isAriaHidden = !title;
  return (
    <svg
      width={size ?? width}
      height={size ?? height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...(isAriaHidden ? { 'aria-hidden': 'true' } : { role: 'img' })}
      {...props}
    >
      {title && <title>{title}</title>}
      <path d="M12.6667 5.66669L8.00004 10.3334L3.33337 5.66669" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
