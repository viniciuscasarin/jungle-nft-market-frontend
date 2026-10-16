import * as React from 'react';
import { cn } from '../../index';
import { IconSearch } from '../../icons/IconSearch';
import { IconClose } from '../../icons/IconClose';

export interface SearchBarProps {
  value?: string | undefined;
  defaultValue?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
  onSubmit?: ((value: string) => void) | undefined;
  onClear?: (() => void) | undefined;
  placeholder?: string | undefined;
  className?: string | undefined;
  action?: string | undefined;
  name?: string | undefined;
  filterSlot?: React.ReactNode | undefined;
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value,
      defaultValue = '',
      onChange,
      onSubmit,
      onClear,
      placeholder = 'Buscar coleções, NFTs ou criadores...',
      className,
      action = '/',
      name = 'q',
      filterSlot,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const isControlled = value !== undefined;
    const query = isControlled ? value : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      if (!isControlled) {
        setInternalValue(next);
      }
      onChange?.(next);
    };

    const handleClear = () => {
      if (!isControlled) {
        setInternalValue('');
      }
      onChange?.('');
      onClear?.();
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      if (onSubmit) {
        e.preventDefault();
        onSubmit(query);
      }
    };

    return (
      <form
        role="search"
        action={action}
        method="GET"
        onSubmit={handleSubmit}
        className={cn('relative flex items-center w-full font-mono gap-2', className)}
      >
        <div className="relative flex-1 flex items-center">
          <span className="absolute left-3.5 flex items-center pointer-events-none text-text-muted">
            <IconSearch className="h-4 w-4" aria-hidden="true" />
          </span>

          <input
            ref={ref}
            type="search"
            name={name}
            value={query}
            onChange={handleChange}
            placeholder={placeholder}
            aria-label="Buscar NFTs"
            className={cn(
              'w-full h-10 pl-10 pr-9 rounded-md bg-surface-raised border border-border-default text-text-primary placeholder:text-text-muted text-body-14 transition-colors',
              'hover:border-border-soft',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
              '[&::-webkit-search-cancel-button]:appearance-none'
            )}
          />

          {query.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Limpar busca"
              className="absolute right-3 flex items-center text-text-muted hover:text-text-primary p-0.5 rounded-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink cursor-pointer"
            >
              <IconClose className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {filterSlot && (
          <div className="shrink-0 flex items-center">
            {filterSlot}
          </div>
        )}
      </form>
    );
  }
);

SearchBar.displayName = 'SearchBar';

export const MobileSearchBar: React.FC<SearchBarProps> = (props) => {
  return <SearchBar {...props} className={cn('h-11', props.className)} />;
};
MobileSearchBar.displayName = 'MobileSearchBar';
