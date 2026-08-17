/**
 * no-hardcoded-hex-colors.js — ESLint rule that flags raw hex color literals
 * in TypeScript/TSX source files.
 *
 * This rule is the editor-time companion to:
 *   - vitePluginValidateColors.ts  (fires on every HMR save during `vite dev`)
 *   - scripts/validate-colors.ts   (runs at build time)
 *
 * All three tools share the same regex and exemption set, documented in
 * src/lib/validateRules.ts.  If you add a new exemption, update
 * validateRules.ts — this file only needs to change if the regex itself
 * changes (keep in sync with HEX_COLOR_RE there).
 *
 * Hex pattern: 3, 4, 6, or 8 hex digits following a "#", word-boundary
 * terminated — same as HEX_COLOR_RE in validateRules.ts.
 */

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow raw hex color literals. Use Tailwind tokens (bg-primary, ' +
        'text-foreground, …) or CSS custom properties (var(--color-*)) instead.',
      url: 'https://github.com/your-org/nova-havens/blob/main/src/lib/validateRules.ts',
    },
    messages: {
      noHardcodedHex:
        'Raw hex color "{{ hex }}" found. Use a design token: ' +
        'Tailwind class (bg-primary, text-foreground, …) or CSS custom property (var(--color-*)).',
    },
    schema: [],
  },

  create(context) {
    // Mirrors HEX_COLOR_RE from src/lib/validateRules.ts (non-global for exec once per value).
    const HEX_RE = /#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/;

    /**
     * Report a hex color found inside a string-like value.
     * @param {string} value  The string content to scan.
     * @param {import('eslint').Rule.Node} node  The AST node to attach the error to.
     */
    function checkValue(value, node) {
      const m = HEX_RE.exec(value);
      if (m) {
        context.report({
          node,
          messageId: 'noHardcodedHex',
          data: { hex: m[0] },
        });
      }
    }

    return {
      // String literals: "#D4A24C", 'color: #fff', etc.
      Literal(node) {
        if (typeof node.value === 'string') {
          checkValue(node.value, node);
        }
      },

      // Template literal quasi strings: `color: #D4A24C` or `bg-[#fff]`
      TemplateLiteral(node) {
        for (const quasi of node.quasis) {
          const text = quasi.value.cooked ?? quasi.value.raw;
          checkValue(text, quasi);
        }
      },
    };
  },
};

export default rule;
