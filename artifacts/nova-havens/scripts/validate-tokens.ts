/**
 * validate-tokens.ts — block hardcoded spacing, font sizes, and ad-hoc widths from sneaking into src files.
 *
 * Scans every .tsx / .ts / .css file under src/pages/ and src/components/,
 * and fails if any of the following are found:
 *
 *   1. Tailwind arbitrary-value brackets containing a numeric px/em/rem unit
 *      anywhere inside the bracket payload — including CSS functions:
 *        text-[14px]          ← bare value
 *        p-[calc(1rem+8px)]   ← calc() containing a unit
 *        text-[clamp(48px,…)] ← clamp() containing a unit
 *
 *   2. Inline JSX style-object keys for font-size / spacing properties whose
 *      string value contains a numeric unit anywhere, including CSS functions:
 *        fontSize: '14px'
 *        fontSize: 'clamp(48px, 6vw, 80px)'
 *        marginTop: "32px"
 *        padding: `8px`
 *
 *   3. CSS property declarations in .css files with hardcoded numeric units:
 *        font-size: 14px;
 *        padding: 20px 0;
 *        margin-top: clamp(1rem, 5vw, 3rem);
 *      (Lines whose property starts with `--` are exempt — those are token
 *       definitions, not hardcoded overrides.)
 *
 *   4. Tailwind max-w-[…] arbitrary values whose numeric amount (px or rem)
 *      exactly matches one of the named width-scale tokens from src/index.css.
 *      These should use the token class instead:
 *        max-w-[1200px] → max-w-site
 *        max-w-[75rem]  → max-w-site
 *        max-w-[900px]  → max-w-content
 *      (Widths that do NOT match any token are left to check #1 above.)
 *
 * Exemptions and regexes are defined in src/lib/validateRules.ts.
 * Edit that single file to add exempted paths, change a regex, or update the
 * width-token map — no need to touch this script or its Vite-plugin counterpart.
 *
 * Run with: node --experimental-strip-types scripts/validate-tokens.ts
 * Exits non-zero if any violation is found.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import {
  TOKEN_EXEMPTED_FILES,
  TOKEN_EXEMPTED_DIR_PREFIXES,
  WIDTH_TOKEN_MAP,
  parseWidthPx,
  TAILWIND_ARBITRARY_RE,
  MAX_W_ARBITRARY_RE,
  INLINE_STYLE_RE,
  CSS_DECL_RE,
} from '../src/lib/validateRules.ts';

const ROOT = new URL('..', import.meta.url).pathname;

const SCAN_DIRS = [
  join(ROOT, 'src/pages'),
  join(ROOT, 'src/components'),
];

// ─── file collection ──────────────────────────────────────────────────────────

function collectFiles(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out; // directory might not exist yet — skip silently
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

// ─── self-test (runs inline, exits early on mismatch) ────────────────────────

function selfTest(): void {
  const RESET = '\x1b[0m';
  const GREEN = '\x1b[32m';
  const RED = '\x1b[31m';

  type Case = { input: string; re: RegExp; shouldMatch: boolean; label: string };
  const cases: Case[] = [
    // Tailwind arbitrary — should match
    { input: 'text-[14px]',                   re: TAILWIND_ARBITRARY_RE, shouldMatch: true,  label: 'TW bare px' },
    { input: 'p-[32px]',                      re: TAILWIND_ARBITRARY_RE, shouldMatch: true,  label: 'TW padding px' },
    { input: 'gap-[1.5rem]',                  re: TAILWIND_ARBITRARY_RE, shouldMatch: true,  label: 'TW gap rem' },
    { input: 'text-[clamp(48px,6vw,80px)]',   re: TAILWIND_ARBITRARY_RE, shouldMatch: true,  label: 'TW clamp px' },
    { input: 'p-[calc(1rem+8px)]',            re: TAILWIND_ARBITRARY_RE, shouldMatch: true,  label: 'TW calc rem+px' },
    // Tailwind arbitrary — should NOT match
    { input: 'text-[var(--foo)]',             re: TAILWIND_ARBITRARY_RE, shouldMatch: false, label: 'TW var() exempt' },
    { input: 'bg-[#fff]',                     re: TAILWIND_ARBITRARY_RE, shouldMatch: false, label: 'TW hex exempt' },
    { input: 'col-span-[3]',                  re: TAILWIND_ARBITRARY_RE, shouldMatch: false, label: 'TW unitless exempt' },
    // Inline style — should match
    { input: `fontSize: '14px'`,              re: INLINE_STYLE_RE,       shouldMatch: true,  label: 'IS bare single-quote' },
    { input: `marginTop: "32px"`,             re: INLINE_STYLE_RE,       shouldMatch: true,  label: 'IS double-quote' },
    { input: `padding: \`8px\``,              re: INLINE_STYLE_RE,       shouldMatch: true,  label: 'IS backtick' },
    { input: `fontSize: 'clamp(48px, 6vw, 80px)'`, re: INLINE_STYLE_RE, shouldMatch: true,  label: 'IS clamp px' },
    // Inline style — should NOT match
    { input: `fontSize: 'var(--text-lg)'`,    re: INLINE_STYLE_RE,       shouldMatch: false, label: 'IS var() exempt' },
    { input: `fontSize: 'inherit'`,           re: INLINE_STYLE_RE,       shouldMatch: false, label: 'IS inherit exempt' },
    // CSS declarations — should match
    { input: 'font-size: 14px;',              re: CSS_DECL_RE,           shouldMatch: true,  label: 'CSS font-size px' },
    { input: 'padding: 20px 0;',             re: CSS_DECL_RE,           shouldMatch: true,  label: 'CSS padding px' },
    { input: 'margin-top: clamp(1rem, 5vw, 3rem);', re: CSS_DECL_RE,    shouldMatch: true,  label: 'CSS clamp rem' },
    // CSS declarations — should NOT match
    { input: '--spacing-4: 16px;',           re: CSS_DECL_RE,           shouldMatch: false, label: 'CSS custom-prop exempt' },
    { input: 'color: red;',                  re: CSS_DECL_RE,           shouldMatch: false, label: 'CSS non-token prop exempt' },
  ];

  // Width-token alias self-tests (tested separately, not via a single regex)
  type WCase = { input: string; expectToken: string | null; label: string };
  const wCases: WCase[] = [
    { input: 'max-w-[1200px]',  expectToken: 'max-w-site',       label: 'WTA site px'        },
    { input: 'max-w-[75rem]',   expectToken: 'max-w-site',       label: 'WTA site rem'       },
    { input: 'max-w-[1100px]',  expectToken: 'max-w-section',    label: 'WTA section px'     },
    { input: 'max-w-[900px]',   expectToken: 'max-w-content',    label: 'WTA content px'     },
    { input: 'max-w-[800px]',   expectToken: 'max-w-prose-wide', label: 'WTA prose-wide px'  },
    { input: 'max-w-[760px]',   expectToken: 'max-w-prose',      label: 'WTA prose px'       },
    { input: 'max-w-[420px]',   expectToken: 'max-w-cta',        label: 'WTA cta px'         },
    { input: 'max-w-[56.25rem]',expectToken: 'max-w-content',    label: 'WTA content rem'    },
    // should NOT flag — no matching token
    { input: 'max-w-[640px]',   expectToken: null,               label: 'WTA no-match px'    },
    { input: 'max-w-[var(--width-site)]', expectToken: null,     label: 'WTA var() no-flag'  },
    // non-max-w should NOT be caught by this check
    { input: 'w-[1200px]',      expectToken: null,               label: 'WTA non-max-w'      },
  ];

  let failed = false;

  for (const c of wCases) {
    MAX_W_ARBITRARY_RE.lastIndex = 0;
    const m = MAX_W_ARBITRARY_RE.exec(c.input);
    MAX_W_ARBITRARY_RE.lastIndex = 0;
    let token: string | null = null;
    if (m) {
      const px = parseWidthPx(m[1]);
      if (px !== null) token = WIDTH_TOKEN_MAP.get(px) ?? null;
    }
    const ok = token === c.expectToken;
    if (!ok) {
      console.error(
        `${RED}SELF-TEST FAIL${RESET}: [${c.label}] "${c.input}" — ` +
        `expected ${c.expectToken ? `"${c.expectToken}"` : 'null'}, got ${token ? `"${token}"` : 'null'}`,
      );
      failed = true;
    } else {
      console.log(`${GREEN}SELF-TEST OK${RESET}:   [${c.label}]`);
    }
  }

  // Inline maxWidth token alias self-tests (mirrors logic in the inline-style scan loop)
  type ISWCase = { input: string; expectToken: string | null; label: string };
  const isWCases: ISWCase[] = [
    { input: `maxWidth: '1200px'`, expectToken: 'max-w-site',    label: 'IS-WTA site px'      },
    { input: `maxWidth: '75rem'`,  expectToken: 'max-w-site',    label: 'IS-WTA site rem'     },
    { input: `maxWidth: '900px'`,  expectToken: 'max-w-content', label: 'IS-WTA content px'   },
    { input: `maxWidth: '640px'`,  expectToken: null,            label: 'IS-WTA no-match px'  },
    { input: `maxWidth: 'var(--width-site)'`, expectToken: null, label: 'IS-WTA var() no-flag' },
  ];

  for (const c of isWCases) {
    const valMatch = c.input.match(/maxWidth\s*:\s*['"`]([\d.]+(?:px|rem))['"`]/);
    let token: string | null = null;
    if (valMatch) {
      const px = parseWidthPx(valMatch[1]);
      if (px !== null) token = WIDTH_TOKEN_MAP.get(px) ?? null;
    }
    const ok = token === c.expectToken;
    if (!ok) {
      console.error(
        `${RED}SELF-TEST FAIL${RESET}: [${c.label}] "${c.input}" — ` +
        `expected ${c.expectToken ? `"${c.expectToken}"` : 'null'}, got ${token ? `"${token}"` : 'null'}`,
      );
      failed = true;
    } else {
      console.log(`${GREEN}SELF-TEST OK${RESET}:   [${c.label}]`);
    }
  }

  // CSS width / max-width / min-width token alias self-tests (mirrors logic in the CSS scan loop)
  type CSSWCase = { input: string; expectToken: string | null; label: string };
  const cssWCases: CSSWCase[] = [
    // max-width
    { input: 'max-width: 1200px;', expectToken: 'max-w-site',    label: 'CSS-WTA max-width site px'     },
    { input: 'max-width: 75rem;',  expectToken: 'max-w-site',    label: 'CSS-WTA max-width site rem'    },
    { input: 'max-width: 900px;',  expectToken: 'max-w-content', label: 'CSS-WTA max-width content px'  },
    { input: 'max-width: 640px;',  expectToken: null,            label: 'CSS-WTA max-width no-match px' },
    // width
    { input: 'width: 1200px;',     expectToken: 'max-w-site',    label: 'CSS-WTA width site px'         },
    { input: 'width: 900px;',      expectToken: 'max-w-content', label: 'CSS-WTA width content px'      },
    { input: 'width: 640px;',      expectToken: null,            label: 'CSS-WTA width no-match px'     },
    // min-width
    { input: 'min-width: 1200px;', expectToken: 'max-w-site',    label: 'CSS-WTA min-width site px'     },
    { input: 'min-width: 640px;',  expectToken: null,            label: 'CSS-WTA min-width no-match px' },
  ];

  for (const c of cssWCases) {
    const valMatch = c.input.match(/\b(?:max-width|min-width|width)\s*:\s*([\d.]+(?:px|rem))/);
    let token: string | null = null;
    if (valMatch) {
      const px = parseWidthPx(valMatch[1]);
      if (px !== null) token = WIDTH_TOKEN_MAP.get(px) ?? null;
    }
    const ok = token === c.expectToken;
    if (!ok) {
      console.error(
        `${RED}SELF-TEST FAIL${RESET}: [${c.label}] "${c.input}" — ` +
        `expected ${c.expectToken ? `"${c.expectToken}"` : 'null'}, got ${token ? `"${token}"` : 'null'}`,
      );
      failed = true;
    } else {
      console.log(`${GREEN}SELF-TEST OK${RESET}:   [${c.label}]`);
    }
  }

  for (const c of cases) {
    c.re.lastIndex = 0;
    const matched = c.re.test(c.input);
    c.re.lastIndex = 0;
    const ok = matched === c.shouldMatch;
    if (!ok) {
      console.error(`${RED}SELF-TEST FAIL${RESET}: [${c.label}] "${c.input}" — expected ${c.shouldMatch ? 'MATCH' : 'NO MATCH'}, got ${matched ? 'MATCH' : 'NO MATCH'}`);
      failed = true;
    } else {
      console.log(`${GREEN}SELF-TEST OK${RESET}:   [${c.label}]`);
    }
  }
  if (failed) {
    console.error('\nSelf-test failed — fix the regexes before scanning.\n');
    process.exit(2);
  }
  console.log('');
}

selfTest();

// ─── scan ─────────────────────────────────────────────────────────────────────

interface Hit {
  line: number;
  text: string;
  match: string;
  kind: 'tailwind-arbitrary' | 'inline-style' | 'css-declaration' | 'width-token-alias';
  /** Suggested replacement class (only set for width-token-alias hits). */
  suggestion?: string;
}

const files = SCAN_DIRS.flatMap((d) => collectFiles(d));

let failures = 0;

for (const absPath of files) {
  const rel = relative(ROOT, absPath);

  if (TOKEN_EXEMPTED_FILES.has(rel) || TOKEN_EXEMPTED_DIR_PREFIXES.some((p) => rel.startsWith(p))) continue;

  const isCss = absPath.endsWith('.css');
  const source = readFileSync(absPath, 'utf8');
  const lines = source.split('\n');

  const hits: Hit[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m: RegExpExecArray | null;

    if (isCss) {
      // CSS files: check for raw CSS property declarations with hardcoded units.
      // Skip custom-property definition lines (they ARE the token definitions).
      const trimmed = line.trimStart();
      if (!trimmed.startsWith('--')) {
        CSS_DECL_RE.lastIndex = 0;
        while ((m = CSS_DECL_RE.exec(line)) !== null) {
          // Check if this width / max-width / min-width value numerically matches
          // a named width token. If it does, suggest the token class instead of
          // a generic css-declaration flag.
          const widthPropMatch = m[0].match(/\b(max-width|min-width|width)\s*:\s*([\d.]+(?:px|rem))/);
          if (widthPropMatch) {
            const px = parseWidthPx(widthPropMatch[2]);
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
                continue;
              }
            }
          }
          hits.push({ line: i + 1, text: line.trim(), match: m[0], kind: 'css-declaration' });
        }
      }
    } else {
      // TypeScript / TSX files: check Tailwind arbitrary values and inline styles.
      TAILWIND_ARBITRARY_RE.lastIndex = 0;
      while ((m = TAILWIND_ARBITRARY_RE.exec(line)) !== null) {
        hits.push({ line: i + 1, text: line.trim(), match: m[0], kind: 'tailwind-arbitrary' });
      }

      INLINE_STYLE_RE.lastIndex = 0;
      while ((m = INLINE_STYLE_RE.exec(line)) !== null) {
        // Check if this is a maxWidth inline style that matches a named width token.
        // If so, emit a width-token-alias hit with the suggested class instead.
        if (/\bmaxWidth\s*:/.test(m[0])) {
          const valMatch = m[0].match(/maxWidth\s*:\s*['"`]([\d.]+(?:px|rem))['"`]/);
          if (valMatch) {
            const px = parseWidthPx(valMatch[1]);
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
                continue;
              }
            }
          }
        }
        hits.push({ line: i + 1, text: line.trim(), match: m[0], kind: 'inline-style' });
      }

      // Check for max-w-[…] arbitrary values that match a named width token.
      // These should use the token class (e.g. max-w-site) instead.
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

  if (hits.length > 0) {
    failures++;
    console.error(`✗ ${rel}`);
    for (const h of hits) {
      const tag = `[${h.kind}]`;
      console.error(`    line ${h.line}: ${tag} ${h.match}`);
      console.error(`      ${h.text}`);
      if (h.kind === 'width-token-alias' && h.suggestion) {
        console.error(`      → Use the named token instead: ${h.suggestion}`);
      }
    }
  }
}

const checked = files.filter((f) => {
  const rel = relative(ROOT, f);
  return !TOKEN_EXEMPTED_FILES.has(rel) && !TOKEN_EXEMPTED_DIR_PREFIXES.some((p) => rel.startsWith(p));
}).length;

if (failures > 0) {
  console.error(
    `\nToken validation FAILED: ${failures} file(s) contain hardcoded spacing, font-size, or ad-hoc width values (of ${checked} checked).`,
  );
  console.error('Use Tailwind scale utilities (text-sm, p-4, gap-6, etc.) or CSS custom properties instead.');
  console.error('Width containers: use max-w-site / max-w-section / max-w-content / max-w-prose-wide / max-w-prose / max-w-cta (see src/index.css @theme).');
  console.error('For shadcn-generated files, add them to TOKEN_EXEMPTED_FILES or TOKEN_EXEMPTED_DIR_PREFIXES in src/lib/validateRules.ts.');
  process.exit(1);
}

console.log(
  `Token validation passed: no hardcoded spacing, font-size, or ad-hoc width values found across ${checked} file(s).`,
);
