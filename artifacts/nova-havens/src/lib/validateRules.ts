/**
 * validateRules.ts — Single source of truth for all lint rules used by both
 * the Vite dev-server plugins and the build-time validate-* scripts.
 *
 * Adding a new exempted file, changing a regex, or updating the width-token
 * map requires editing exactly this one file; the plugins and scripts pick up
 * the change automatically.
 */

// ─── color rules ──────────────────────────────────────────────────────────────

/** Hex color regex: 3, 4, 6, or 8 digit forms. */
export const HEX_COLOR_RE = /#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g;

/**
 * Specific file paths (relative to the package root) that are allowed to
 * contain raw hex colors.  These are shadcn-generated primitives that ship
 * hex values by design.
 */
export const COLOR_EXEMPTED_FILES = new Set([
  'src/components/ui/chart.tsx',
  'src/components/ui/chart.css',
  'src/components/ui/toast.tsx',
]);

// ─── token rules ──────────────────────────────────────────────────────────────

/**
 * Specific file paths (relative to the package root) that are exempt from
 * spacing / font-size token checks.  Kept in sync with color exemptions above
 * (both point at the same shadcn primitives).
 */
export const TOKEN_EXEMPTED_FILES = new Set([
  'src/components/ui/chart.tsx',
  'src/components/ui/toast.tsx',
]);

/** Any file whose relative path starts with one of these prefixes is also exempt. */
export const TOKEN_EXEMPTED_DIR_PREFIXES: readonly string[] = [
  'src/components/ui/',
];

// ─── width-token map ──────────────────────────────────────────────────────────
//
// Canonical px values (at 1rem = 16px) → the Tailwind class that represents
// that token in src/index.css @theme inline.  Kept in sync with the
// --width-* entries there.

export const WIDTH_TOKEN_MAP = new Map<number, string>([
  [1200, 'max-w-site'],        // --width-site:       75rem
  [1100, 'max-w-section'],     // --width-section:    68.75rem
  [900,  'max-w-content'],     // --width-content:    56.25rem
  [800,  'max-w-prose-wide'],  // --width-prose-wide: 50rem
  [760,  'max-w-prose'],       // --width-prose:      47.5rem
  [420,  'max-w-cta'],         // --width-cta:        26.25rem
]);

/**
 * Parse a bare CSS length string (px or rem only) into a canonical pixel
 * value.  Returns null for anything more complex (calc, var, clamp, …).
 */
export function parseWidthPx(value: string): number | null {
  const px = value.match(/^([\d.]+)px$/);
  if (px) return Math.round(parseFloat(px[1]));
  const rem = value.match(/^([\d.]+)rem$/);
  if (rem) return Math.round(parseFloat(rem[1]) * 16);
  return null;
}

// ─── shared unit alternation ──────────────────────────────────────────────────

export const UNITS = '(?:px|em|rem|vh|vw|ch|ex|vmin|vmax)';

// ─── token regexes ────────────────────────────────────────────────────────────

/**
 * Tailwind arbitrary-value bracket that contains a numeric unit *anywhere*
 * inside the payload — catches bare values, clamp(), calc(), etc.
 *
 *   text-[14px]                 ✓
 *   p-[calc(1rem+8px)]          ✓
 *   text-[clamp(48px,6vw,80px)] ✓
 *   text-[var(--foo)]           ✗ (no numeric unit)
 *   bg-[#fff]                   ✗ (handled by color check)
 */
export const TAILWIND_ARBITRARY_RE = new RegExp(
  `[\\w-]+\\[[^\\]]*[\\d.]+${UNITS}[^\\]]*\\]`,
  'g',
);

/**
 * Tailwind max-w-[…] arbitrary value.  Captures the payload inside the
 * brackets so we can parse the numeric value and compare to WIDTH_TOKEN_MAP.
 *
 *   max-w-[1200px] → use max-w-site
 *   max-w-[75rem]  → use max-w-site
 */
export const MAX_W_ARBITRARY_RE = /\bmax-w-\[([^\]]+)\]/g;

/**
 * JSX inline style property keys for font-size / spacing whose quoted value
 * contains a numeric unit anywhere inside, including CSS functions.
 *
 *   fontSize: '14px'                       ✓
 *   fontSize: 'clamp(48px, 6vw, 80px)'    ✓
 *   marginTop: "32px"                      ✓
 *   padding: `8px`                         ✓
 */
export const JS_PROP =
  '(?:fontSize|lineHeight|letterSpacing' +
  '|margin(?:Top|Bottom|Left|Right)?' +
  '|padding(?:Top|Bottom|Left|Right)?' +
  '|gap|rowGap|columnGap' +
  '|top|bottom|left|right' +
  '|width|height|minWidth|maxWidth|minHeight|maxHeight)';

export const INLINE_STYLE_RE = new RegExp(
  `\\b${JS_PROP}\\s*:\\s*` +
  `(?:` +
    `'[^']*[\\d.]+${UNITS}[^']*'` +    // single-quoted
    `|"[^"]*[\\d.]+${UNITS}[^"]*"` +   // double-quoted
    `|\`[^\`]*[\\d.]+${UNITS}[^\`]*\`` // backtick
  + `)`,
  'g',
);

/**
 * CSS property declarations (in .css files) with hardcoded numeric units.
 * Matches the property name through the rest of the declaration up to `;` or `{`.
 * Skips custom-property definitions (--var:) — those ARE the token definitions.
 *
 *   font-size: 14px;                      ✓
 *   padding: 20px 0;                      ✓
 *   margin-top: clamp(1rem, 5vw, 3rem);   ✓
 *   --spacing-4: 16px;                    ✗ (custom property — exempt)
 */
export const CSS_PROP =
  '(?:font-size|line-height|letter-spacing' +
  '|margin(?:-(?:top|bottom|left|right))?' +
  '|padding(?:-(?:top|bottom|left|right))?' +
  '|gap|row-gap|column-gap' +
  '|top|bottom|left|right' +
  '|width|height|min-width|max-width|min-height|max-height)';

export const CSS_DECL_RE = new RegExp(
  `(?<!--)\\b${CSS_PROP}\\s*:[^;{]*[\\d.]+${UNITS}`,
  'g',
);

// ─── file-watch pattern ───────────────────────────────────────────────────────

/** Extensions watched by both plugins and scripts. */
export const WATCHED_RE = /\.(tsx?|css)$/;
