import type { IconProps } from './types';

export function IconYoutube({ title, size, width = 16, height = 16, className, ...props }: IconProps) {
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
      <path
        d="M15.54 4.37a2 2 0 0 0-1.41-1.42C12.88 2.67 8 2.67 8 2.67s-4.88 0-6.13.28A2 2 0 0 0 .46 4.37 20.9 20.9 0 0 0 .17 8c0 1.22.1 2.44.29 3.63a2 2 0 0 0 1.41 1.42c1.25.28 6.13.28 6.13.28s4.88 0 6.13-.28a2 2 0 0 0 1.41-1.42c.19-1.19.29-2.41.29-3.63 0-1.22-.1-2.44-.29-3.63zM6.4 10.33V5.67L10.47 8 6.4 10.33z"
        fill="currentColor"
      />
    </svg>
  );
}
