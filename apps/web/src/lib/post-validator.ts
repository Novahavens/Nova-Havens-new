/**
 * Pure validation of one blog post against docs/blog-automation/PLAN.md §8.
 * No imports: the n8n Code node embeds this file verbatim, and
 * scripts/validate-posts.ts runs it in CI. The enums below mirror
 * src/content/categories.ts (asserted by scripts/post-validator.test.ts).
 */
export const VALIDATOR_CATEGORIES = ['For Insurance Professionals', 'For Displaced Families', 'Market Guides'] as const;
export const VALIDATOR_MOTIFS = ['ai', 'checklist', 'house', 'paw', 'key', 'magnifier', 'map', 'gears'] as const;
export const VALIDATOR_CTAS = ['housing', 'property', 'none'] as const;
export const ALLOWED_LINK_DOMAINS = [
  'novahavens.com',
  'weather.gov',
  'fema.gov',
  'census.gov',
  'hud.gov',
  'ready.gov',
  'redcross.org',
] as const;

export const FORBIDDEN_PATTERNS: { name: string; re: RegExp }[] = [
  { name: 'property count', re: /\b\d[\d,]*\+?\s+(properties|homes|listings)\b/i },
  { name: 'coverage claim', re: /\b(your|the)\s+policy\s+(covers|will cover|pays|reimburses)\b/i },
  { name: 'carrier/adjuster audience framing', re: /\b(for|dear)\s+(adjusters|carriers)\b/i },
];

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const URL_RE = /https?:\/\/[^\s)>\]"'`]+/gi;
const FAQ_HEADING = '## Frequently Asked Questions';

export interface PostInput {
  slug: string;
  title: string;
  excerpt: string;
  keywords: string[];
  category: string;
  motif?: string;
  cta: string;
  content: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  wordCount: number;
}

function countWords(text: string): number {
  return text.split(/\s+/).filter((token) => /[A-Za-z0-9]/.test(token)).length;
}

function countFaqs(blocks: string[], faqIdx: number): number {
  let count = 0;
  for (const block of blocks.slice(faqIdx + 1)) {
    const lines = block.split('\n');
    const first = (lines[0] ?? '').trim();
    const answer = lines.slice(1).join(' ').trim();
    if (first.startsWith('**') && first.endsWith('**') && first.includes('?') && answer) count++;
  }
  return count;
}

function hostAllowed(url: string): boolean {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return false;
  }
  return ALLOWED_LINK_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

export function validatePost(post: PostInput, existingSlugs: readonly string[] = []): ValidationResult {
  const errors: string[] = [];
  const content = (post.content ?? '').trim();
  const title = post.title ?? '';
  const excerpt = post.excerpt ?? '';
  const keywords = Array.isArray(post.keywords) ? post.keywords : [];

  if (!SLUG_RE.test(post.slug ?? '')) errors.push(`slug "${post.slug}" must be kebab-case (a-z, 0-9, hyphens)`);
  if (existingSlugs.includes(post.slug)) errors.push(`slug "${post.slug}" already exists`);

  if (title.trim() === '') errors.push('title is required');
  if (title.length > 70) errors.push(`title is ${title.length} chars (max 70)`);
  if (excerpt.length < 80 || excerpt.length > 160) errors.push(`excerpt is ${excerpt.length} chars (must be 80–160)`);
  if (keywords.length < 3 || keywords.length > 8) errors.push(`keywords has ${keywords.length} items (must be 3–8)`);

  if (!(VALIDATOR_CATEGORIES as readonly string[]).includes(post.category)) {
    errors.push(`category "${post.category}" is not one of: ${VALIDATOR_CATEGORIES.join(', ')}`);
  }
  if (post.motif !== undefined && !(VALIDATOR_MOTIFS as readonly string[]).includes(post.motif)) {
    errors.push(`motif "${post.motif}" is not one of: ${VALIDATOR_MOTIFS.join(', ')}`);
  }
  if (!(VALIDATOR_CTAS as readonly string[]).includes(post.cta)) {
    errors.push(`cta "${post.cta}" is not one of: ${VALIDATOR_CTAS.join(', ')}`);
  }

  if (!content.startsWith('> ')) errors.push('content must start with a "> " quick-summary block');

  const h2s = content.split('\n').filter((line) => line.startsWith('## '));
  const questionH2s = h2s.filter((line) => line.trim().endsWith('?'));
  if (questionH2s.length < 3) errors.push(`content has ${questionH2s.length} "## ...?" headings (need at least 3)`);

  const blocks = content.split(/\n\n+/);
  const faqIdx = blocks.findIndex((block) => block.trim() === FAQ_HEADING);
  if (faqIdx === -1) {
    errors.push(`content must end with a "${FAQ_HEADING}" section`);
  } else {
    if (blocks.slice(faqIdx + 1).some((block) => block.startsWith('## '))) {
      errors.push(`"${FAQ_HEADING}" must be the last section`);
    }
    const faqCount = countFaqs(blocks, faqIdx);
    if (faqCount < 3) errors.push(`FAQ section has ${faqCount} "**Question?**" blocks with answers (need at least 3)`);
  }

  const wordCount = countWords(content);
  if (wordCount < 800 || wordCount > 1700) errors.push(`word count is ${wordCount} (must be 800–1,700)`);

  const mentions = content.match(/Nova Havens/g)?.length ?? 0;
  if (mentions < 2) errors.push(`"Nova Havens" appears ${mentions} times (need at least 2)`);
  if (!content.includes('(629) 401-0054') && !content.includes('/contact')) {
    errors.push('content must include "(629) 401-0054" or a "/contact" link');
  }

  const text = `${title}\n${excerpt}\n${content}`;
  for (const { name, re } of FORBIDDEN_PATTERNS) {
    const match = re.exec(text);
    if (match) errors.push(`forbidden ${name}: "${match[0]}"`);
  }
  for (const url of text.match(URL_RE) ?? []) {
    if (!hostAllowed(url)) errors.push(`link "${url}" is not on the allow-list (${ALLOWED_LINK_DOMAINS.join(', ')})`);
  }

  return { ok: errors.length === 0, errors, wordCount };
}
