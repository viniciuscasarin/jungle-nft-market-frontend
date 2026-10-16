import * as React from 'react';
import { cn } from '../../index';
import { IconFacebook } from '../../icons/IconFacebook';
import { IconTwitter } from '../../icons/IconTwitter';
import { IconDiscord } from '../../icons/IconDiscord';

export type SocialProvider = 'google' | 'facebook' | 'twitter' | 'discord' | 'apple';

export interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: SocialProvider;
  label?: string;
  noticeText?: string;
  onNotice?: (message: string) => void;
  onUnavailable?: (feature?: string) => void;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  label,
  noticeText = 'Autenticação social indisponível nesta demonstração.',
  onNotice,
  onUnavailable,
  className,
  ...props
}) => {
  const providerNames: Record<SocialProvider, string> = {
    google: 'Google',
    facebook: 'Facebook',
    twitter: 'Twitter / X',
    discord: 'Discord',
    apple: 'Apple',
  };

  const providerIcons: Record<SocialProvider, React.ReactNode> = {
    facebook: <IconFacebook className="h-5 w-5" aria-hidden="true" />,
    twitter: <IconTwitter className="h-5 w-5" aria-hidden="true" />,
    discord: <IconDiscord className="h-5 w-5" aria-hidden="true" />,
    google: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
      </svg>
    ),
    apple: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.3c.61-.75 1.04-1.8 0.92-2.85-.92.04-2.02.62-2.67 1.38-.56.66-.99 1.72-.88 2.76 1.02.08 2.04-.54 2.63-1.29z" />
      </svg>
    ),
  };

  const defaultLabel = `Continuar com ${providerNames[provider]}`;
  const displayLabel = label ?? defaultLabel;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onUnavailable?.(displayLabel);
    onNotice?.(noticeText);
    props.onClick?.(e);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full font-mono">
      <button
        type="button"
        onClick={handleClick}
        aria-label={displayLabel}
        className={cn(
          'relative flex items-center justify-center gap-3 w-full h-11 px-4 rounded-md border border-border-default bg-surface-raised font-medium text-body-14 text-text-primary transition-colors cursor-pointer',
          'hover:bg-surface-dark hover:border-border-soft',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
          className
        )}
        {...props}
      >
        <span className="shrink-0 text-text-primary">{providerIcons[provider]}</span>
        <span>{displayLabel}</span>
      </button>
    </div>
  );
};

SocialButton.displayName = 'SocialButton';
