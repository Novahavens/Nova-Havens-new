/**
 * vitePluginValidateTokens.ts — Vite plugin that runs spacing/font-size token
 * validation on every source file save during `vite dev`, so violations surface
 * immediately in the terminal instead of waiting for a full build.
 *
 * Rules are sourced from src/lib/validateRules.ts — edit that file to add
 * exemptions, change regexes, or update the width-token map.
 *
 * Flags:
 *   1. Tailwind arbitrary-value brackets with a numeric px/em/rem/… unit
 *        text-[14px]  p-[calc(1rem+8px)]
 *   2. JSX inline style properties (font-size, spacing) with a hardcoded unit
 *        fontSize: '14px'   marginTop: "32px"
 *   3. CSS property declarations with hardcoded units (non-custom-property),
 *      including width declarations that map directly to named width tokens
 *        font-size: 14px;   padding: 20px 0;   max-width: 1200px;
 *   4. Tailwind max-w-[…] values that exactly match a named width-scale token
 *        max-w-[1200px] → should be max-w-site
 */

import { readFileSync } from 'fs';
import { join, relative } from 'path';
import type { Plugin } from 'vite';
import {
  TOKEN_EXEMPTED_FILES,
  TOKEN_EXEMPTED_DIR_PREFIXES,
  WIDTH_TOKEN_MAP,
  parseWidthPx,
  WATCHED_RE,
  TAILWIND_ARBITRARY_RE,
  MAX_W_ARBITRARY_RE,
  INLINE_STYLE_RE,
  CSS_DECL_RE,
} from './src/lib/validateRules';

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
    TOKEN_EXEMPTED_FILES.has(rel) ||
    TOKEN_EXEMPTED_DIR_PREFIXES.some((p) => rel.startsWith(p))
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
          // Match the build-time validation behavior: a raw width value that
          // equals a named design token gets a specific token-class suggestion.
          const widthPropMatch = m[0].match(/\b(max-width|min-width|width)\s*:\s*([\d.]+(?:px|rem))/);
          if (widthPropMatch) {
            const px = parseWidthPx(widthPropMatch[2]);
            const widthToken = px === null ? undefined : WIDTH_TOKEN_MAP.get(px);
            if (widthToken) {
              hits.push({
                line: i + 1,
                text: line.trim(),
                match: m[0],
                kind: 'width-token-alias',
                suggestion: widthPropMatch[1] === 'min-width'
                  ? widthToken.replace(/^max-w-/, 'min-w-')
                  : widthToken,
              });
              continue;
            }
          }
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
