// Generates 1200x630 OG images for each blog post into public/og-blog-<slug>.png
// Brand: dark bg #0A0C10, gold #D4A24C, Plus Jakarta Sans.
// Post list is derived from src/data/blogPosts.ts (run with --experimental-strip-types)
// so adding a post there is the only step needed — the image is generated automatically.
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { BLOG_POSTS } from "../src/data/blogPosts.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

const GOLD = "#D4A24C";
const BG = "#0A0C10";
const CARD = "#111318";
const FG = "#F5F5F2";
const MUTED = "#9BA3AF";

// Topic-specific motif drawn in the right half, in gold with low opacity.
const motifs = {
  ai: `
    <g stroke="${GOLD}" stroke-width="3" fill="none">
      <circle cx="900" cy="200" r="16" fill="${GOLD}"/>
      <circle cx="1040" cy="300" r="16" fill="${GOLD}"/>
      <circle cx="880" cy="420" r="16" fill="${GOLD}"/>
      <circle cx="1060" cy="480" r="16" fill="${GOLD}"/>
      <circle cx="980" cy="120" r="10" fill="${GOLD}"/>
      <line x1="900" y1="200" x2="1040" y2="300"/>
      <line x1="1040" y1="300" x2="880" y2="420"/>
      <line x1="880" y1="420" x2="1060" y2="480"/>
      <line x1="980" y1="120" x2="900" y2="200"/>
      <line x1="980" y1="120" x2="1040" y2="300"/>
    </g>`,
  checklist: `
    <g stroke="${GOLD}" stroke-width="6" fill="none" stroke-linecap="round">
      <rect x="860" y="150" width="260" height="340" rx="20" stroke-width="4"/>
      <polyline points="895,230 915,252 955,208"/>
      <line x1="985" y1="230" x2="1090" y2="230"/>
      <polyline points="895,320 915,342 955,298"/>
      <line x1="985" y1="320" x2="1090" y2="320"/>
      <circle cx="915" cy="420" r="16" stroke-width="4"/>
      <line x1="985" y1="420" x2="1090" y2="420"/>
    </g>`,
  house: `
    <g stroke="${GOLD}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 850 330 L 990 210 L 1130 330"/>
      <path d="M 880 310 L 880 470 L 1100 470 L 1100 310"/>
      <rect x="955" y="370" width="70" height="100"/>
      <circle cx="990" cy="160" r="18"/>
    </g>`,
  paw: `
    <g fill="${GOLD}">
      <ellipse cx="990" cy="380" rx="58" ry="50"/>
      <ellipse cx="915" cy="290" rx="26" ry="34" transform="rotate(-20 915 290)"/>
      <ellipse cx="965" cy="245" rx="26" ry="34" transform="rotate(-7 965 245)"/>
      <ellipse cx="1025" cy="245" rx="26" ry="34" transform="rotate(7 1025 245)"/>
      <ellipse cx="1075" cy="290" rx="26" ry="34" transform="rotate(20 1075 290)"/>
    </g>`,
  key: `
    <g stroke="${GOLD}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="920" cy="250" r="60"/>
      <circle cx="920" cy="250" r="24"/>
      <line x1="963" y1="292" x2="1090" y2="420"/>
      <line x1="1040" y1="370" x2="1005" y2="405"/>
      <line x1="1090" y1="420" x2="1055" y2="455"/>
    </g>`,
  magnifier: `
    <g stroke="${GOLD}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="950" cy="280" r="85"/>
      <line x1="1012" y1="342" x2="1110" y2="440"/>
      <path d="M 910 300 L 950 265 L 990 300 M 922 292 L 922 330 L 978 330 L 978 292"/>
    </g>`,
  map: `
    <g fill="${GOLD}">
      ${Array.from({ length: 20 }, (_, i) => {
        const x = 860 + (i % 5) * 65;
        const y = 200 + Math.floor(i / 5) * 75;
        return `<path transform="translate(${x} ${y}) scale(1.1)" d="M0,-14 L4,-4 L15,-4 L6,3 L9,14 L0,7 L-9,14 L-6,3 L-15,-4 L-4,-4 Z"/>`;
      }).join("")}
    </g>`,
  gears: `
    <g stroke="${GOLD}" stroke-width="6" fill="none" stroke-linecap="round">
      <circle cx="930" cy="270" r="62"/>
      <circle cx="930" cy="270" r="24"/>
      ${Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        const x1 = 930 + 62 * Math.cos(a), y1 = 270 + 62 * Math.sin(a);
        const x2 = 930 + 82 * Math.cos(a), y2 = 270 + 82 * Math.sin(a);
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
      }).join("")}
      <circle cx="1065" cy="410" r="42"/>
      <circle cx="1065" cy="410" r="16"/>
      ${Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4 + 0.4;
        const x1 = 1065 + 42 * Math.cos(a), y1 = 410 + 42 * Math.sin(a);
        const x2 = 1065 + 58 * Math.cos(a), y2 = 410 + 58 * Math.sin(a);
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
      }).join("")}
    </g>`,
};

// Posts may declare a `motif` field in blogPosts.ts; posts without one
// fall back to a motif chosen by category, so new posts never block the build.
const motifByCategory = {
  "Insurance Professionals": "checklist",
  "Displaced Families": "house",
  "Property Owners": "key",
  "Company News": "map",
};

// Wrap a title into up to `maxLines` lines of roughly `maxChars` characters.
function wrapTitle(title, maxChars = 28, maxLines = 3) {
  const words = title.split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    if (current && (current + " " + word).length > maxChars) {
      lines.push(current);
      current = word;
    } else {
      current = current ? current + " " + word : word;
    }
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) {
    lines[maxLines - 1] = lines.slice(maxLines - 1).join(" ");
    lines.length = maxLines;
  }
  return lines;
}

// Fail loudly when a post declares a motif that isn't drawn above —
// silent fallback to the category default hides typos and missing artwork.
const unknownMotifs = BLOG_POSTS.filter((p) => p.motif && !motifs[p.motif]);
if (unknownMotifs.length > 0) {
  for (const p of unknownMotifs) {
    console.error(
      `Unknown motif "${p.motif}" on post "${p.slug}". Known motifs: ${Object.keys(motifs).join(", ")}`,
    );
  }
  process.exit(1);
}

const posts = BLOG_POSTS.map((p) => ({
  slug: p.slug,
  category: p.category,
  motif: p.motif ?? motifByCategory[p.category] ?? "house",
  lines: wrapTitle(p.title),
}));

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function svgFor(post) {
  const titleY = post.lines.length === 2 ? 330 : 300;
  const title = post.lines
    .map((l, i) => `<text x="80" y="${titleY + i * 66}" font-family="Plus Jakarta Sans, sans-serif" font-size="52" font-weight="800" fill="${FG}">${escapeXml(l)}</text>`)
    .join("\n");
  const catW = post.category.length * 12.5 + 48;
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#12151C"/>
      <stop offset="0.55" stop-color="${BG}"/>
      <stop offset="1" stop-color="#0B0E14"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.82" cy="0.45" r="0.55">
      <stop offset="0" stop-color="${GOLD}" stop-opacity="0.14"/>
      <stop offset="1" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g opacity="0.32">${motifs[post.motif]}</g>
  <rect x="0" y="0" width="1200" height="8" fill="${GOLD}"/>
  <text x="80" y="120" font-family="Plus Jakarta Sans, sans-serif" font-size="30" font-weight="800" letter-spacing="8" fill="${GOLD}">NOVA HAVENS</text>
  <rect x="80" y="160" width="${catW}" height="44" rx="22" fill="${CARD}" stroke="${GOLD}" stroke-opacity="0.5"/>
  <text x="${80 + catW / 2}" y="189" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="21" font-weight="600" fill="${GOLD}">${escapeXml(post.category)}</text>
  ${title}
  <line x1="80" y1="545" x2="1120" y2="545" stroke="#222732" stroke-width="2"/>
  <text x="80" y="590" font-family="Plus Jakarta Sans, sans-serif" font-size="24" fill="${MUTED}">novahavens.com</text>
  <text x="1120" y="590" text-anchor="end" font-family="Plus Jakarta Sans, sans-serif" font-size="24" font-weight="600" fill="${GOLD}">Insurance Housing Insights</text>
</svg>`;
}

fs.mkdirSync(publicDir, { recursive: true });

// Remove stale images for posts that were deleted or renamed,
// so builds never ship og-blog-*.png files without a matching post.
const validNames = new Set(posts.map((p) => `og-blog-${p.slug}.png`));
for (const file of fs.readdirSync(publicDir)) {
  if (/^og-blog-.*\.png$/.test(file) && !validNames.has(file)) {
    fs.unlinkSync(path.join(publicDir, file));
    console.log("removed stale", path.join(publicDir, file));
  }
}

for (const post of posts) {
  const out = path.join(publicDir, `og-blog-${post.slug}.png`);
  await sharp(Buffer.from(svgFor(post))).png().toFile(out);
  console.log("wrote", out);
}
