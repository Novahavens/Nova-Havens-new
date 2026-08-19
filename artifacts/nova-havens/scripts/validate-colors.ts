/**
 * validate-colors.ts — block raw hex colors from sneaking back into src files.
 *
 * Scans every .tsx / .ts / .css file under src/pages/ and src/components/,
 * and fails if any raw hex color literal is found. This enforces the rule
 * documented at the top of src/index.css: all color values must go through
 * design tokens (Tailwind classes or CSS custom properties).
 *
 * Exemptions are defined in src/lib/validateRules.ts (COLOR_EXEMPTED_FILES).
 * Edit that single file to add or remove exemptions — no need to touch this
 * script or its Vite-plugin counterpart separately.
 *
 * Run with: node --experimental-strip-types scripts/validate-colors.ts
 *           node --experimental-strip-types scripts/validate-colors.ts --staged <file>...
 *
 * The --staged form only checks the supplied staged paths. lint-staged supplies
 * those paths after hiding unstaged edits, so the pre-commit check validates
 * exactly the content that Git will commit.
 * Exits non-zero if any violation is found.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { isAbsolute, join, relative, resolve, sep } from 'path';
import { COLOR_EXEMPTED_FILES, HEX_COLOR_RE } from '../src/lib/validateRules.ts';

const ROOT = new URL('..', import.meta.url).pathname;

const SCAN_DIRS = [
  join(ROOT, 'src/pages'),
  join(ROOT, 'src/components'),
];

const STAGED_FLAG = '--staged';

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

function collectStagedFiles(paths: string[]): string[] {
  const files = new Set<string>();

  for (const path of paths) {
    const absPath = resolve(path);
    if (!existsSync(absPath) || !/\.(tsx?|css)$/.test(absPath)) continue;

    const isColorSourceFile = SCAN_DIRS.some((dir) => {
      const fromDir = relative(dir, absPath);
      return fromDir !== '' &&
        fromDir !== '..' &&
        !fromDir.startsWith(`..${sep}`) &&
        !isAbsolute(fromDir);
    });

    if (isColorSourceFile) files.add(absPath);
  }

  return [...files];
}

const args = process.argv.slice(2);
const stagedMode = args.includes(STAGED_FLAG);
const files = stagedMode
  ? collectStagedFiles(args.filter((arg) => arg !== STAGED_FLAG && arg !== '--'))
  : SCAN_DIRS.flatMap((d) => collectFiles(d));

let failures = 0;

for (const absPath of files) {
  const rel = relative(ROOT, absPath);

  if (COLOR_EXEMPTED_FILES.has(rel)) continue;

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

const checked = files.filter((f) => !COLOR_EXEMPTED_FILES.has(relative(ROOT, f))).length;

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
  `Color validation passed: no raw hex colors found across ${checked}${stagedMode ? ' staged' : ''} file(s).`,
);
