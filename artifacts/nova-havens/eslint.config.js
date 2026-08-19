/**
 * eslint.config.js — Flat ESLint config for nova-havens.
 *
 * Enforces design-token usage by flagging raw hex colors and hardcoded
 * spacing/font-size values with inline squiggles in any ESLint-aware editor.
 *
 * This is the editor-time layer of a three-layer system:
 *   1. ESLint (here)          — red squiggle as you type, before saving
 *   2. Vite validation plugins — terminal warning on every HMR save
 *   3. scripts/validate-*.ts   — build fails if any violation slips through
 *
 * Exemptions mirror the color and token exemption sets in validateRules.ts.
 * If you add a new exemption, update validateRules.ts AND the ignores list here.
 */

import tsParser from '@typescript-eslint/parser';
import noHardcodedHexColors from './eslint-rules/no-hardcoded-hex-colors.js';
import noHardcodedTokenValues from './eslint-rules/no-hardcoded-token-values.js';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  // ── 1. Global ignores ────────────────────────────────────────────────────
  {
    // Exempt the same shadcn-generated primitives as the build-time scripts.
    // Keep in sync with COLOR_EXEMPTED_FILES in src/lib/validateRules.ts.
    ignores: [
      'src/components/ui/chart.tsx',
      'src/components/ui/toast.tsx',
      // Generated / compiled output — never lint these.
      'dist/**',
      'node_modules/**',
    ],
  },

  // ── 2. Global linter options ─────────────────────────────────────────────
  {
    // Don't report errors for inline disable-directives that reference rules
    // from plugins that aren't loaded in this config (e.g. react-hooks/*).
    // This avoids noise from pre-existing suppression comments in the codebase.
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
  },

  // ── 3. Design-token rules for TS/TSX source ──────────────────────────────
  {
    files: [
      'src/pages/**/*.{ts,tsx}',
      'src/components/**/*.{ts,tsx}',
    ],
    plugins: {
      'nova-havens': {
        rules: {
          'no-hardcoded-hex-colors': noHardcodedHexColors,
          'no-hardcoded-token-values': noHardcodedTokenValues,
        },
      },
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        // Avoid requiring a tsconfig for plain linting — the rule only
        // inspects AST node values, so type information is not needed.
        project: false,
      },
    },
    rules: {
      'nova-havens/no-hardcoded-hex-colors': 'error',
      'nova-havens/no-hardcoded-token-values': 'error',
    },
  },

  // ── 4. Token-rule exemptions ────────────────────────────────────────────
  // Mirrors TOKEN_EXEMPTED_FILES and TOKEN_EXEMPTED_DIR_PREFIXES in
  // src/lib/validateRules.ts. These shadcn primitives may use raw values.
  {
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'nova-havens/no-hardcoded-token-values': 'off',
    },
  },
];

export default config;
