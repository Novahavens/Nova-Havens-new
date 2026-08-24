import { BLOG_POSTS, type BlogPost } from './blogPosts.ts';
import { HOME_FAQS } from './homeFaqs.ts';

export interface LlmsFaq {
  q: string;
  a: string;
}

export interface LlmsSubsection {
  subheading: string;
  content: string;
}

export interface LlmsSection {
  heading: string;
  content?: string;
  subsections?: LlmsSubsection[];
  faqs?: LlmsFaq[];
  rawDividerAfter?: boolean;
}

const LLMS_TXT_TITLE = '# Nova Havens — Nationwide Furnished Housing Coordination';

const LLMS_TXT_DESCRIPTION =
  '> Nova Havens is a temporary housing coordination company that places families displaced by insurance claims into fully furnished, verified homes across all 48 contiguous US states. Nova Havens works directly with insurance carriers and adjusters — billing them under Additional Living Expenses (ALE) coverage so families typically pay nothing out of pocket. Placements are delivered within 24–48 hours in most markets.';

export const LLMS_TXT_PAGE_TITLE = 'llms.txt — AI & Machine-Readable Site Index';

export const LLMS_TXT_PAGE_INTRO =
  'Nova Havens publishes an llms.txt file to help AI assistants, chatbots, and large language models accurately understand our company, services, and how to reference us. The sections below reflect the full contents of that file.';

export const BLOG_INDEX_URL_PREFIX = 'https://novahavens.com/blog/';

/**
 * Machine-readable summary for a published post. Every post body opens with a
 * "> " quick-summary blockquote (see the body conventions in blogPosts.ts);
 * that blockquote is the canonical article summary, so it is what AI tools
 * receive. Posts without one fall back to the catalogue excerpt, and
 * scripts/validate-llms.ts fails the build so the omission is caught at
 * authoring time rather than shipping a shorter summary to AI tools.
 */
export function getBlogPostSummary(post: BlogPost): string {
  const quickSummary = getQuickSummaryBlockquote(post);

  return quickSummary ?? post.excerpt.trim();
}

/**
 * Returns the post's opening "> " quick-summary blockquote as plain text, or
 * null when the body does not open with one.
 */
export function getQuickSummaryBlockquote(post: BlogPost): string | null {
  const firstBlock = post.content.split(/\n\n+/, 1)[0] ?? '';

  if (!firstBlock.startsWith('> ')) {
    return null;
  }

  const text = firstBlock
    .split('\n')
    .map((line) => line.replace(/^>\s?/, ''))
    .join(' ')
    .trim();

  return text === '' ? null : text;
}

/**
 * Renders the Blog Content Index straight from the published blog catalogue so
 * titles and summaries can never drift from what the site publishes. Posts are
 * grouped by category in catalogue order.
 */
export function buildBlogIndexSubsections(posts: BlogPost[]): LlmsSubsection[] {
  const grouped = new Map<string, BlogPost[]>();

  for (const post of posts) {
    const bucket = grouped.get(post.category);

    if (bucket) {
      bucket.push(post);
    } else {
      grouped.set(post.category, [post]);
    }
  }

  return [...grouped.entries()].map(([category, categoryPosts]) => ({
    subheading: category,
    content: categoryPosts
      .map(
        (post) =>
          `**${post.title}**\nURL: ${BLOG_INDEX_URL_PREFIX}${post.slug}\nSummary: ${getBlogPostSummary(post)}`,
      )
      .join('\n\n'),
  }));
}

export const LLMS_TXT_SECTIONS: LlmsSection[] = [
  {
    heading: 'Brand Identity',
    rawDividerAfter: true,
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
    rawDividerAfter: true,
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
    rawDividerAfter: true,
    subsections: buildBlogIndexSubsections(BLOG_POSTS),
  },
  {
    heading: 'Frequently Asked Questions',
    rawDividerAfter: true,
    faqs: HOME_FAQS.map((faq) => ({
      q: faq.question,
      a: faq.answer,
    })),
  },
  {
    heading: 'Intake Paths',
    content: `- **Request Housing (displaced families, carriers, adjusters):** https://form.jotform.com/262086580989070 — intake form to request temporary housing or start a placement from an insurance claim
- **List My Property (property owners and managers):** https://form.jotform.com/262086165906058 — intake form to submit a furnished property for the Nova Havens network`,
  },
  {
    heading: 'Key Pages',
    rawDividerAfter: true,
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

function renderSection(section: LlmsSection): string {
  const body =
    section.content ??
    section.subsections
      ?.map((subsection) => `### ${subsection.subheading}\n\n${subsection.content}`)
      .join('\n\n') ??
    section.faqs?.map((faq) => `**${faq.q}**\n${faq.a}`).join('\n\n') ??
    '';

  return `## ${section.heading}\n\n${body}`;
}

export function renderLlmsTxt(): string {
  const renderedSections = LLMS_TXT_SECTIONS.flatMap((section) => [
    renderSection(section),
    ...(section.rawDividerAfter ? ['---'] : []),
  ]);

  return [
    LLMS_TXT_TITLE,
    LLMS_TXT_DESCRIPTION,
    '---',
    ...renderedSections,
  ].join('\n\n') + '\n';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderInlineMarkdown(value: string): string {
  return escapeHtml(value).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function renderProseHtml(content: string): string {
  return content
    .split(/\n\n+/)
    .map((block) => {
      const lines = block.split('\n');
      const firstBulletIndex = lines.findIndex((line) => line.startsWith('- '));

      if (firstBulletIndex === 0 && lines.every((line) => line.startsWith('- '))) {
        return `<ul>${lines
          .map((line) => `<li>${renderInlineMarkdown(line.slice(2))}</li>`)
          .join('')}</ul>`;
      }

      if (firstBulletIndex > -1) {
        const introduction = lines.slice(0, firstBulletIndex).join('\n');
        const bullets = lines.slice(firstBulletIndex).filter((line) => line.startsWith('- '));
        return [
          introduction ? `<p>${renderInlineMarkdown(introduction).replace(/\n/g, '<br />')}</p>` : '',
          `<ul>${bullets
            .map((line) => `<li>${renderInlineMarkdown(line.slice(2))}</li>`)
            .join('')}</ul>`,
        ].join('');
      }

      return `<p>${renderInlineMarkdown(block).replace(/\n/g, '<br />')}</p>`;
    })
    .join('\n');
}

function renderPrerenderSection(section: LlmsSection): string {
  const body =
    section.content
      ? renderProseHtml(section.content)
      : section.subsections
        ? section.subsections
          .map(
            (subsection) =>
              `<h3>${escapeHtml(subsection.subheading)}</h3>${renderProseHtml(subsection.content)}`,
          )
          .join('\n')
        : section.faqs
          ? `<dl>${section.faqs
            .map(
              (faq) =>
                `<dt>${escapeHtml(faq.q)}</dt><dd>${escapeHtml(faq.a)}</dd>`,
            )
            .join('')}</dl>`
          : '';

  return `<section><h2>${escapeHtml(section.heading)}</h2>${body}</section>`;
}

export function renderLlmsTxtPrerenderHtml(): string {
  return `<main>
  <h1>${escapeHtml(LLMS_TXT_PAGE_TITLE)}</h1>
  <p>This page is a human-readable version of the <a href="/llms.txt">/llms.txt</a> file — a machine-readable document that helps AI assistants understand Nova Havens, what we do, who we serve, and how to reach us.</p>
  <p>${escapeHtml(LLMS_TXT_PAGE_INTRO)}</p>
  ${LLMS_TXT_SECTIONS.map(renderPrerenderSection).join('\n  ')}
</main>`;
}