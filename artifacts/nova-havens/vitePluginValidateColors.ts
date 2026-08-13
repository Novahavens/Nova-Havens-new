/**
 * vitePluginValidateColors.ts — Vite plugin that runs color validation on
 * every source file save during `vite dev`, so violations surface immediately
 * in the terminal instead of waiting for a full build.
 *
 * Mirrors the rules in scripts/validate-colors.ts — keep the two in sync if
 * the exemption list or regex ever changes.
 */

import { readFileSync } from 'fs';
import { join, relative } from 'path';
import type { Plugin } from 'vite';

/** Hex color regex: 3, 4, 6, or 8 digit forms. */
const HEX_COLOR_RE = /#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g;

/** Paths relative to the package root that are allowed to contain hex colors. */
const EXEMPTED = new Set([
  'src/components/ui/chart.tsx',
  'src/components/ui/toast.tsx',
]);

const WATCHED_RE = /\.(tsx?|css)$/;

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

function validateFile(
  root: string,
  absPath: string,
): { rel: string; hits: { line: number; text: string; match: string }[] } | null {
  const rel = relative(root, absPath);
  if (EXEMPTED.has(rel)) return null;

  let source: string;
  try {
    source = readFileSync(absPath, 'utf8');
  } catch {
    return null; // file deleted — nothing to report
  }

  const lines = source.split('\n');
  const hits: { line: number; text: string; match: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    HEX_COLOR_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = HEX_COLOR_RE.exec(line)) !== null) {
      hits.push({ line: i + 1, text: line.trim(), match: m[0] });
    }
  }

  return hits.length > 0 ? { rel, hits } : null;
}

export function validateColorsPlugin(): Plugin {
  let root = '';

  return {
    name: 'validate-colors',
    apply: 'serve', // dev only — build already runs validate-colors.ts separately

    configResolved(config) {
      root = config.root;
    },

    hotUpdate({ file, type }) {
      // Only act on file creates and updates; ignore deletions
      if (type !== 'create' && type !== 'update') return;
      if (!isWatched(root, file)) return;

      const result = validateFile(root, file);

      if (result) {
        // Use process.stderr so it's always visible even if Vite filters stdout
        const lines = [
          `\n[validate-colors] ✗ Color violation in ${result.rel}`,
          ...result.hits.map(
            (h) => `  line ${h.line}: ${h.match}  →  ${h.text}`,
          ),
          `  Fix: use Tailwind tokens (bg-primary, text-foreground, …) or CSS custom properties.\n`,
        ];
        process.stderr.write(lines.join('\n') + '\n');
      }
      // Return nothing — let Vite continue with HMR normally regardless
    },
  };
}
