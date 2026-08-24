import React from 'react';
import { Link } from 'wouter';

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-prose-wide w-full px-4 md:px-8 py-20 pb-32">
      {/* Draft Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-6 mb-12" data-testid="banner-draft">
        <p className="text-amber-500 font-medium text-sm leading-relaxed" data-testid="text-draft-notice">
          <strong>DRAFT</strong> — This document is a working draft for internal review only. It has not been reviewed by an attorney and must not be published or distributed until legal review is complete.
        </p>
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4" data-testid="heading-privacy">Privacy Policy</h1>
      <p className="text-muted-foreground mb-12" data-testid="text-last-updated">Last updated: [Draft — Not for publication]</p>

      <div className="prose prose-invert prose-p:text-muted-foreground prose-p:leading-relaxed prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6 max-w-none">
        
        <h2 data-testid="heading-info-collect">1. Information We Collect</h2>
        <p>
          We collect information to provide and improve our temporary housing coordination services. The types of personal information we collect include contact info (name, phone, email, address), claim details provided by insurance carriers, property details from property owners, usage data from site visits, and communications records.
        </p>

        <h2 data-testid="heading-how-we-use">2. How We Use Your Information</h2>
        <p>
          We use your information to coordinate housing placements, communicate with families and carriers, verify and manage properties in our network, improve our services, and comply with legal obligations.
        </p>

        <h2 data-testid="heading-sharing">3. Sharing with Insurance and Property Partners</h2>
        <p>
          We share relevant information with insurance carriers, adjusters, and relocation specialists as necessary to fulfill housing placements. We share property details with potential housing candidates. We do not sell personal information.
        </p>

        <h2 data-testid="heading-automated-ai">4. Automated Processing and AI</h2>
        <p>
          Nova Havens uses automation and agentic AI technologies to process claims and match families to housing options. This means some decisions in the placement process may be made or influenced by automated systems. If you have questions or concerns about automated processing affecting you, please contact us.
        </p>

        <h2 data-testid="heading-data-security">5. Data Security</h2>
        <p>
          We use industry-standard security measures including encryption in transit and at rest, access controls, and regular security reviews to protect your data against unauthorized access, alteration, disclosure, or destruction.
        </p>

        <h2 data-testid="heading-your-rights">6. Your Rights</h2>
        <p>
          Depending on your location, you may have rights to access, correct, delete, or restrict processing of your data. Contact us to exercise these rights. We will respond to your request within a reasonable timeframe and in accordance with applicable law.
        </p>

        <h2 data-testid="heading-children">7. Children's Privacy</h2>
        <p>
          Our services are not directed to children under 13. We do not knowingly collect data from children. If we become aware that we have collected personal data from a child without parental consent, we will take steps to remove that information.
        </p>

        <h2 data-testid="heading-changes">8. Changes to This Policy</h2>
        <p>
          We may update this policy periodically to reflect changes in our practices or for other operational, legal, or regulatory reasons. Material changes will be communicated to affected parties via email or through a prominent notice on our site.
        </p>

        <h2 data-testid="heading-contact-us">9. Contact Us</h2>
        <p>
          If you have any questions or concerns about this Privacy Policy, please contact us at:
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
