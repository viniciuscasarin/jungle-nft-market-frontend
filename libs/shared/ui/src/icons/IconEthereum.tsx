import type { IconProps } from './types';

export function IconEthereum({ title, size, width = 32, height = 32, className, ...props }: IconProps) {
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
      <path d="M16 2.5L7.5 16.5l8.5 5 8.5-5L16 2.5z" fill="currentColor" fillOpacity="0.8"/><path d="M16 2.5v19l8.5-5L16 2.5z" fill="currentColor"/><path d="M16 23.2l-8.5-4.9 8.5 12.2 8.5-12.2-8.5 4.9z" fill="currentColor" fillOpacity="0.8"/><path d="M16 23.2v12.2l8.5-12.2L16 23.2z" fill="currentColor"/>
    </svg>
  );
}
