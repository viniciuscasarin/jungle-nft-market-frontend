import * as React from 'react';

export interface ShellPageChromeValue {
  breadcrumbLabel: string | null;
  filtersHandler: (() => void) | null;
  setBreadcrumbLabel: (label: string | null) => void;
  setFiltersHandler: (fn: (() => void) | null) => void;
}

export const SHELL_PAGE_CHROME_KEY = Symbol.for('nft.shell.page-chrome');

type PageChromeHolder = {
  [SHELL_PAGE_CHROME_KEY]?: React.Context<ShellPageChromeValue | null>;
};

const chromeHolder = globalThis as unknown as PageChromeHolder;

export const ShellPageChromeContext: React.Context<ShellPageChromeValue | null> =
  chromeHolder[SHELL_PAGE_CHROME_KEY] ??
  (chromeHolder[SHELL_PAGE_CHROME_KEY] = React.createContext<ShellPageChromeValue | null>(null));

export function ShellPageChromeProvider({ children }: { children: React.ReactNode }) {
  const [breadcrumbLabel, setBreadcrumbLabel] = React.useState<string | null>(null);
  const [filtersHandler, setRawFiltersHandler] = React.useState<(() => void) | null>(null);

  const setFiltersHandler = React.useCallback((fn: (() => void) | null) => {
    setRawFiltersHandler(() => fn);
  }, []);

  const value = React.useMemo<ShellPageChromeValue>(
    () => ({
      breadcrumbLabel,
      filtersHandler,
      setBreadcrumbLabel,
      setFiltersHandler,
    }),
    [breadcrumbLabel, filtersHandler, setFiltersHandler]
  );

  return (
    <ShellPageChromeContext.Provider value={value}>
      {children}
    </ShellPageChromeContext.Provider>
  );
}

export interface UsePageChromeOptions {
  breadcrumbLabel?: string | null | undefined;
  onOpenFilters?: (() => void) | null | undefined;
}

export function usePageChrome(options?: UsePageChromeOptions): ShellPageChromeValue {
  const context = React.useContext(ShellPageChromeContext);
  if (!context) {
    throw new Error('usePageChrome must be used within a ShellPageChromeProvider');
  }

  const { setBreadcrumbLabel, setFiltersHandler } = context;

  React.useEffect(() => {
    if (options?.breadcrumbLabel !== undefined && options.breadcrumbLabel !== null) {
      setBreadcrumbLabel(options.breadcrumbLabel);
      return () => {
        setBreadcrumbLabel(null);
      };
    }
    return undefined;
  }, [options?.breadcrumbLabel, setBreadcrumbLabel]);

  React.useEffect(() => {
    if (options?.onOpenFilters !== undefined && options.onOpenFilters !== null) {
      setFiltersHandler(options.onOpenFilters);
      return () => {
        setFiltersHandler(null);
      };
    }
    return undefined;
  }, [options?.onOpenFilters, setFiltersHandler]);

  return context;
}
