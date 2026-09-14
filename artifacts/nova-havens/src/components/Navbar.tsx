import { Link } from 'wouter';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@workspace/nova-havens-design-system/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@workspace/nova-havens-design-system/components/ui/sheet';
import { EXTERNAL_FORM_LINK_PROPS, INTAKE_FORMS } from '@/lib/intakeForms';
import { trackEvent } from '@/lib/analytics';

export function Logo() {
  return (
    <Link href="/" className="text-xl md:text-2xl tracking-tight no-underline" data-testid="link-logo">
      <span className="font-extrabold text-foreground">Nova</span>
      <span className="font-extrabold text-primary">Havens</span>
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-white/[0.08]">
      <div className="mx-auto max-w-site w-full px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Logo />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors" data-testid="link-nav-home">Home</Link>
          <Link href="/blog" className="text-sm font-medium text-foreground hover:text-primary transition-colors" data-testid="link-nav-blog">Blog</Link>
          <Link href="/meet-the-team" className="text-sm font-medium text-foreground hover:text-primary transition-colors" data-testid="link-nav-team">Team</Link>
          <Link href="/about-us" className="text-sm font-medium text-foreground hover:text-primary transition-colors" data-testid="link-nav-about">About</Link>
          <Link href="/contact" className="text-sm font-medium text-foreground hover:text-primary transition-colors" data-testid="link-nav-contact">Contact</Link>
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <a href={INTAKE_FORMS.property} {...EXTERNAL_FORM_LINK_PROPS} onClick={() => trackEvent('intake_form_click', { form: 'property', location: 'navbar_desktop' })} className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-primary text-primary hover:brightness-105 rounded-full px-7 py-3" data-testid="btn-submit-property">
            Submit Property
          </a>
          <a href={INTAKE_FORMS.housing} {...EXTERNAL_FORM_LINK_PROPS} onClick={() => trackEvent('intake_form_click', { form: 'housing', location: 'navbar_desktop' })} className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:brightness-105 rounded-full px-7 py-3" data-testid="btn-request-housing">
            Request Housing
          </a>
        </div>

        {/* Compact nav remains active through 1023px; desktop navigation starts at lg (1024px). */}
        <div className="lg:hidden flex items-center">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground" data-testid="btn-mobile-menu">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-l border-white/10 p-6 flex flex-col">
              <div className="mb-8">
                <Logo />
              </div>
              <nav className="flex flex-col gap-6 mb-8">
                <Link href="/" onClick={closeMenu} className="text-lg font-medium text-foreground" data-testid="link-mobile-home">Home</Link>
                <Link href="/blog" onClick={closeMenu} className="text-lg font-medium text-foreground" data-testid="link-mobile-blog">Blog</Link>
                <Link href="/meet-the-team" onClick={closeMenu} className="text-lg font-medium text-foreground" data-testid="link-mobile-team">Team</Link>
                <Link href="/about-us" onClick={closeMenu} className="text-lg font-medium text-foreground" data-testid="link-mobile-about">About</Link>
                <Link href="/contact" onClick={closeMenu} className="text-lg font-medium text-foreground" data-testid="link-mobile-contact">Contact</Link>
              </nav>
              <div className="flex flex-col gap-4 mt-auto">
                <a href={INTAKE_FORMS.property} {...EXTERNAL_FORM_LINK_PROPS} onClick={() => { trackEvent('intake_form_click', { form: 'property', location: 'navbar_mobile' }); closeMenu(); }} className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold transition-colors border border-primary text-primary hover:brightness-105 rounded-full px-7 py-3 w-full" data-testid="btn-mobile-submit-property">
                  Submit Property
                </a>
                <a href={INTAKE_FORMS.housing} {...EXTERNAL_FORM_LINK_PROPS} onClick={() => { trackEvent('intake_form_click', { form: 'housing', location: 'navbar_mobile' }); closeMenu(); }} className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold transition-colors bg-primary text-primary-foreground hover:brightness-105 rounded-full px-7 py-3 w-full" data-testid="btn-mobile-request-housing">
                  Request Housing
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
