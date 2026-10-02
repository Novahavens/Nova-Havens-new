import type { ComponentProps } from 'react';

import { EXTERNAL_LINK_PROPS, INTAKE_FORMS } from '@/config/site';
import { cn } from '@/lib/utils';
import { TrackedAnchor } from './tracked-link';

const BASE =
  'inline-flex items-center justify-center whitespace-nowrap font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-full';

const VARIANTS = {
  primary: 'bg-primary text-primary-foreground hover:brightness-105',
  outline: 'border border-primary text-primary hover:bg-primary/10',
} as const;

const SIZES = {
  sm: 'text-sm px-7 py-3',
  md: 'text-sm px-8 py-3.5',
  lg: 'text-base px-8 py-4',
} as const;

type IntakeCtaProps = {
  form: keyof Pick<typeof INTAKE_FORMS, 'housing' | 'property'>;
  /** `{page}_{section}` for the analytics event. */
  location: string;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  className?: string;
  children: React.ReactNode;
} & Omit<ComponentProps<'a'>, 'href' | 'children'>;

/** Call-to-action linking to a hosted Jotform intake form, with analytics. */
export function IntakeCta({
  form,
  location,
  variant = 'primary',
  size = 'lg',
  className,
  children,
  ...rest
}: IntakeCtaProps) {
  return (
    <TrackedAnchor
      href={INTAKE_FORMS[form]}
      {...EXTERNAL_LINK_PROPS}
      event="intake_form_click"
      data={{ form, location }}
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...rest}
    >
      {children}
    </TrackedAnchor>
  );
}

export const ctaClasses = (variant: keyof typeof VARIANTS = 'primary', size: keyof typeof SIZES = 'lg') =>
  cn(BASE, VARIANTS[variant], SIZES[size]);
