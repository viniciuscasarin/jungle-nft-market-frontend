import type { IconProps } from './types';

export function IconWalletconnect({ title, size, width = 32, height = 32, className, ...props }: IconProps) {
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
      <path d="M7.18 10.95c4.87-4.77 12.77-4.77 17.64 0l.58.57a.62.62 0 010 .89l-2.01 1.97a.33.33 0 01-.46 0l-.82-.8a9.42 9.42 0 00-13.22 0l-.88.86a.33.33 0 01-.46 0L5.54 12.47a.62.62 0 010-.89l1.64-1.63zm20.89 3.19l1.79 1.76a.62.62 0 010 .89l-8.08 7.92a.66.66 0 01-.93 0L16 19.86a.17.17 0 00-.23 0l-4.85 4.75a.66.66 0 01-.93 0L2.14 16.7a.62.62 0 010-.89l1.79-1.76a.66.66 0 01.93 0l5.31 5.21a.17.17 0 00.23 0l4.85-4.75a.66.66 0 01.93 0l4.85 4.75a.17.17 0 00.23 0l5.31-5.21a.66.66 0 01.93 0z" fill="currentColor"/>
    </svg>
  );
}
