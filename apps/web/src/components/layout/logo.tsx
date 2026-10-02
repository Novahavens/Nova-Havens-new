import Link from 'next/link';

/**
 * Wordmark. Swap for an <Image> of /brand/logo-horizontal-dark.svg once the
 * final brand asset lands (see public/brand/README.md).
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`text-xl md:text-2xl tracking-tight no-underline ${className}`}
      aria-label="Nova Havens home"
      data-testid="link-logo"
    >
      <span className="font-extrabold text-foreground">Nova</span>
      <span className="font-extrabold text-primary">Havens</span>
    </Link>
  );
}
