import type { Metadata } from 'next';

import { LegalPage } from '@/components/shared/legal-page';
import { CONTACT } from '@/config/site';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Service',
  description:
    'Nova Havens terms of service — the agreements governing use of our furnished housing coordination services for families, carriers, and property owners.',
  path: '/terms-of-service',
});

export default function TermsOfServicePage() {
  return (
    <LegalPage
      title="Terms of Service"
      dateLine="Effective date: 2026"
      testId="heading-terms"
      contactEmail={CONTACT.email}
    >
      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using the services provided by Nova Havens, you agree to comply with and be bound by these Terms
        of Service. If you do not agree to these terms, you may not use our services.
      </p>
      <h2>2. Service Description</h2>
      <p>
        Nova Havens coordinates temporary furnished housing placements for displaced families on behalf of insurance
        carriers, adjusters, and relocation specialists. We act as a facilitator to connect housing providers with
        individuals and families in need of short-term accommodations.
      </p>
      <h2>3. Property Owner Obligations</h2>
      <p>
        Property owners in our network agree to maintain properties in safe, habitable, and furnished condition; honor
        confirmed placements; comply with all applicable local laws, regulations, and zoning ordinances; and notify Nova
        Havens promptly of any property issues that could affect the occupant&apos;s safety or comfort.
      </p>
      <h2>4. Insurance Partner Relationships</h2>
      <p>
        Nova Havens acts as a coordinator between insurance carriers and housing providers. Carriers and adjusters
        remain responsible for their coverage determinations, limits, and policy interpretations. Nova Havens does not
        provide insurance advice, adjust claims, or interpret policy coverage.
      </p>
      <h2>5. Housing Request and Placement Terms</h2>
      <p>
        Families placed through Nova Havens agree to care for the property, comply with all posted house rules, and
        vacate by the agreed-upon date. Nova Havens makes reasonable efforts to match families to suitable properties
        but cannot guarantee a specific placement or guarantee availability in all areas at all times.
      </p>
      <h2>6. Payments and Billing</h2>
      <p>
        Billing arrangements are governed by separate agreements with insurance carriers or relocation specialists. Nova
        Havens generally invoices the insurance carrier or third-party administrator directly. We do not collect payment
        directly from displaced families unless specifically authorized and agreed upon in writing.
      </p>
      <h2>7. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, Nova Havens&apos; liability is limited to direct damages not to exceed
        the total fees paid for the specific services in question. We are not liable for indirect, consequential,
        incidental, special, or punitive damages arising out of or related to these terms or our services.
      </p>
      <h2>8. Governing Law</h2>
      <p>
        These terms and any disputes arising out of or related to them shall be governed by and construed in accordance
        with the laws of the State of Tennessee, without regard to its conflict of law principles.
      </p>
    </LegalPage>
  );
}
