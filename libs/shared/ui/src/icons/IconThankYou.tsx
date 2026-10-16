import type { IconProps } from './types';

export function IconThankYou({ title, size, width = 64, height = 64, className, ...props }: IconProps) {
  const isAriaHidden = !title;
  return (
    <svg
      width={size ?? width}
      height={size ?? height}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...(isAriaHidden ? { 'aria-hidden': 'true' } : { role: 'img' })}
      {...props}
    >
      {title && <title>{title}</title>}
      {/* Nota / Cartão com mensagem THANK YOU */}
      <rect
        x="15"
        y="6"
        width="34"
        height="32"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.08"
      />
      <text
        x="32"
        y="19"
        textAnchor="middle"
        fill="currentColor"
        fontSize="7"
        fontWeight="bold"
        fontFamily="monospace"
        letterSpacing="0.5"
      >
        THANK
      </text>
      <text
        x="32"
        y="29"
        textAnchor="middle"
        fill="currentColor"
        fontSize="7"
        fontWeight="bold"
        fontFamily="monospace"
        letterSpacing="0.5"
      >
        YOU
      </text>

      {/* Envelope dobrado */}
      <rect
        x="8"
        y="22"
        width="48"
        height="36"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.04"
      />
      {/* Linhas de dobra do envelope */}
      <path
        d="M8 24 L32 42 L56 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 56 L24 40"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M56 56 L40 40"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
