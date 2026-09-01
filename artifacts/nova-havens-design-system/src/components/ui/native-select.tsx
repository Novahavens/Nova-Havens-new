import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Native selection keeps keyboard, screen-reader, and mobile-picker behavior
 * intact while matching the input treatment of the source form.
 */
const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.ComponentProps<'select'> & { placeholder?: string }
>(({ className, children, placeholder, ...props }, ref) => {
  const isPlaceholderSelected =
    placeholder !== undefined &&
    (props.value === '' || (props.value === undefined && !props.defaultValue));

  return (
    <div className="relative">
      <select
        ref={ref}
        data-placeholder={isPlaceholderSelected ? '' : undefined}
        className={cn(
          'flex h-9 w-full appearance-none items-center rounded-md border border-input bg-transparent px-3 py-1 pr-8 text-base shadow-sm ring-offset-background transition-colors',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'data-[placeholder]:text-muted-foreground',
          '[&>option]:bg-card [&>option]:text-foreground',
          className,
        )}
        {...props}
      >
        {placeholder !== undefined && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50"
      />
    </div>
  );
});
NativeSelect.displayName = 'NativeSelect';

export { NativeSelect };