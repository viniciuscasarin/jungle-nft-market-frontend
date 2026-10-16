import type { IconProps } from './types';

export function IconSliders({ title, size, width = 20, height = 20, className, ...props }: IconProps) {
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
      <line x1="4" x2="4" y1="21" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="4" x2="4" y1="10" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="12" x2="12" y1="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="12" x2="12" y1="8" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="20" x2="20" y1="21" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="20" x2="20" y1="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="1" x2="7" y1="14" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="9" x2="15" y1="8" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="17" x2="23" y1="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
