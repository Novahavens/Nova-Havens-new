/**
 * generate-og-images.mjs
 * Generates 1200×630 Open Graph images for each blog post using ImageMagick.
 * Run: node artifacts/nova-havens/scripts/generate-og-images.mjs
 */

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Category palette — gradient stops + accent colour
const CATEGORY_STYLES = {
  'Insurance Professionals': {
    bg1: '#0F2A5C',
    bg2: '#1B3F7A',
    accent: '#4A9EDB',
    label: 'Insurance Professionals',
  },
  'Displaced Families': {
    bg1: '#0B4C43',
    bg2: '#0E6A5E',
    accent: '#3EBFAB',
    label: 'Displaced Families',
  },
  'Property Owners': {
    bg1: '#5C2B0A',
    bg2: '#7A3D10',
    accent: '#E88C3A',
    label: 'Property Owners',
  },
  'Company News': {
    bg1: '#1E1B5E',
    bg2: '#2D2A85',
    accent: '#7B75E8',
    label: 'Company News',
  },
};

const POSTS = [
  {
    slug: 'how-ai-is-streamlining-temporary-housing-placements-for-adjusters',
    category: 'Insurance Professionals',
    title: 'How AI Is Streamlining Temporary Housing Placements for Adjusters',
  },
  {
    slug: 'what-to-look-for-in-a-housing-coordinator-for-large-loss-claims',
    category: 'Insurance Professionals',
    title: 'What to Look for in a Housing Coordinator for Large-Loss Claims',
  },
  {
    slug: 'what-to-expect-when-your-insurer-places-you-in-temporary-housing',
    category: 'Displaced Families',
    title: 'What to Expect When Your Insurer Places You in Temporary Housing',
  },
  {
    slug: 'bringing-pets-to-temporary-housing-what-you-need-to-know',
    category: 'Displaced Families',
    title: 'Bringing Pets to Temporary Housing: What You Need to Know',
  },
  {
    slug: 'how-to-list-your-furnished-property-with-nova-havens',
    category: 'Property Owners',
    title: 'How to List Your Furnished Property with Nova Havens',
  },
  {
    slug: 'what-insurance-housing-coordinators-look-for-in-a-property',
    category: 'Property Owners',
    title: 'What Insurance Housing Coordinators Look for in a Property',
  },
  {
    slug: 'nova-havens-expands-to-48-states',
    category: 'Company News',
    title: 'Nova Havens Expands to 48 States',
  },
  {
    slug: 'introducing-automated-claim-processing-at-nova-havens',
    category: 'Company News',
    title: 'Introducing Automated Claim Processing at Nova Havens',
  },
];

/** Wrap title into lines of at most maxLen chars, breaking on spaces. */
function wrapTitle(title, maxLen = 36) {
  const words = title.split(' ');
  const lines = [];
  let current = '';
  for (const w of words) {
    if (!current) {
      current = w;
    } else if ((current + ' ' + w).length <= maxLen) {
      current += ' ' + w;
    } else {
      lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function xmlEscape(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateSvg(post, style) {
  const lines = wrapTitle(post.title, 36);
  const lineHeight = 62;
  // Vertically center the title block
  const totalTitleHeight = lines.length * lineHeight;
  const titleStartY = 315 - totalTitleHeight / 2 + 50; // nudge down slightly for logo above

  const titleElements = lines
    .map(
      (line, i) =>
        `  <text x="80" y="${titleStartY + i * lineHeight}" font-family="DejaVu Sans Bold" font-size="50" font-weight="bold" fill="#FFFFFF" opacity="0.97">${xmlEscape(line)}</text>`,
    )
    .join('\n');

  const wordmarkY = titleStartY - 145;
  const badgeWidth = Math.min(style.label.length * 11 + 28, 440);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${style.bg1}"/>
      <stop offset="100%" stop-color="${style.bg2}"/>
    </linearGradient>
    <pattern id="lines" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="60" stroke="${style.accent}" stroke-width="0.6" opacity="0.10"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#lines)"/>

  <!-- Left accent bar -->
  <rect x="0" y="0" width="6" height="630" fill="${style.accent}" opacity="0.85"/>

  <!-- Bottom strip -->
  <rect x="0" y="596" width="1200" height="34" fill="${style.accent}" opacity="0.12"/>

  <!-- Nova Havens wordmark -->
  <text x="80" y="${wordmarkY}" font-family="DejaVu Sans Bold" font-size="26" font-weight="bold" fill="${style.accent}" letter-spacing="4">NOVA HAVENS</text>

  <!-- Separator -->
  <rect x="80" y="${wordmarkY + 14}" width="56" height="3" fill="${style.accent}" opacity="0.65"/>

  <!-- Category badge -->
  <rect x="78" y="${wordmarkY + 28}" width="${badgeWidth}" height="34" rx="4" fill="${style.accent}" opacity="0.18"/>
  <text x="90" y="${wordmarkY + 51}" font-family="DejaVu Sans" font-size="19" fill="${style.accent}" opacity="0.92">${xmlEscape(style.label)}</text>

  <!-- Post title lines -->
${titleElements}

  <!-- Domain — bottom right -->
  <text x="1120" y="618" font-family="DejaVu Sans" font-size="17" fill="#FFFFFF" opacity="0.38" text-anchor="end">novahavens.com</text>
</svg>`;
}

mkdirSync(publicDir, { recursive: true });

let generated = 0;
for (const post of POSTS) {
  const style = CATEGORY_STYLES[post.category];
  if (!style) {
    console.warn(`  ⚠  Unknown category "${post.category}" for "${post.slug}" — skipping`);
    continue;
  }

  const outFile = join(publicDir, `og-blog-${post.slug}.png`);

  if (existsSync(outFile)) {
    console.log(`  –  og-blog-${post.slug}.png (already exists, skipping)`);
    generated++;
    continue;
  }

  const svgContent = generateSvg(post, style);
  const tmpSvg = `/tmp/og-${post.slug}.svg`;

  writeFileSync(tmpSvg, svgContent, 'utf-8');

  try {
    execSync(
      `magick -density 96 -background none "${tmpSvg}" -resize 1200x630! "${outFile}"`,
      { stdio: 'pipe' },
    );
    console.log(`  ✓  og-blog-${post.slug}.png`);
    generated++;
  } catch (err) {
    console.error(`  ✗  ${post.slug}: ${err.stderr?.toString() || err.message}`);
  }
}

console.log(`\nDone — ${generated}/${POSTS.length} images ready in public/`);
