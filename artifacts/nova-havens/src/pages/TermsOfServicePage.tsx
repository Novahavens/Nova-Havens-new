import React from 'react';

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-prose-wide w-full px-4 md:px-8 py-20 pb-32">
      {/* Draft Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-6 mb-12" data-testid="banner-draft">
        <p className="text-amber-500 font-medium text-sm leading-relaxed" data-testid="text-draft-notice">
          <strong>DRAFT</strong> — This document is a working draft for internal review only. It has not been reviewed by an attorney and must not be published or distributed until legal review is complete.
        </p>
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4" data-testid="heading-terms">Terms of Service</h1>
      <p className="text-muted-foreground mb-12" data-testid="text-effective-date">Effective date: [Draft — Not for publication]</p>

      <div className="prose prose-invert prose-p:text-muted-foreground prose-p:leading-relaxed prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6 max-w-none">
        
        <h2 data-testid="heading-acceptance">1. Acceptance of Terms</h2>
        <p>
          By accessing or using the services provided by Nova Havens, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you may not use our services.
        </p>

        <h2 data-testid="heading-service-description">2. Service Description</h2>
        <p>
          Nova Havens coordinates temporary furnished housing placements for displaced families on behalf of insurance carriers, adjusters, and relocation specialists. We act as a facilitator to connect housing providers with individuals and families in need of short-term accommodations.
        </p>

        <h2 data-testid="heading-owner-obligations">3. Property Owner Obligations</h2>
        <p>
          Property owners in our network agree to maintain properties in safe, habitable, and furnished condition; honor confirmed placements; comply with all applicable local laws, regulations, and zoning ordinances; and notify Nova Havens promptly of any property issues that could affect the occupant's safety or comfort.
        </p>

        <h2 data-testid="heading-insurance-relationships">4. Insurance Partner Relationships</h2>
        <p>
          Nova Havens acts as a coordinator between insurance carriers and housing providers. Carriers and adjusters remain responsible for their coverage determinations, limits, and policy interpretations. Nova Havens does not provide insurance advice, adjust claims, or interpret policy coverage.
        </p>

        <h2 data-testid="heading-housing-terms">5. Housing Request and Placement Terms</h2>
        <p>
          Families placed through Nova Havens agree to care for the property, comply with all posted house rules, and vacate by the agreed-upon date. Nova Havens makes reasonable efforts to match families to suitable properties but cannot guarantee a specific placement or guarantee availability in all areas at all times.
        </p>

        <h2 data-testid="heading-payments">6. Payments and Billing</h2>
        <p>
          Billing arrangements are governed by separate agreements with insurance carriers or relocation specialists. Nova Havens generally invoices the insurance carrier or third-party administrator directly. We do not collect payment directly from displaced families unless specifically authorized and agreed upon in writing.
        </p>

        <h2 data-testid="heading-limitation-liability">7. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Nova Havens' liability is limited to direct damages not to exceed the total fees paid for the specific services in question. We are not liable for indirect, consequential, incidental, special, or punitive damages arising out of or related to these terms or our services.
        </p>

        <h2 data-testid="heading-governing-law">8. Governing Law</h2>
        <p>
          These terms and any disputes arising out of or related to them shall be governed by and construed in accordance with the laws of the State of Tennessee, without regard to its conflict of law principles.
        </p>

        <h2 data-testid="heading-contact-us">9. Contact Us</h2>
        <p>
          If you have any questions or concerns regarding these Terms of Service, please contact us at:
        </p>
        <p>
          <a href="mailto:info@novahavens.com" className="text-primary hover:underline">info@novahavens.com</a><br />
          <a href="tel:6294010054" className="text-primary hover:underline">(629) 401-0054</a><br />
          After Hours Specialty Line: <a href="tel:6292062360" className="text-primary hover:underline">(629) 206-2360</a><br />
          Nashville, TN
        </p>
      </div>
    </div>
  );
}
