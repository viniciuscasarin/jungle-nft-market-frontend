import * as React from 'react';
import { cn } from '../../index';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs compound components must be rendered within a Tabs provider');
  }
  return context;
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      orientation = 'horizontal',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');
    const isControlled = value !== undefined;
    const activeValue = isControlled ? value : internalValue;

    const handleValueChange = React.useCallback(
      (newValue: string) => {
        if (!isControlled) {
          setInternalValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [isControlled, onValueChange]
    );

    return (
      <TabsContext.Provider value={{ value: activeValue, onValueChange: handleValueChange, orientation }}>
        <div
          ref={ref}
          className={cn('flex flex-col font-mono', orientation === 'vertical' && 'flex-row gap-4', className)}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = 'Tabs';

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  loop?: boolean;
}

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ loop = true, className, children, ...props }, ref) => {
    const { orientation } = useTabsContext();

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const tabs = Array.from(
        e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])')
      );
      const currentIndex = tabs.findIndex((tab) => tab === document.activeElement);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = currentIndex + 1;
        if (nextIndex >= tabs.length) {
          nextIndex = loop ? 0 : tabs.length - 1;
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = currentIndex - 1;
        if (nextIndex < 0) {
          nextIndex = loop ? tabs.length - 1 : 0;
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIndex = tabs.length - 1;
      }

      const targetTab = tabs[nextIndex];
      if (nextIndex !== currentIndex && targetTab) {
        targetTab.focus();
        targetTab.click();
      }
    };

    return (
      <div
        ref={ref}
        role="tablist"
        tabIndex={0}
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
        className={cn(
          'inline-flex items-center gap-1 rounded-md bg-surface-raised p-1 text-text-secondary border border-border-default select-none',
          orientation === 'vertical' && 'flex-col items-stretch',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsList.displayName = 'TabsList';

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, className, disabled, children, ...props }, ref) => {
    const { value: activeValue, onValueChange } = useTabsContext();
    const isSelected = activeValue === value;
    const tabId = `tab-${value}`;
    const panelId = `panel-${value}`;

    return (
      <button
        ref={ref}
        id={tabId}
        type="button"
        role="tab"
        aria-selected={isSelected}
        aria-controls={panelId}
        tabIndex={isSelected ? 0 : -1}
        disabled={disabled}
        onClick={() => onValueChange(value)}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-body-14 font-medium transition-all cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
          'disabled:pointer-events-none disabled:opacity-50',
          isSelected
            ? 'bg-surface-card text-text-primary shadow-xs border border-border-default'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-dark',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, className, children, ...props }, ref) => {
    const { value: activeValue } = useTabsContext();
    const isSelected = activeValue === value;
    const tabId = `tab-${value}`;
    const panelId = `panel-${value}`;

    if (!isSelected) return null;

    return (
      <div
        ref={ref}
        id={panelId}
        role="tabpanel"
        aria-labelledby={tabId}
        tabIndex={0}
        className={cn(
          'mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = 'TabsContent';
