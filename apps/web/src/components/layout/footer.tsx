import Link from 'next/link';

import { AskAiAboutUs } from '@/components/shared/ask-ai-about-us';
import { FacebookIcon, InstagramIcon, LinkedInIcon } from '@/components/shared/brand-icons';
import { TrackedAnchor } from '@/components/shared/tracked-link';
import { COMPANY, CONTACT, FOOTER_LINKS, SOCIAL } from '@/config/site';

const SOCIAL_LINKS = [
  { platform: 'linkedin', href: SOCIAL.linkedin, label: 'Nova Havens on LinkedIn', Icon: LinkedInIcon },
  { platform: 'instagram', href: SOCIAL.instagram, label: 'Nova Havens on Instagram', Icon: InstagramIcon },
  { platform: 'facebook', href: SOCIAL.facebook, label: 'Nova Havens on Facebook', Icon: FacebookIcon },
] as const;

export function Footer() {
  return (
    <footer className="pt-16 pb-8 bg-background border-t border-white/[0.08]">
      <div className="mx-auto max-w-site w-full px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          <div className="flex flex-col">
            <div className="mb-4 text-xl md:text-2xl tracking-tight">
              <span className="font-extrabold text-foreground">Nova</span>
              <span className="font-extrabold text-primary">Havens</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed" data-testid="text-footer-tagline">
              Providing prompt and compassionate relocation services for families in need across the nation.
            </p>
          </div>

          <nav className="flex flex-col gap-3" aria-label="Footer">
            <h3 className="font-semibold text-foreground mb-2">{COMPANY.name}</h3>
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-primary transition-colors text-sm w-fit"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground mb-2">Contact</h3>
            <TrackedAnchor
              href={CONTACT.phone.href}
              event="contact_link_click"
              data={{ method: 'phone', location: 'footer' }}
              className="text-muted-foreground hover:text-primary transition-colors text-sm w-fit"
              data-testid="link-footer-phone"
            >
              {CONTACT.phone.display}
            </TrackedAnchor>
            <TrackedAnchor
              href={`mailto:${CONTACT.email}`}
              event="contact_link_click"
              data={{ method: 'email', location: 'footer' }}
              className="text-muted-foreground hover:text-primary transition-colors text-sm w-fit"
              data-testid="link-footer-email"
            >
              {CONTACT.email}
            </TrackedAnchor>
            <span className="text-muted-foreground text-sm" data-testid="text-footer-location">
              {CONTACT.address.locality}, {CONTACT.address.region}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground mb-2">Follow us on social media</h3>
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map(({ platform, href, label, Icon }) => (
                <TrackedAnchor
                  key={platform}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  event="social_link_click"
                  data={{ platform }}
                  className="text-muted-foreground hover:text-primary opacity-70 hover:opacity-100 transition-all duration-150 ease-out"
                  data-testid={`link-footer-${platform}`}
                >
                  <Icon className="w-6 h-6" />
                </TrackedAnchor>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 pb-8 border-t border-white/10">
          <AskAiAboutUs variant="compact" />
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground" data-testid="text-footer-copyright">
            © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
