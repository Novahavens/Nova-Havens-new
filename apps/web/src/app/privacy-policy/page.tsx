import type { Metadata } from 'next';

import { LegalPage } from '@/components/shared/legal-page';
import { CONTACT } from '@/config/site';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy',
  description:
    'Nova Havens privacy policy — how we collect, use, and protect your information when you use our temporary housing coordination services.',
  path: '/privacy-policy',
});

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      dateLine="Last updated: [Draft — Not for publication]"
      testId="heading-privacy"
      contactEmail={CONTACT.fallbackEmail}
    >
      <h2>1. Information We Collect</h2>
      <p>
        We collect information to provide and improve our temporary housing coordination services. The types of personal
        information we collect include contact info (name, phone, email, address), property details from property owners,
        usage data from site visits, and communications records.
      </p>
      <h2>2. How We Use Your Information</h2>
      <p>
        We use your information to coordinate housing placements, communicate with families, verify and manage
        properties in our network, improve our services, and comply with legal obligations.
      </p>
      <h2>3. Sharing with Property Partners</h2>
      <p>
        We share property details with potential housing candidates as necessary to fulfill housing placements. We do
        not sell personal information.
      </p>
      <h2>4. Automated Processing and AI</h2>
      <p>
        Nova Havens uses automation and agentic AI technologies to process claims and match families to housing options.
        This means some decisions in the placement process may be made or influenced by automated systems. If you have
        questions or concerns about automated processing affecting you, please contact us.
      </p>
      <h2>5. Data Security</h2>
      <p>
        We use industry-standard security measures including encryption in transit and at rest, access controls, and
        regular security reviews to protect your data against unauthorized access, alteration, disclosure, or
        destruction.
      </p>
      <h2>6. Your Rights</h2>
      <p>
        Depending on your location, you may have rights to access, correct, delete, or restrict processing of your data.
        Contact us to exercise these rights. We will respond to your request within a reasonable timeframe and in
        accordance with applicable law.
      </p>
      <h2>7. Children&apos;s Privacy</h2>
      <p>
        Our services are not directed to children under 13. We do not knowingly collect data from children. If we become
        aware that we have collected personal data from a child without parental consent, we will take steps to remove
        that information.
      </p>
      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this policy periodically to reflect changes in our practices or for other operational, legal, or
        regulatory reasons. Material changes will be communicated to affected parties via email or through a prominent
        notice on our site.
      </p>
    </LegalPage>
  );
}
