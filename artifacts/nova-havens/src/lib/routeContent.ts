/**
 * routeContent.ts — static body HTML for pre-rendered routes.
 *
 * Returns semantic HTML to inject into <div id="root"> during prerender.
 * React replaces this content on hydration; it exists purely for crawlers
 * (GPTBot, ClaudeBot, Googlebot, social bots) that do not execute JavaScript.
 *
 * Rules:
 *  - No browser APIs, no React — must run safely in Node.js.
 *  - Plain semantic HTML only; no Tailwind classes needed (crawlers ignore CSS).
 *  - Keep it concise but content-complete: every H1, key body paragraphs,
 *    list items, and article text must appear so crawlers can index them.
 */

import { BLOG_POSTS } from '../data/blogPosts.ts';
import { renderLlmsTxtPrerenderHtml } from '../data/llmsContent.ts';
import { TEAM_MEMBERS, type TeamMemberProfile } from '../data/teamMembers.ts';
import { INTAKE_FORMS } from './intakeForms.ts';

// ── Helpers ────────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Convert the blog post `content` string (uses **bold**, *italic*, and
 * "- bullet" markers) into plain semantic HTML paragraphs and lists.
 * This mirrors the logic in BlogPostPage.tsx → renderContent().
 */
function contentToHtml(text: string): string {
  const blocks = text.split(/\n\n+/);
  const parts: string[] = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    const firstBulletIdx = lines.findIndex((l) => l.startsWith('- '));

    // ── ## H2 heading (all post H2s are phrased as questions)
    if (lines.length === 1 && block.startsWith('## ')) {
      parts.push(`<h2>${esc(block.slice(3))}</h2>`);
      continue;
    }

    // ── ### H3 heading
    if (lines.length === 1 && block.startsWith('### ')) {
      parts.push(`<h3>${esc(block.slice(4))}</h3>`);
      continue;
    }

    // ── Blockquote: the first block of every post is the "Quick summary"
    //    callout — strip the "> " markers and emit a labelled summary block.
    if (lines.every((l) => l.startsWith('> '))) {
      const body = lines.map((l) => `<p>${inlineToHtml(l.slice(2))}</p>`).join('');
      parts.push(`<blockquote><p><strong>Quick summary</strong></p>${body}</blockquote>`);
      continue;
    }

    // Pure heading block: **Heading** alone on one line
    if (
      lines.length === 1 &&
      block.startsWith('**') &&
      block.endsWith('**') &&
      block.indexOf('**', 2) === block.length - 2
    ) {
      parts.push(`<h3>${esc(block.slice(2, -2))}</h3>`);
      continue;
    }

    // Heading + optional body on following lines
    if (lines[0].startsWith('**') && lines[0].endsWith('**')) {
      const heading = lines[0].slice(2, -2);
      const body = lines.slice(1).join('\n').trim();
      parts.push(
        `<h3>${esc(heading)}</h3>${body ? `<p>${inlineToHtml(body)}</p>` : ''}`,
      );
      continue;
    }

    // No bullets → plain paragraph
    if (firstBulletIdx === -1) {
      parts.push(`<p>${inlineToHtml(block)}</p>`);
      continue;
    }

    // Bullets, possibly with intro text before first bullet
    const introLines = lines.slice(0, firstBulletIdx);
    const bulletLines = lines.slice(firstBulletIdx).filter((l) => l.startsWith('- '));

    const intro =
      introLines.length > 0 ? `<p>${inlineToHtml(introLines.join('\n'))}</p>` : '';
    const listItems = bulletLines
      .map((item) => `<li>${inlineToHtml(item.slice(2))}</li>`)
      .join('');
    parts.push(`${intro}<ul>${listItems}</ul>`);
  }

  return parts.join('\n');
}

/** Convert **bold** and *italic* markers to <strong>/<em>. */
function inlineToHtml(s: string): string {
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

// ── Per-route static HTML ──────────────────────────────────────────────────

const HOME_HTML = `
<main>
  <section>
    <h1>A safe place to land, fast.</h1>
    <p>Nova Havens places displaced families into fully furnished homes nationwide — coordinated with insurance carriers and relocation specialists from the first call.</p>
    <ul>
      <li>20,000+ verified homes nationwide</li>
      <li>531+ families assisted this year</li>
      <li>Average placement in under 5 days</li>
    </ul>
  </section>

  <section>
    <h2>Why Choose Nova Havens</h2>
    <article>
      <h3>Rapid Placements</h3>
      <p>Nova Havens has embraced automation and agentic technologies that allow us to process claims rapidly with precision.</p>
    </article>
    <article>
      <h3>One Team, One Point of Contact</h3>
      <p>Our team handles every step of the family's journey in-house — from processing the claim to delivering housing options and managing the stay. There is always a point of contact.</p>
    </article>
    <article>
      <h3>Vetted Nationwide Network</h3>
      <p>Our housing network is purpose-built for insurance workflows, with verified furnished properties across the country ready for immediate placement.</p>
    </article>
    <article>
      <h3>Care, Not Just Logistics</h3>
      <p>We treat every placement as a human moment — not a transaction. Families in crisis deserve compassion, clarity, and a home that actually feels like home.</p>
    </article>
  </section>

  <section>
    <h2>Our Mission — A home when you need it most</h2>
    <p>Nova Havens was built to provide prompt, compassionate relocation for families displaced by water, fire, or mold damage. We understand that losing your home — even temporarily — is one of the most disorienting experiences a family can face.</p>
    <p>That's why we work directly with insurance carriers, adjusters, and relocation specialists to make the transition as seamless as possible. From the first call to the last day of the stay, we're with you every step of the way.</p>
  </section>

  <section>
    <h2>The Nova Havens Experience — Everything a family needs to feel at home</h2>
    <ul>
      <li><strong>Cozy Bedding</strong> — Every home is furnished with quality linens and bedding so families can rest from the first night.</li>
      <li><strong>Entertainment</strong> — Streaming-ready TVs, high-speed internet, and fully equipped living spaces keep families connected and comfortable.</li>
      <li><strong>Seamless Transition</strong> — We coordinate move-in logistics directly with carriers and adjusters so families focus on healing, not paperwork.</li>
      <li><strong>Pet Friendly</strong> — We know pets are family too. Many of our properties welcome furry companions.</li>
      <li><strong>24/7 Support</strong> — Our team is reachable around the clock. Whether it's a maintenance issue or a last-minute question, we're a call away.</li>
      <li><strong>Nationwide Network</strong> — With verified homes across every major metro and many rural areas, we place families close to their community.</li>
    </ul>
  </section>

  <section>
    <h2>Pet-Friendly Properties — Your furry friends are welcome</h2>
    <p>We know that pets are part of the family. Nova Havens maintains a growing network of verified pet-friendly furnished homes, so displaced families never have to choose between a safe place to stay and bringing their beloved companions along.</p>
  </section>

  <section>
    <h2>Where We Operate</h2>
    <ul>
      <li>12,000+ active properties</li>
      <li>48 states covered</li>
      <li>Average placement in under 5 days</li>
    </ul>
  </section>

  <section>
    <h2>How It Works</h2>

    <h3>For Adjusters &amp; Carriers</h3>
    <ol>
      <li><strong>Submit a Claim</strong> — Share the claim details with our team via phone or portal.</li>
      <li><strong>Review Placement Options</strong> — We surface verified homes within your parameters within hours.</li>
      <li><strong>Approve &amp; Coordinate</strong> — We handle all logistics with the family directly.</li>
    </ol>

    <h3>For Displaced Families</h3>
    <ol>
      <li><strong>Receive Your Options</strong> — Your adjuster or carrier connects you with Nova Havens.</li>
      <li><strong>Choose Your Home</strong> — Browse furnished options matched to your family's needs.</li>
      <li><strong>Move In</strong> — We coordinate move-in logistics so you can focus on what matters.</li>
    </ol>

    <h3>For Property Owners</h3>
    <ol>
      <li><strong>Submit Your Property</strong> — Tell us about your furnished home and availability.</li>
      <li><strong>Get Verified</strong> — We inspect and onboard your property into our network.</li>
      <li><strong>Start Hosting</strong> — We match you with families and handle all coordination.</li>
    </ol>
  </section>

  <section>
    <h2>Trusted Partnerships</h2>
    <p>Nova Havens works alongside the nation's leading insurance carriers, including Allstate, Travelers, Farmers Insurance, and State Farm.</p>
  </section>
</main>
`;

const BLOG_INDEX_HTML = (() => {
  const postItems = BLOG_POSTS.map(
    (post) => `
    <article>
      <header>
        <span>${esc(post.category)}</span>
        <time datetime="${esc(post.dateISO)}">${esc(post.date)}</time>
      </header>
      <h2><a href="/blog/${esc(post.slug)}">${esc(post.title)}</a></h2>
      <p>${esc(post.excerpt)}</p>
    </article>`,
  ).join('\n');

  return `
<main>
  <section>
    <h1>Insights &amp; Resources</h1>
    <p>Industry knowledge for insurance professionals, displaced families, and property owners — from the Nova Havens team.</p>
  </section>
  <section>
    ${postItems}
  </section>
</main>
`;
})();

function buildBlogPostHtml(slug: string): string {
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) {
    return `<main><h1>Post Not Found</h1><p>This article doesn't exist or may have moved.</p><a href="/blog">Back to Blog</a></main>`;
  }

  // Closing CTA must match BlogPostPage.tsx: 'housing' and 'property' posts
  // get the labelled JotForm button + phone link; 'none' gets no card at all.
  const ctaFooter =
    post.cta === 'none'
      ? ''
      : `    <footer>
      <h2>${post.cta === 'property' ? 'Own a furnished property?' : 'Need housing assistance now?'}</h2>
      <p>${
        post.cta === 'property'
          ? 'Join the Nova Havens network and host insurance-displaced families in your area.'
          : 'Our team is available 24/7 for emergency claims and placements nationwide.'
      }</p>
      <p><a href="${esc(
        post.cta === 'property' ? INTAKE_FORMS.property : INTAKE_FORMS.housing,
      )}">${post.cta === 'property' ? 'Submit your property' : 'Submit a housing request'}</a></p>
      <p>Call us: <a href="tel:+16294010054">(629) 401-0054</a></p>
    </footer>`;

  return `
<main>
  <article>
    <header>
      <span>${esc(post.category)}</span>
      <time datetime="${esc(post.dateISO)}">${esc(post.date)}</time>
      <h1>${esc(post.title)}</h1>
      <p>${esc(post.excerpt)}</p>
    </header>
    <section>
      ${contentToHtml(post.content)}
    </section>
${ctaFooter}
  </article>
</main>
`;
}

const ABOUT_HTML = `
<main>
  <section>
    <h1>A better place to land when life is turned upside down.</h1>
    <p>Nova Havens coordinates furnished housing for families displaced by property loss — bringing compassion, clarity, and dependable execution to an experience that is anything but simple.</p>
  </section>

  <section>
    <h2>Why We Exist — The logistics matter. So does how people feel.</h2>
    <p>A fire, flood, or other covered loss can disrupt every part of a family's life at once. Finding somewhere to sleep is only the beginning. Families need a place that works for their routines, their pets, their schools, and their sense of normal.</p>
    <p>We built Nova Havens to make that transition easier. Our team connects insurance professionals and displaced households with thoughtfully furnished homes, then stays close to the details until the placement is complete.</p>
    <blockquote>"Make the next step feel possible."</blockquote>
    <ul>
      <li>Nationwide furnished housing coordination</li>
      <li>A single point of contact for every placement</li>
      <li>Proactive updates for adjusters and families</li>
      <li>Pet-friendly, accessible, and family-ready options</li>
    </ul>
  </section>

  <section>
    <h2>The Principles Behind Every Placement</h2>
    <article>
      <h3>Human before housing</h3>
      <p>A temporary home is more than an address. We listen for the details that make a place feel steady, familiar, and safe.</p>
    </article>
    <article>
      <h3>Built for the claim</h3>
      <p>Our coordination is designed around the pace, documentation, and accountability insurance teams need to keep claims moving.</p>
    </article>
    <article>
      <h3>Quality you can feel</h3>
      <p>Every property in our network is selected with comfort, cleanliness, location, and real-life household needs in mind.</p>
    </article>
    <article>
      <h3>One connected team</h3>
      <p>Families, carriers, adjusters, and property owners get one responsive partner from the first call through move-out.</p>
    </article>
  </section>
</main>
`;

const TEAM_HTML = `
<main>
  <section>
    <h1>Meet the Nova Havens Team</h1>
    <p>The coordinators, carrier specialists, and family advocates behind our nationwide furnished housing network.</p>
  </section>

  <section>
    <h2>Our Team</h2>
${TEAM_MEMBERS.map((member) => {
  const profileLabels: [keyof TeamMemberProfile, string][] = [
    ['help', 'How I help our clients'],
    ['favouritePart', 'My favourite part of working here'],
    ['foods', 'Favourite foods'],
    ['laugh', 'Guaranteed to make me laugh'],
    ['spareTime', 'In my spare time'],
  ];
  const profileHtml = `\n      <dl>\n${profileLabels
    .map(
      ([key, label]) =>
        `        <dt>${label}</dt>\n        <dd>${esc(member.profile[key])}</dd>`,
    )
    .join('\n')}\n      </dl>`;
  return `    <article>
      <h3>${esc(member.name)}${member.role ? ` — ${esc(member.role)}` : ''}</h3>${profileHtml}
    </article>`;
}).join('\n')}
  </section>

  <section>
    <h2>Our Values</h2>
    <article>
      <h3>Families first</h3>
      <p>Every placement decision starts with the household — their needs, their pets, their routines.</p>
    </article>
    <article>
      <h3>Around the clock</h3>
      <p>Disasters don't keep business hours. Neither do we — our team is reachable 24/7 for emergency claims.</p>
    </article>
    <article>
      <h3>Carrier-grade rigor</h3>
      <p>Clean documentation, transparent pricing, and proactive updates on every file, every time.</p>
    </article>
  </section>
</main>
`;

const CONTACT_HTML = `
<main>
  <section>
    <h1>Get in Touch</h1>
    <p>Have a question? We're here to help. Available 24/7 for emergency claims and placements.</p>
  </section>
  <section>
    <h2>Contact Information</h2>
    <ul>
      <li>Phone: <a href="tel:+16294010054">(629) 401-0054</a></li>
      <li>Email: <a href="mailto:info@novahavens.com">info@novahavens.com</a></li>
      <li>Location: Nashville, TN — serving all 48 contiguous states</li>
    </ul>
    <h2>How Can We Help?</h2>
    <p>Whether you're an insurance adjuster coordinating a temporary housing placement, a family displaced by a covered loss, or a property owner interested in joining our network — we'd love to hear from you.</p>
  </section>
</main>
`;

const PRIVACY_HTML = `
<main>
  <h1>Privacy Policy</h1>
  <p>This Privacy Policy describes how Nova Havens collects, uses, and protects your personal information when you use our website and housing coordination services.</p>
  <p>For questions about this policy, contact us at <a href="mailto:info@novahavens.com">info@novahavens.com</a> or call <a href="tel:+16294010054">(629) 401-0054</a>.</p>
</main>
`;

const TERMS_HTML = `
<main>
  <h1>Terms of Service</h1>
  <p>These Terms of Service govern your use of the Nova Havens website and housing coordination services. By accessing or using our services, you agree to these terms.</p>
  <p>For questions about these terms, contact us at <a href="mailto:info@novahavens.com">info@novahavens.com</a> or call <a href="tel:+16294010054">(629) 401-0054</a>.</p>
</main>
`;

const LLMS_TXT_HTML = renderLlmsTxtPrerenderHtml();

// ── Exports ────────────────────────────────────────────────────────────────

const STATIC_CONTENT: Record<string, string> = {
  '/': HOME_HTML,
  '/blog': BLOG_INDEX_HTML,
  '/about-us': ABOUT_HTML,
  '/meet-the-team': TEAM_HTML,
  '/contact': CONTACT_HTML,
  '/privacy-policy': PRIVACY_HTML,
  '/terms-of-service': TERMS_HTML,
  '/llms-txt': LLMS_TXT_HTML,
};

/**
 * Returns static HTML to inject into <div id="root"> for a given pathname.
 * Returns null for routes that have no static content to inject.
 */
export function getRouteBodyHtml(pathname: string): string | null {
  const p = pathname === '/' ? '/' : pathname.replace(/\/+$/, '').toLowerCase();

  // Static routes
  if (p in STATIC_CONTENT) return STATIC_CONTENT[p];

  // Blog post routes: /blog/:slug
  const blogMatch = p.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) {
    return buildBlogPostHtml(blogMatch[1]);
  }

  return null;
}
