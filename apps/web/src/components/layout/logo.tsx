import Image from 'next/image';
import Link from 'next/link';

import { BRAND } from '@/config/site';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`flex items-center no-underline ${className}`}
      aria-label="Nova Havens home"
      data-testid="link-logo"
    >
      <Image
        src={BRAND.assets.logoMark}
        alt="Nova Havens"
        width={320}
        height={320}
        priority
        className="h-10 w-10 sm:hidden"
      />
      <Image
        src={BRAND.assets.logoHorizontal}
        alt="Nova Havens Home Rentals"
        width={1955}
        height={784}
        priority
        className="hidden h-14 w-auto sm:block md:h-16"
      />
    </Link>
  );
}
