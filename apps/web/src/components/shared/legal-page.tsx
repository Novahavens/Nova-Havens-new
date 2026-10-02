import type { ReactNode } from 'react';

import { CONTACT } from '@/config/site';

interface LegalPageProps {
  title: string;
  dateLine: string;
  testId: string;
  contactEmail: string;
  children: ReactNode;
}

/**
 * Shared shell for Privacy Policy and Terms of Service. Both documents are
 * still drafts pending legal review, hence the banner; `noindex` is NOT set
 * so the URLs keep their place in the index, but the banner stays until a
 * lawyer signs off and the draft flag is removed here.
 */
export function LegalPage({ title, dateLine, testId, contactEmail, children }: LegalPageProps) {
  return (
    <div className="mx-auto max-w-prose-wide w-full px-4 md:px-8 py-20 pb-32">
      <div
        className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-6 mb-12"
        role="note"
        data-testid="banner-draft"
      >
        <p className="text-amber-500 font-medium text-sm leading-relaxed">
          <strong>DRAFT</strong> — This document is a working draft for internal review only. It has not been reviewed
          by an attorney and must not be published or distributed until legal review is complete.
        </p>
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4" data-testid={testId}>
        {title}
      </h1>
      <p className="text-muted-foreground mb-12">{dateLine}</p>
      <div className="prose prose-invert prose-p:text-muted-foreground prose-p:leading-relaxed prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6 max-w-none">
        {children}
        <h2>Contact Us</h2>
        <p>If you have any questions or concerns about this document, please contact us at:</p>
        <p>
          <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">
            {contactEmail}
          </a>
          <br />
          <a href={CONTACT.phone.href} className="text-primary hover:underline">
            {CONTACT.phone.display}
          </a>
          <br />
          {CONTACT.address.locality}, {CONTACT.address.region}
        </p>
      </div>
    </div>
  );
}
