'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { IntakeCta } from '@/components/shared/cta-button';
import { NAV_LINKS } from '@/config/site';
import { cn } from '@/lib/utils';
import { Logo } from './logo';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-white/[0.08]">
      <div className="mx-auto max-w-site w-full px-4 md:px-8 h-16 flex items-center justify-between">
        <Logo />

        <nav className="hidden lg:flex items-center gap-8" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? 'page' : undefined}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === link.href ? 'text-primary' : 'text-foreground',
              )}
              data-testid={`link-nav-${link.label.toLowerCase()}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <IntakeCta
            form="property"
            location="navbar_desktop"
            variant="outline"
            size="sm"
            data-testid="btn-submit-property"
          >
            Submit Property
          </IntakeCta>
          <IntakeCta form="housing" location="navbar_desktop" size="sm" data-testid="btn-request-housing">
            Request Housing
          </IntakeCta>
        </div>

        <div className="lg:hidden flex items-center">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground" data-testid="btn-mobile-menu">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-l border-white/10 p-6 flex flex-col">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SheetDescription className="sr-only">Site navigation and intake forms</SheetDescription>
              <div className="mb-8">
                <Logo />
              </div>
              <nav className="flex flex-col gap-6 mb-8" aria-label="Mobile">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="text-lg font-medium text-foreground"
                    data-testid={`link-mobile-${link.label.toLowerCase()}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col gap-4 mt-auto">
                <IntakeCta
                  form="property"
                  location="navbar_mobile"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={closeMenu}
                  data-testid="btn-mobile-submit-property"
                >
                  Submit Property
                </IntakeCta>
                <IntakeCta
                  form="housing"
                  location="navbar_mobile"
                  size="sm"
                  className="w-full"
                  onClick={closeMenu}
                  data-testid="btn-mobile-request-housing"
                >
                  Request Housing
                </IntakeCta>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
