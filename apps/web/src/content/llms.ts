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

const LLMS_TXT_DESCRIPTION = `> Nova Havens coordinates furnished temporary housing across the United States for households displaced by fire, water or mold damage, and maintains a network of property owners. Nova Havens operates across all ${SERVICE_AREA.usName}. It is not an insurance company and does not underwrite policies or make coverage determinations.`;

/**
 * The AI index lists articles by slug (rather than spreading BLOG_POSTS) so a
 * new post must be deliberately added here before it appears in llms.txt.
 */
const LLMS_BLOG_POSTS: { slug: string; description: string }[] = [
  {
    slug: 'details-that-speed-up-housing-placement',
    description:
      'Answers which information insurance professionals should provide to reduce delays in a housing request.',
  },
  {
    slug: 'hotel-or-furnished-home-adjusters-guide',
    description: 'Answers how adjusters can compare hotels and furnished homes for temporary housing placements.',
  },
  {
    slug: 'hotel-or-furnished-home-what-to-expect',
    description: 'Answers what displaced households can expect from a hotel stay or a furnished home.',
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
    content: `- [Homepage](${SITE_URL}/) — Coordinates furnished temporary housing and provides current information about Nova Havens services, properties, and contact routes.
- [About Nova Havens](${SITE_URL}/about-us) — Contains a canonical factual overview of the company and its work.
- [Meet the team](${SITE_URL}/meet-the-team) — Introduces the coordinators who manage placements.
- [Contact](${SITE_URL}/contact) — Provides general contact details, urgent phone access, and the contact form.`,
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
    content: `The blog is organised into three topic areas: guidance for insurance professionals, guidance for displaced families, and market guides.

${BLOG_ARTICLE_LINKS}`,
  },
  {
    heading: 'Common questions',
    content: `The site has an FAQ for families who need temporary housing. See the [FAQ on the homepage](${SITE_URL}/).

Questions cover placement timing, who requests housing, what a furnished home includes, pets, school or medical location needs, accessibility, extensions, what to bring, and support after move-in.

Questions about what an individual insurance policy covers, coverage limits, or how long coverage lasts should be directed to the policyholder's own insurance carrier or adjuster. Nova Havens does not make those determinations.`,
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
