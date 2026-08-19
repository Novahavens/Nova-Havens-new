/**
 * Stylelint configuration for Nova Havens CSS source.
 *
 * This is the editor-time companion to scripts/validate-colors.ts:
 * VS Code's Stylelint extension uses it to flag raw hex colors while CSS is
 * being edited, before a Vite save or build-time validation runs.
 *
 * CSS exemptions are read from the central COLOR_EXEMPTED_FILES source of
 * truth in validateRules.ts. Add an explicit .css path to that list when a CSS
 * file itself needs an exemption.
 */

import { readFileSync } from 'node:fs';

const validationRulesSource = readFileSync(
  new URL('./src/lib/validateRules.ts', import.meta.url),
  'utf8',
);

const exemptedFilesMatch = validationRulesSource.match(
  /COLOR_EXEMPTED_FILES\s*=\s*new Set\(\[([\s\S]*?)\]\);/,
);

if (!exemptedFilesMatch) {
  throw new Error(
    'Could not load COLOR_EXEMPTED_FILES from src/lib/validateRules.ts.',
  );
}

const colorExemptedCssFiles = [
  ...exemptedFilesMatch[1].matchAll(/'([^']+)'/g),
]
  .map(([, path]) => path)
  .filter((path) => path.endsWith('.css'));

export default {
  ignoreFiles: colorExemptedCssFiles,
  // Stylelint requires a top-level rule entry. Keep it disabled globally so
  // src/index.css remains the allowed home for raw design-token definitions.
  rules: {
    'color-no-hex': null,
  },
  overrides: [
    {
      files: ['src/pages/**/*.css', 'src/components/**/*.css'],
      rules: {
        // Raw colors must use the design-token CSS custom properties instead.
        'color-no-hex': true,
      },
    },
  ],
};
