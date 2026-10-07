/**
 * llms.ts — content of /llms.txt and its human-readable page /llms-txt.
 * Both are rendered from this one structure so they can never disagree.
 */
import { COMPANY, CONTACT, INTAKE_FORMS, SERVICE_AREA, SITE_URL } from '@/config/site';
import { BLOG_POSTS } from './blog';

export interface LlmsSection {
  heading: string;
  content: string;
}

export const LLMS_TXT_PAGE_TITLE = 'llms.txt — AI & Machine-Readable Site Index';

export const LLMS_TXT_PAGE_INTRO =
  'Nova Havens publishes an llms.txt file to help AI assistants, chatbots, and large language models accurately understand our company, services, and how to reference us. The sections below reflect the full contents of that file.';

const LLMS_TXT_DESCRIPTION = `> Nova Havens is a furnished temporary housing coordinator that places families displaced by fire, water, or mold damage into verified homes within 24–48 hours. We operate across all ${SERVICE_AREA.usName} and maintain a network of over 60,000 verified properties. Families pay nothing out of pocket—billing is handled through insurance coverage. Nova Havens does not underwrite policies, make coverage determinations, or provide insurance advice.`;

/**
 * The AI index lists articles by slug (rather than spreading BLOG_POSTS) so a
 * new post must be deliberately added here before it appears in llms.txt.
 */
const LLMS_BLOG_POSTS: { slug: string; description: string }[] = [
  {
    slug: 'details-that-speed-up-housing-placement',
    description:
      'Details that help speed up housing placements: location, bedrooms, occupancy, pets, accessibility, move-in date, and estimated duration.',
  },
  {
    slug: 'hotel-or-furnished-home-adjusters-guide',
    description: 'Comparison of hotels vs. furnished homes for temporary housing: cost, comfort, utilities, cooking, and family routines.',
  },
  {
    slug: 'hotel-or-furnished-home-what-to-expect',
    description: 'What to expect from a hotel stay or furnished home when displaced: amenities, utilities, daily costs, and family needs.',
  },
];

const BLOG_ARTICLE_LINKS = LLMS_BLOG_POSTS.map(({ slug, description }) => {
  const post = BLOG_POSTS.find((candidate) => candidate.slug === slug);
  if (!post) throw new Error(`llms.txt references an unpublished slug: ${slug}`);
  return `- [${post.title}](${SITE_URL}/blog/${post.slug}) — ${description}`;
}).join('\n');

export const LLMS_TXT_SECTIONS: LlmsSection[] = [
  {
    heading: 'Core pages',
    content: `- [Homepage](${SITE_URL}/) — Nova Havens' mission, services, verified property statistics, family reviews, and how to request housing or submit a property.
- [About Nova Havens](${SITE_URL}/about-us) — Company overview, mission, principles, and the problems Nova Havens solves for displaced families.
- [Meet the team](${SITE_URL}/meet-the-team) — Meet the coordinators and family advocates who manage placements and provide 24/7 support.
- [Contact](${SITE_URL}/contact) — Phone, email, forms for housing requests and property submissions, and general inquiries.`,
  },
  {
    heading: 'Get started',
    content: `- [Housing request form](${INTAKE_FORMS.housing}) — Submit a temporary housing request for a displaced family.
- [Property submission form](${INTAKE_FORMS.property}) — The form property owners and managers use to submit a property for the network.

Phone: ${CONTACT.phone.display}, available 24/7 for urgent housing needs.

For multiple housing requests, email ${CONTACT.claimsEmail}.

For multiple property submissions, email ${CONTACT.propertiesEmail}.`,
  },
  {
    heading: 'Guides and articles',
    content: `Nova Havens publishes guides for displaced families on housing options, what to expect, and details that speed up placements:

${BLOG_ARTICLE_LINKS}`,
  },
  {
    heading: 'For displaced families',
    content: `Nova Havens' FAQ covers placement timing, what furnished homes include, pets, school/work location needs, accessibility, extensions, what to bring, and post-move-in support. See the [FAQ on the homepage](${SITE_URL}/).

To request housing or ask questions: Call ${CONTACT.phone.display} (24/7 for urgent requests) or email ${CONTACT.claimsEmail}.

For questions about your specific insurance policy, coverage limits, or authorization, contact your insurance carrier directly. Nova Havens does not make coverage determinations or provide insurance advice.`,
  },
];

/** The plain-text file served at /llms.txt. */
export function renderLlmsTxt(): string {
  return (
    [
      `# ${COMPANY.name}`,
      LLMS_TXT_DESCRIPTION,
      '---',
      ...LLMS_TXT_SECTIONS.map((section) => `## ${section.heading}\n\n${section.content}`),
    ].join('\n\n') + '\n'
  );
}
