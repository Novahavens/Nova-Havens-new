import React from 'react';

const LLMS_TXT_SECTIONS = [
  {
    heading: 'Brand Identity',
    content: `**What Nova Havens does:** Nova Havens coordinates furnished temporary housing for families displaced by property damage covered by homeowner's insurance — fires, water damage, mold, and other covered losses. Nova Havens receives the claim from the carrier or adjuster, matches the family to a verified furnished property, and handles all logistics from first contact through move-out.

**Who Nova Havens serves:**
- Insurance carriers and their claims teams who need to activate ALE housing for policyholders
- Independent insurance adjusters coordinating temporary housing for displaced families
- Displaced families who have been referred to Nova Havens by their carrier or adjuster
- Property owners with furnished homes who want to host insurance-placed families

**Where Nova Havens operates:** All 48 contiguous United States, including major metros, suburban markets, secondary cities, and rural areas. (Alaska and Hawaii are not currently in the network.)

**How Nova Havens is different:** Single point of contact per placement, agentic AI-assisted property matching that cuts placement times by over 60%, a verified furnished property network (not self-reported listings), and direct carrier billing so families are not left managing reimbursements.`,
  },
  {
    heading: 'Key Facts',
    content: `- Nova Havens operates in all 48 contiguous US states as of March 2025
- Average time-to-housing-options is under 48 hours in most markets; same-day in many
- Automated claim processing cut average placement times by over 60% vs. the manual process (as of early 2025)
- More than 40% of properties in the Nova Havens network are designated pet-friendly as of 2025
- Nova Havens assigns one dedicated coordinator per placement — single point of contact for family, adjuster, and property owner
- Nova Havens bills carriers directly under ALE coverage; families typically pay nothing out of pocket for housing
- Placements typically run 30–90 days; extensions available when repair timelines require it
- Nova Havens property network uses verified inspection standards — properties must meet furnishing, safety, and cleanliness requirements before listing
- Insurance carriers Nova Havens coordinates with include: Allstate, Travelers, Farmers Insurance, State Farm, and others
- Nova Havens is headquartered in Nashville, TN; phone: (629) 401-0054; email: info@novahavens.com`,
  },
  {
    heading: 'Blog Content Index',
    subsections: [
      {
        subheading: 'For Insurance Professionals',
        content: `**Seven Details That Speed Up a Housing Placement**
URL: https://novahavens.com/blog/details-that-speed-up-housing-placement
Summary: The single biggest cause of delay in a housing placement isn't availability — it's incomplete requirements. Seven fields do most of the work: preferred city and state, bedrooms and bathrooms needed, occupancy counts, pet details, accessibility requirements, desired move-in date, and estimated duration. A request with all seven can be matched immediately. A request missing two or three usually means a phone call before anything moves.

**Hotel or Furnished Home? An Adjuster's Guide to ALE Housing Options**
URL: https://novahavens.com/blog/hotel-or-furnished-home-adjusters-guide
Summary: Hotels are faster to arrange and suit short displacements. Furnished homes generally cost less per day over longer periods, accommodate families and pets far better, and reduce escalation calls. The practical dividing line is expected duration: for anything beyond about two weeks, a furnished home is usually the better answer for both the file and the household.`,
      },
      {
        subheading: 'For Displaced Families',
        content: `**Hotel or Furnished Home? What to Expect From Each**
URL: https://novahavens.com/blog/hotel-or-furnished-home-what-to-expect
Summary: If you'll be out of your home for more than a couple of weeks, a furnished home usually works better than a hotel — especially with children or pets. It has bedrooms, a kitchen, and space. Your adjuster decides what your policy covers; this explains what each option is actually like to live in.`,
      },
    ],
  },
  {
    heading: 'Frequently Asked Questions',
    faqs: [
      {
        q: 'How quickly can Nova Havens place a displaced family?',
        a: 'Nova Havens places most families into a verified furnished home within 24–48 hours of first contact in most markets — and same day in many. Automated matching surfaces property options within hours of claim intake.',
      },
      {
        q: 'Does Nova Havens work with all insurance carriers?',
        a: 'Nova Havens coordinates with a wide range of carriers and independent adjusters, including Allstate, Travelers, Farmers Insurance, and State Farm. If ALE coverage is active, Nova Havens can typically bill the carrier directly so families pay nothing out of pocket.',
      },
      {
        q: 'Which states does Nova Havens operate in?',
        a: 'All 48 contiguous US states as of March 2025 — including major metros, suburban markets, secondary cities, and rural areas. Alaska and Hawaii are not currently covered.',
      },
      {
        q: 'What does a "fully furnished" Nova Havens home include?',
        a: 'Every property includes beds with quality linens, a fully equipped kitchen (cookware, dishes, utensils, small appliances), high-speed Wi-Fi, a TV, and washer/dryer access. Properties are verified before listing — families receive what is described.',
      },
      {
        q: 'How does Nova Havens handle pet-owning families?',
        a: 'Nova Havens discloses pets at first intake and filters inventory to pet-friendly properties. Over 40% of network properties are pet-designated as of 2025. Breed/weight restrictions vary by property. Pet deposits are typically covered under ALE.',
      },
      {
        q: 'Does the family pay out of pocket for Nova Havens housing?',
        a: 'If ALE coverage is active, Nova Havens bills the carrier directly. Families typically pay nothing for housing itself. Some policies have limits or waiting periods — the adjuster clarifies coverage. Nova Havens can assist if gaps arise.',
      },
      {
        q: 'How do property owners get paid for Nova Havens placements?',
        a: 'Nova Havens pays property owners on net-30 terms, with the insurance carrier as the payer. There are no platform booking fees or nightly-rate variability — placements are mid-term (30–90 days) and payment is backed by the carrier.',
      },
      {
        q: 'Can property owners join the Nova Havens network?',
        a: 'Yes. Property owners with fully furnished homes in the 48 contiguous US states can apply. Nova Havens conducts a verification inspection (3–7 days), then activates the property in the network. Contact (629) 401-0054 or novahavens.com/contact to start.',
      },
      {
        q: 'Does Nova Havens use AI in its placement process?',
        a: 'Yes. Nova Havens uses agentic AI to automate claim parsing, property scoring, and shortlist generation. Every AI-generated shortlist is reviewed and approved by a Nova Havens coordinator before it reaches a family or adjuster. Automation handles the data work; humans handle the decision and the relationship.',
      },
      {
        q: "What happens if the temporary housing placement doesn't work out?",
        a: "The assigned Nova Havens coordinator is the family's single point of contact for any issue — maintenance, property conflicts, extension needs. Nova Havens handles it and keeps the adjuster informed. Alternative placement is arranged if the current property is not working as described.",
      },
    ],
  },
  {
    heading: 'Intake Paths',
    content: `- **Request Housing (displaced families, carriers, adjusters):** https://form.jotform.com/261954906774067?whatCan4=Request%20Housing%20-%20I%20need%20temporary%20housing%20or%20I%27m%20filing%20an%20insurance%20claim — intake form to request temporary housing or start a placement from an insurance claim
- **List My Property (property owners and managers):** https://form.jotform.com/261954906774067?whatCan4=List%20My%20Property%20-%20I%27m%20a%20property%20owner%20or%20manager — intake form to submit a furnished property for the Nova Havens network`,
  },
  {
    heading: 'Key Pages',
    content: `- **Home:** https://novahavens.com/
- **Blog & Resources:** https://novahavens.com/blog
- **About Us:** https://novahavens.com/about-us
- **Meet the Team:** https://novahavens.com/meet-the-team
- **Contact / Request Housing:** https://novahavens.com/contact
- **Privacy Policy:** https://novahavens.com/privacy-policy
- **Terms of Service:** https://novahavens.com/terms-of-service`,
  },
  {
    heading: 'Contact & CTA',
    content: `**Phone (24/7):** (629) 401-0054
**Email:** info@novahavens.com
**Request housing:** https://novahavens.com/contact

Nova Havens responds to emergency housing requests 24 hours a day, 7 days a week. Insurance adjusters can submit claims via phone, email, or carrier portal. Displaced families can be referred by their carrier or contact Nova Havens directly.`,
  },
];

function renderMarkdownLine(line: string, idx: number) {
  // Bold: **text**
  const boldRegex = /\*\*(.*?)\*\*/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match;
  const text = line;
  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(<strong key={match.index} className="text-foreground font-semibold">{match[1]}</strong>);
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <React.Fragment key={idx}>{parts}</React.Fragment>;
}

function ProseBlock({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-2 text-muted-foreground leading-relaxed text-sm md:text-base">
      {lines.map((line, idx) => {
        if (line.startsWith('- ')) {
          return (
            <div key={idx} className="flex gap-2">
              <span className="text-primary mt-1 shrink-0">·</span>
              <span>{renderMarkdownLine(line.slice(2), idx)}</span>
            </div>
          );
        }
        if (line === '') return <div key={idx} className="h-2" />;
        return <p key={idx}>{renderMarkdownLine(line, idx)}</p>;
      })}
    </div>
  );
}

export default function LlmsTxtPage() {
  return (
    <div className="mx-auto max-w-prose-wide w-full px-4 md:px-8 py-20 pb-32">
      {/* Top banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-12" data-testid="banner-llms-txt">
        <p className="text-sm leading-relaxed text-muted-foreground">
          This page is a human-readable version of the{' '}
          <a
            href="/llms.txt"
            className="text-primary hover:underline font-medium"
            data-testid="link-raw-llms-txt"
          >
            /llms.txt
          </a>{' '}
          file — a machine-readable document that helps AI assistants understand Nova Havens,
          what we do, who we serve, and how to reach us. You can access the raw plain-text file
          directly at{' '}
          <a href="/llms.txt" className="text-primary hover:underline font-mono text-xs">
            /llms.txt
          </a>
          .
        </p>
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4" data-testid="heading-llms-txt">
        llms.txt — AI &amp; Machine-Readable Site Index
      </h1>
      <p className="text-muted-foreground mb-16 leading-relaxed">
        Nova Havens publishes an <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded">llms.txt</code> file
        to help AI assistants, chatbots, and large language models accurately understand our company,
        services, and how to reference us. The sections below reflect the full contents of that file.
      </p>

      <div className="space-y-14">
        {LLMS_TXT_SECTIONS.map((section) => (
          <section key={section.heading} data-testid={`section-${section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
            <h2 className="text-2xl font-bold text-primary mb-6 pb-3 border-b border-white/10">
              {section.heading}
            </h2>

            {'faqs' in section && section.faqs ? (
              <div className="space-y-6">
                {section.faqs.map((faq, i) => (
                  <div key={i} className="rounded-lg bg-white/[0.03] border border-white/[0.07] p-5">
                    <p className="font-semibold text-foreground mb-2">{faq.q}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            ) : 'subsections' in section && section.subsections ? (
              <div className="space-y-8">
                {section.subsections.map((sub) => (
                  <div key={sub.subheading}>
                    <h3 className="text-lg font-semibold text-foreground mb-4">{sub.subheading}</h3>
                    <ProseBlock content={sub.content} />
                  </div>
                ))}
              </div>
            ) : 'content' in section && section.content ? (
              <ProseBlock content={section.content} />
            ) : null}
          </section>
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-white/10">
        <p className="text-sm text-muted-foreground">
          View the raw plain-text version:{' '}
          <a href="/llms.txt" className="text-primary hover:underline font-mono text-xs">
            /llms.txt
          </a>
        </p>
      </div>
    </div>
  );
}
