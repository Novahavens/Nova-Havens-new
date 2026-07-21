import { Link } from 'wouter';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Logo() {
  return (
    <Link href="/" className="text-xl md:text-2xl tracking-tight no-underline" data-testid="link-logo">
      <span style={{ fontWeight: 800, color: '#F5F5F2' }}>Nova</span>
      <span style={{ fontWeight: 800, color: '#D4A24C' }}>Havens</span>
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full" style={{ backgroundColor: '#0A0C10', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="mx-auto max-w-[1200px] w-full px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Logo />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors" data-testid="link-nav-home">Home</Link>
          <Link href="/blog" className="text-sm font-medium text-foreground hover:text-primary transition-colors" data-testid="link-nav-blog">Blog</Link>
          <Link href="/contact" className="text-sm font-medium text-foreground hover:text-primary transition-colors" data-testid="link-nav-contact">Contact</Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/contact" className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-primary text-primary hover:brightness-105 rounded-full px-7 py-3" data-testid="btn-submit-property">
            Submit Property
          </Link>
          <Link href="/contact" className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-[#0A0C10] hover:brightness-105 rounded-full px-7 py-3" data-testid="btn-request-housing">
            Request Housing
          </Link>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground" data-testid="btn-mobile-menu">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#0A0C10] border-l border-white/10 p-6 flex flex-col">
              <div className="mb-8">
                <Logo />
              </div>
              <nav className="flex flex-col gap-6 mb-8">
                <Link href="/" onClick={closeMenu} className="text-lg font-medium text-foreground" data-testid="link-mobile-home">Home</Link>
                <Link href="/blog" onClick={closeMenu} className="text-lg font-medium text-foreground" data-testid="link-mobile-blog">Blog</Link>
                <Link href="/contact" onClick={closeMenu} className="text-lg font-medium text-foreground" data-testid="link-mobile-contact">Contact</Link>
              </nav>
              <div className="flex flex-col gap-4 mt-auto">
                <Link href="/contact" onClick={closeMenu} className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold transition-colors border border-primary text-primary hover:brightness-105 rounded-full px-7 py-3 w-full" data-testid="btn-mobile-submit-property">
                  Submit Property
                </Link>
                <Link href="/contact" onClick={closeMenu} className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold transition-colors bg-primary text-[#0A0C10] hover:brightness-105 rounded-full px-7 py-3 w-full" data-testid="btn-mobile-request-housing">
                  Request Housing
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
