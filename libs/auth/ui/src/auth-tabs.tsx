import * as React from 'react';
import { cn } from '@nft/shared-ui';

export interface AuthTabsProps {
  /**
   * Identifies which tab is currently active.
   */
  activeTab: 'login' | 'register';
  /**
   * Safe redirect target query to preserve across tab navigation.
   */
  redirect?: string | null | undefined;
  /**
   * Optional custom link renderer (e.g. for TanStack Router Link component).
   */
  renderLink?: ((props: {
    to: string;
    active: boolean;
    children: React.ReactNode;
    className: string;
    'aria-current'?: 'page' | undefined;
  }) => React.ReactNode) | undefined;
  /**
   * Optional CSS class name for outer navigation container.
   */
  className?: string | undefined;
}

export const AuthTabs: React.FC<AuthTabsProps> = ({
  activeTab,
  redirect,
  renderLink,
  className,
}) => {
  const loginHref = redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login';
  const registerHref = redirect ? `/cadastro?redirect=${encodeURIComponent(redirect)}` : '/cadastro';

  const tabBaseClasses =
    'flex-1 py-3 px-4 text-center text-body-14 font-medium transition-colors border-b-2 -mb-px select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink cursor-pointer';
  const activeClasses = 'border-primary text-text-primary font-bold';
  const inactiveClasses =
    'border-transparent text-text-secondary hover:text-text-primary hover:border-border-soft';

  const tabs = [
    {
      id: 'login' as const,
      label: 'Entrar',
      to: loginHref,
      isActive: activeTab === 'login',
    },
    {
      id: 'register' as const,
      label: 'Criar conta',
      to: registerHref,
      isActive: activeTab === 'register',
    },
  ];

  return (
    <nav
      aria-label="Abas de autenticação"
      className={cn('flex border-b border-border-default mb-6 font-mono w-full', className)}
    >
      {tabs.map((tab) => {
        const itemClass = cn(tabBaseClasses, tab.isActive ? activeClasses : inactiveClasses);

        if (renderLink) {
          return (
            <React.Fragment key={tab.id}>
              {renderLink({
                to: tab.to,
                active: tab.isActive,
                children: tab.label,
                className: itemClass,
                'aria-current': tab.isActive ? 'page' : undefined,
              })}
            </React.Fragment>
          );
        }

        return (
          <a
            key={tab.id}
            href={tab.to}
            aria-current={tab.isActive ? 'page' : undefined}
            className={itemClass}
          >
            {tab.label}
          </a>
        );
      })}
    </nav>
  );
};

AuthTabs.displayName = 'AuthTabs';
