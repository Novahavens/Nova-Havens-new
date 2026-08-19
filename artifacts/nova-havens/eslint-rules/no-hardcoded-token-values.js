/**
 * no-hardcoded-token-values.js — ESLint rule that flags raw sizing values in
 * React inline styles and Tailwind arbitrary-value utilities.
 *
 * This is the editor-time companion to vitePluginValidateTokens.ts and
 * scripts/validate-tokens.ts. Keep the property and unit patterns aligned with
 * src/lib/validateRules.ts.
 */

/**
 * Mirrors JS_PROP, UNITS, and TAILWIND_ARBITRARY_RE from
 * src/lib/validateRules.ts. The regression suite compares these sources
 * directly so either side changing without the other fails immediately.
 */
export const TOKEN_RULE_PATTERNS = Object.freeze({
  jsProperty:
    /^(?:fontSize|lineHeight|letterSpacing|margin(?:Top|Bottom|Left|Right)?|padding(?:Top|Bottom|Left|Right)?|gap|rowGap|columnGap|top|bottom|left|right|width|height|minWidth|maxWidth|minHeight|maxHeight)$/,
  numericUnit: /[\d.]+(?:px|em|rem|vh|vw|ch|ex|vmin|vmax)/,
  tailwindArbitrary:
    /[\w-]+\[[^\]]*[\d.]+(?:px|em|rem|vh|vw|ch|ex|vmin|vmax)[^\]]*\]/,
});

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow hardcoded spacing and typography values. Use Tailwind scale utilities or CSS custom properties instead.',
      url: 'https://github.com/your-org/nova-havens/blob/main/src/lib/validateRules.ts',
    },
    messages: {
      noHardcodedToken:
        'Hardcoded {{ property }} value "{{ value }}" found. Use a Tailwind scale utility or CSS custom property instead.',
      noArbitraryToken:
        'Hardcoded Tailwind arbitrary value "{{ value }}" found. Use a named Tailwind token instead.',
    },
    schema: [],
  },

  create(context) {
    function staticText(node) {
      if (node.type === 'Literal' && typeof node.value === 'string') {
        return node.value;
      }

      if (node.type === 'TemplateLiteral') {
        return node.quasis
          .map((quasi) => quasi.value.cooked ?? quasi.value.raw)
          .join('');
      }

      return null;
    }

    function propertyName(node) {
      if (!node.computed && node.key.type === 'Identifier') return node.key.name;
      if (node.key.type === 'Literal' && typeof node.key.value === 'string') {
        return node.key.value;
      }
      return null;
    }

    return {
      Property(node) {
        const name = propertyName(node);
        if (!name || !TOKEN_RULE_PATTERNS.jsProperty.test(name)) return;

        const value = staticText(node.value);
        if (value && TOKEN_RULE_PATTERNS.numericUnit.test(value)) {
          context.report({
            node: node.value,
            messageId: 'noHardcodedToken',
            data: { property: name, value },
          });
        }
      },

      Literal(node) {
        if (
          typeof node.value === 'string' &&
          TOKEN_RULE_PATTERNS.tailwindArbitrary.test(node.value)
        ) {
          context.report({
            node,
            messageId: 'noArbitraryToken',
            data: { value: node.value },
          });
        }
      },

      TemplateLiteral(node) {
        const value = staticText(node);
        if (value && TOKEN_RULE_PATTERNS.tailwindArbitrary.test(value)) {
          context.report({
            node,
            messageId: 'noArbitraryToken',
            data: { value },
          });
        }
      },
    };
  },
};

export default rule;