/**
 * validate-colors.ts — block raw hex colors from sneaking back into src files.
 *
 * Scans every .tsx / .ts / .css file under src/pages/ and src/components/,
 * and fails if any raw hex color literal is found. This enforces the rule
 * documented at the top of src/index.css: all color values must go through
 * design tokens (Tailwind classes or CSS custom properties).
 *
 * Exempted files (shadcn defaults that ship hex colors by design):
 *   - src/components/ui/chart.tsx
 *   - src/components/ui/toast.tsx
 *
 * Run with: node --experimental-strip-types scripts/validate-colors.ts
 * Exits non-zero if any violation is found.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;

const SCAN_DIRS = [
  join(ROOT, 'src/pages'),
  join(ROOT, 'src/components'),
];

/** Paths (relative to ROOT) that are allowed to contain hex colors. */
const EXEMPTED = new Set([
  'src/components/ui/chart.tsx',
  'src/components/ui/toast.tsx',
]);

/** Matches any #-prefixed hex color: 3, 4, 6, or 8 hex digits. */
const HEX_COLOR_RE = /#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g;

function collectFiles(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    // directory might not exist yet — skip silently
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      collectFiles(full, out);
    } else if (/\.(tsx?|css)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

const files = SCAN_DIRS.flatMap((d) => collectFiles(d));

let failures = 0;

for (const absPath of files) {
  const rel = relative(ROOT, absPath);

  if (EXEMPTED.has(rel)) continue;

  const source = readFileSync(absPath, 'utf8');
  const lines = source.split('\n');

  const hits: { line: number; text: string; match: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m: RegExpExecArray | null;
    HEX_COLOR_RE.lastIndex = 0;
    while ((m = HEX_COLOR_RE.exec(line)) !== null) {
      hits.push({ line: i + 1, text: line.trim(), match: m[0] });
    }
  }

  if (hits.length > 0) {
    failures++;
    console.error(`✗ ${rel}`);
    for (const h of hits) {
      console.error(`    line ${h.line}: ${h.match}  →  ${h.text}`);
    }
  }
}

const checked = files.filter((f) => !EXEMPTED.has(relative(ROOT, f))).length;

if (failures > 0) {
  console.error(
    `\nColor validation FAILED: ${failures} file(s) contain raw hex colors (of ${checked} checked).`,
  );
  console.error(
    'Use Tailwind tokens (bg-primary, text-foreground, bg-surface-1, etc.) or CSS custom properties instead.',
  );
  process.exit(1);
}

console.log(
  `Color validation passed: no raw hex colors found across ${checked} file(s).`,
);
