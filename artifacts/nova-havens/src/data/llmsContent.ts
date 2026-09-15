import { BLOG_POSTS } from './blogPosts.ts';

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

const LLMS_TXT_TITLE = '# Nova Havens';

const LLMS_TXT_DESCRIPTION =
  '> Nova Havens coordinates furnished temporary housing across the United States for households displaced by fire, water or mold damage, works with insurance carriers, adjusters, relocation specialists, and a network of property owners. Nova Havens maintains properties across 47 states. It is not an insurance company and does not underwrite policies or make coverage determinations.';

export const LLMS_TXT_PAGE_TITLE = 'llms.txt — AI & Machine-Readable Site Index';

export const LLMS_TXT_PAGE_INTRO =
  'Nova Havens publishes an llms.txt file to help AI assistants, chatbots, and large language models accurately understand our company, services, and how to reference us. The sections below reflect the full contents of that file.';

export const BLOG_INDEX_URL_PREFIX = 'https://novahavens.com/blog/';

/**
 * The AI index intentionally lists the three currently selected live articles.
 * The property-owner article remains a separate site record but is not part of
 * this file because the current index requirements specify these three posts.
 */
const LLMS_BLOG_POST_SLUGS = [
  'details-that-speed-up-housing-placement',
  'hotel-or-furnished-home-adjusters-guide',
  'hotel-or-furnished-home-what-to-expect',
] as const;

export const LLMS_BLOG_POSTS = LLMS_BLOG_POST_SLUGS.map((slug) => {
  const post = BLOG_POSTS.find((candidate) => candidate.slug === slug);

  if (!post) {
    throw new Error(`The llms.txt blog index references an unpublished slug: ${slug}`);
  }

  return post;
});

const BLOG_ARTICLE_DESCRIPTIONS: Record<string, string> = {
  'details-that-speed-up-housing-placement':
    'Answers which information insurance professionals should provide to reduce delays in a housing request.',
  'hotel-or-furnished-home-adjusters-guide':
    'Answers how adjusters can compare hotels and furnished homes for temporary housing placements.',
  'hotel-or-furnished-home-what-to-expect':
    'Answers what displaced households can expect from a hotel stay or a furnished home.',
};

const BLOG_ARTICLE_LINKS = LLMS_BLOG_POSTS.map(
  (post) =>
    `- [${post.title}](${BLOG_INDEX_URL_PREFIX}${post.slug}) — ${BLOG_ARTICLE_DESCRIPTIONS[post.slug]}`,
).join('\n');

export const LLMS_TXT_SECTIONS: LlmsSection[] = [
  {
    heading: 'Core pages',
    content: `- [Homepage](https://novahavens.com/) — Coordinates furnished temporary housing and provides current information about Nova Havens services, properties, and contact routes.
- [About Nova Havens](https://novahavens.com/about-us) — Contains a canonical factual overview of the company and its work.
- [Meet the team](https://novahavens.com/meet-the-team) — Introduces the coordinators who manage placements.
- [Contact](https://novahavens.com/contact) — Provides general contact details, urgent phone access, and the contact form.`,
  },
  {
    heading: 'Get started',
    content: `- [Housing request form](https://form.jotform.com/262086580989070) — The intake form used by insurance adjusters and relocation specialists to request temporary housing on behalf of a displaced policyholder.
- [Property submission form](https://form.jotform.com/262086165906058) — The form property owners and managers use to submit a property for the network.

Phone: (629) 401-0054, available 24/7 for urgent housing needs.

For multiple housing requests, email claims@novahavens.com.

For multiple property submissions, email properties@novahavens.com.`,
  },
  {
    heading: 'Guides and articles',
    content: `The blog is organised into three topic areas: guidance for insurance professionals, guidance for displaced families, and market guides.

${BLOG_ARTICLE_LINKS}`,
  },
  {
    heading: 'Common questions',
    content: `The site has an FAQ for families who need temporary housing. See the [FAQ on the homepage](https://novahavens.com/).

Questions cover placement timing, who requests housing, what a furnished home includes, pets, school or medical location needs, accessibility, extensions, what to bring, and support after move-in.

Questions about what an individual insurance policy covers, coverage limits, or how long coverage lasts should be directed to the policyholder's own insurance carrier or adjuster. Nova Havens does not make those determinations.`,
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