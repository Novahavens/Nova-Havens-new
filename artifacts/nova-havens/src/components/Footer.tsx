import { Link } from 'wouter';
import { Logo } from './Navbar';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#0A0C10', borderTop: '1px solid rgba(255,255,255,0.08)' }} className="pt-16 pb-8">
      <div className="mx-auto max-w-[1200px] w-full px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          <div className="flex flex-col">
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed" data-testid="text-footer-tagline">
              Providing prompt and compassionate relocation services for families in need across the nation.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground mb-2">NovaHavens</h3>
            <Link href="/about-us" className="text-muted-foreground hover:text-primary transition-colors text-sm w-fit" data-testid="link-footer-about">About</Link>
            <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors text-sm w-fit" data-testid="link-footer-blog">Blog</Link>
            <Link href="/meet-the-team" className="text-muted-foreground hover:text-primary transition-colors text-sm w-fit" data-testid="link-footer-team">Meet the Team</Link>
            <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm w-fit" data-testid="link-footer-contact">Contact</Link>
            <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors text-sm w-fit" data-testid="link-footer-privacy">Privacy Policy</Link>
            <Link href="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors text-sm w-fit" data-testid="link-footer-terms">Terms of Service</Link>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground mb-2">Contact</h3>
            <a href="tel:6294010054" className="text-muted-foreground hover:text-primary transition-colors text-sm w-fit" data-testid="link-footer-phone">(629) 401-0054</a>
            <a href="mailto:info@novahavens.com" className="text-muted-foreground hover:text-primary transition-colors text-sm w-fit" data-testid="link-footer-email">info@novahavens.com</a>
            <span className="text-muted-foreground text-sm" data-testid="text-footer-location">Nashville, TN</span>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground mb-2">Follow us on social media</h3>
            <div className="flex items-center gap-4">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Nova Havens on LinkedIn"
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-footer-linkedin"
              >
                <FaLinkedin className="w-6 h-6" aria-hidden="true" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Nova Havens on Instagram"
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-footer-instagram"
              >
                <FaInstagram className="w-6 h-6" aria-hidden="true" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Nova Havens on Facebook"
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-footer-facebook"
              >
                <FaFacebook className="w-6 h-6" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground" data-testid="text-footer-copyright">
            © {new Date().getFullYear()} Nova Havens. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider" data-testid="text-footer-staging-notice">
            STAGING SITE — NOT FOR PUBLIC DISTRIBUTION
          </p>
        </div>
      </div>
    </footer>
  );
}
