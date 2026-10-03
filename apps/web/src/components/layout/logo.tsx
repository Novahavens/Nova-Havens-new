import Image from 'next/image';
import Link from 'next/link';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 no-underline ${className}`}
      aria-label="Nova Havens home"
      data-testid="link-logo"
    >
      <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
        <Image
          src="/brand/logo-icon.svg"
          alt="Nova Havens"
          width={48}
          height={48}
          className="w-full h-full text-primary"
          priority
        />
      </div>
      <span className="hidden sm:inline font-extrabold text-sm md:text-base tracking-tight">
        <span className="text-foreground">Nova</span>
        <span className="text-primary">Havens</span>
      </span>
    </Link>
  );
}
