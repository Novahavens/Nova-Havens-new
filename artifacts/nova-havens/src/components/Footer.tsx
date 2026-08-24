import { Link } from 'wouter';
import { Logo } from './Navbar';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';
import AskAiAboutUs from './AskAiAboutUs';

export default function Footer() {
  return (
    <footer className="pt-16 pb-8 bg-background border-t border-white/[0.08]">
      <div className="mx-auto max-w-site w-full px-4 md:px-8">
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
            <Link href="/llms-txt" className="text-muted-foreground hover:text-primary transition-colors text-sm w-fit" data-testid="link-footer-llms-txt">llms.txt</Link>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground mb-2">Contact</h3>
            <a href="tel:6294010054" className="text-muted-foreground hover:text-primary transition-colors text-sm w-fit" data-testid="link-footer-phone">(629) 401-0054</a>
            <a href="tel:6292062360" className="text-muted-foreground hover:text-primary transition-colors text-sm w-fit" data-testid="link-footer-after-hours-phone">After Hours Specialty Line: (629) 206-2360</a>
            <a href="mailto:info@novahavens.com" className="text-muted-foreground hover:text-primary transition-colors text-sm w-fit" data-testid="link-footer-email">info@novahavens.com</a>
            <span className="text-muted-foreground text-sm" data-testid="text-footer-location">Nashville, TN</span>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground mb-2">Follow us on social media</h3>
            <div className="flex items-center gap-4">
              <a
                href="https://www.linkedin.com/company/novahavenshousing"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Nova Havens on LinkedIn"
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-footer-linkedin"
              >
                <FaLinkedin className="w-6 h-6" aria-hidden="true" />
              </a>
              <a
                href="https://www.instagram.com/novahavenshousing/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Nova Havens on Instagram"
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-footer-instagram"
              >
                <FaInstagram className="w-6 h-6" aria-hidden="true" />
              </a>
              <a
                href="https://www.facebook.com/novahavenshousing"
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

        <div className="pt-8 pb-8 border-t border-white/10">
          <AskAiAboutUs variant="compact" />
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
