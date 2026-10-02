import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/**
 * Design-token guard, carried over from the previous codebase: raw hex colours
 * are not allowed in components. Use Tailwind token classes (bg-primary,
 * text-foreground, …) or CSS variables. Tokens live in src/styles/tokens.css.
 */
const HEX_RE = /#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/;

const noHardcodedHexColors = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow raw hex colour literals in UI code; use design tokens.' },
    messages: {
      noHex: 'Raw hex colour "{{hex}}" found. Use a design token (bg-primary, text-foreground, var(--…)).',
    },
    schema: [],
  },
  create(context) {
    const check = (value, node) => {
      const m = HEX_RE.exec(value);
      if (m) context.report({ node, messageId: 'noHex', data: { hex: m[0] } });
    };
    return {
      Literal(node) {
        if (typeof node.value === 'string') check(node.value, node);
      },
      TemplateElement(node) {
        check(node.value.cooked ?? '', node);
      },
    };
  },
};

const config = [
  ...nextVitals,
  ...nextTs,
  {
    files: ['src/components/**/*.tsx', 'src/app/**/*.tsx'],
    ignores: ['src/app/**/opengraph-image.tsx'],
    plugins: { 'nova-havens': { rules: { 'no-hardcoded-hex-colors': noHardcodedHexColors } } },
    rules: { 'nova-havens/no-hardcoded-hex-colors': 'error' },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'playwright-report/**', 'test-results/**', 'next-env.d.ts'],
  },
];

export default config;
