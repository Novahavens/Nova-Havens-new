/**
 * vitePluginValidateTokens.ts — Vite plugin that runs spacing/font-size token
 * validation on every source file save during `vite dev`, so violations surface
 * immediately in the terminal instead of waiting for a full build.
 *
 * Mirrors the rules in scripts/validate-tokens.ts — keep the two in sync if
 * the exemption list or regexes ever change.
 *
 * Flags:
 *   1. Tailwind arbitrary-value brackets with a numeric px/em/rem/… unit
 *        text-[14px]  p-[calc(1rem+8px)]
 *   2. JSX inline style properties (font-size, spacing) with a hardcoded unit
 *        fontSize: '14px'   marginTop: "32px"
 *   3. CSS property declarations with hardcoded units (non-custom-property)
 *        font-size: 14px;   padding: 20px 0;
 *   4. Tailwind max-w-[…] values that exactly match a named width-scale token
 *        max-w-[1200px] → should be max-w-site
 */

import { readFileSync } from 'fs';
import { join, relative } from 'path';
import type { Plugin } from 'vite';

// ─── exemptions ───────────────────────────────────────────────────────────────

const EXEMPTED_FILES = new Set([
  'src/components/ui/chart.tsx',
  'src/components/ui/toast.tsx',
]);

const EXEMPTED_DIR_PREFIXES = ['src/components/ui/'];

const WATCHED_RE = /\.(tsx?|css)$/;

// ─── width-token map (must match validate-tokens.ts) ─────────────────────────

const WIDTH_TOKEN_MAP = new Map<number, string>([
  [1200, 'max-w-site'],
  [1100, 'max-w-section'],
  [900,  'max-w-content'],
  [800,  'max-w-prose-wide'],
  [760,  'max-w-prose'],
  [420,  'max-w-cta'],
]);

function parseWidthPx(value: string): number | null {
  const px = value.match(/^([\d.]+)px$/);
  if (px) return Math.round(parseFloat(px[1]));
  const rem = value.match(/^([\d.]+)rem$/);
  if (rem) return Math.round(parseFloat(rem[1]) * 16);
  return null;
}

// ─── regexes (must match validate-tokens.ts) ─────────────────────────────────

const UNITS = '(?:px|em|rem|vh|vw|ch|ex|vmin|vmax)';

const TAILWIND_ARBITRARY_RE = new RegExp(
  `[\\w-]+\\[[^\\]]*[\\d.]+${UNITS}[^\\]]*\\]`,
  'g',
);

const MAX_W_ARBITRARY_RE = /\bmax-w-\[([^\]]+)\]/g;

const JS_PROP =
  '(?:fontSize|lineHeight|letterSpacing' +
  '|margin(?:Top|Bottom|Left|Right)?' +
  '|padding(?:Top|Bottom|Left|Right)?' +
  '|gap|rowGap|columnGap' +
  '|top|bottom|left|right' +
  '|width|height|minWidth|maxWidth|minHeight|maxHeight)';

const INLINE_STYLE_RE = new RegExp(
  `\\b${JS_PROP}\\s*:\\s*` +
  `(?:` +
    `'[^']*[\\d.]+${UNITS}[^']*'` +
    `|"[^"]*[\\d.]+${UNITS}[^"]*"` +
    `|\`[^\`]*[\\d.]+${UNITS}[^\`]*\`` +
  `)`,
  'g',
);

const CSS_PROP =
  '(?:font-size|line-height|letter-spacing' +
  '|margin(?:-(?:top|bottom|left|right))?' +
  '|padding(?:-(?:top|bottom|left|right))?' +
  '|gap|row-gap|column-gap' +
  '|top|bottom|left|right' +
  '|width|height|min-width|max-width|min-height|max-height)';

const CSS_DECL_RE = new RegExp(
  `(?<!--)\\b${CSS_PROP}\\s*:[^;{]*[\\d.]+${UNITS}`,
  'g',
);

// ─── helpers ──────────────────────────────────────────────────────────────────

function srcDir(root: string, sub: string) {
  return join(root, 'src', sub) + '/';
}

function isWatched(root: string, absPath: string): boolean {
  const pages = srcDir(root, 'pages');
  const components = srcDir(root, 'components');
  return (
    WATCHED_RE.test(absPath) &&
    (absPath.startsWith(pages) || absPath.startsWith(components))
  );
}

interface Hit {
  line: number;
  text: string;
  match: string;
  kind: 'tailwind-arbitrary' | 'inline-style' | 'css-declaration' | 'width-token-alias';
  suggestion?: string;
}

function validateFile(
  root: string,
  absPath: string,
): { rel: string; hits: Hit[] } | null {
  const rel = relative(root, absPath);

  if (
    EXEMPTED_FILES.has(rel) ||
    EXEMPTED_DIR_PREFIXES.some((p) => rel.startsWith(p))
  ) {
    return null;
  }

  let source: string;
  try {
    source = readFileSync(absPath, 'utf8');
  } catch {
    return null;
  }

  const isCss = absPath.endsWith('.css');
  const lines = source.split('\n');
  const hits: Hit[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m: RegExpExecArray | null;

    if (isCss) {
      const trimmed = line.trimStart();
      if (!trimmed.startsWith('--')) {
        CSS_DECL_RE.lastIndex = 0;
        while ((m = CSS_DECL_RE.exec(line)) !== null) {
          hits.push({ line: i + 1, text: line.trim(), match: m[0], kind: 'css-declaration' });
        }
      }
    } else {
      TAILWIND_ARBITRARY_RE.lastIndex = 0;
      while ((m = TAILWIND_ARBITRARY_RE.exec(line)) !== null) {
        hits.push({ line: i + 1, text: line.trim(), match: m[0], kind: 'tailwind-arbitrary' });
      }

      INLINE_STYLE_RE.lastIndex = 0;
      while ((m = INLINE_STYLE_RE.exec(line)) !== null) {
        hits.push({ line: i + 1, text: line.trim(), match: m[0], kind: 'inline-style' });
      }

      MAX_W_ARBITRARY_RE.lastIndex = 0;
      while ((m = MAX_W_ARBITRARY_RE.exec(line)) !== null) {
        const px = parseWidthPx(m[1]);
        if (px !== null) {
          const suggestion = WIDTH_TOKEN_MAP.get(px);
          if (suggestion) {
            hits.push({
              line: i + 1,
              text: line.trim(),
              match: m[0],
              kind: 'width-token-alias',
              suggestion,
            });
          }
        }
      }
    }
  }

  return hits.length > 0 ? { rel, hits } : null;
}

// ─── plugin ───────────────────────────────────────────────────────────────────

export function validateTokensPlugin(): Plugin {
  let root = '';

  return {
    name: 'validate-tokens',
    apply: 'serve', // dev only — build already runs validate-tokens.ts separately

    configResolved(config) {
      root = config.root;
    },

    hotUpdate({ file }) {
      // hotUpdate fires on create/update/delete; validateFile returns null
      // for deleted files (readFileSync throws → caught → returns null).
      if (!isWatched(root, file)) return;

      const result = validateFile(root, file);

      if (result) {
        const lines = [
          `\n[validate-tokens] ✗ Token violation in ${result.rel}`,
          ...result.hits.map((h) => {
            const tag = `[${h.kind}]`;
            let msg = `  line ${h.line}: ${tag} ${h.match}  →  ${h.text}`;
            if (h.suggestion) {
              msg += `\n    → Use the named token instead: ${h.suggestion}`;
            }
            return msg;
          }),
          `  Fix: use Tailwind scale utilities (text-sm, p-4, gap-6, …) or CSS custom properties.\n`,
        ];
        process.stderr.write(lines.join('\n') + '\n');
      }
      // Return nothing — let Vite continue with HMR normally regardless
    },
  };
}
