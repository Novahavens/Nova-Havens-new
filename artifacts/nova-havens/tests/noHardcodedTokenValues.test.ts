import assert from 'node:assert/strict';
import { ESLint } from 'eslint';
import { join } from 'node:path';
import test from 'node:test';
import {
  INLINE_STYLE_RE,
  JS_PROP,
  TAILWIND_ARBITRARY_RE,
  TOKEN_EXEMPTED_DIR_PREFIXES,
  TOKEN_EXEMPTED_FILES,
  UNITS,
} from '../src/lib/validateRules.ts';
import { TOKEN_RULE_PATTERNS } from '../eslint-rules/no-hardcoded-token-values.js';

const packageRoot = new URL('..', import.meta.url).pathname;
const eslint = new ESLint({
  cwd: packageRoot,
  overrideConfigFile: join(packageRoot, 'eslint.config.js'),
});

function matches(rule: RegExp, source: string): boolean {
  rule.lastIndex = 0;
  const result = rule.test(source);
  rule.lastIndex = 0;
  return result;
}

async function tokenWarnings(source: string, filePath = 'src/components/TokenProbe.tsx') {
  const [result] = await eslint.lintText(source, { filePath });
  return result.messages.filter(
    (message) => message.ruleId === 'nova-havens/no-hardcoded-token-values',
  );
}

const inlineFixtures = [
  ['font size', "const probe = <div style={{ fontSize: '14px' }} />;"],
  ['padding', "const probe = <div style={{ padding: '1.5rem' }} />;"],
  ['margin', "const probe = <div style={{ marginTop: '24px' }} />;"],
  ['gap', "const probe = <div style={{ gap: '2vw' }} />;"],
] as const;

const tailwindFixtures = [
  ['font size', "const probe = <div className='text-[14px]' />;"],
  ['padding', "const probe = <div className='p-[1.5rem]' />;"],
  ['margin', "const probe = <div className='mt-[24px]' />;"],
  ['gap', "const probe = <div className='gap-[2vw]' />;"],
] as const;

test('ESLint property and unit patterns stay identical to the shared token rules', () => {
  assert.equal(TOKEN_RULE_PATTERNS.jsProperty.source, `^${JS_PROP}$`);
  assert.equal(TOKEN_RULE_PATTERNS.numericUnit.source, `[\\d.]+${UNITS}`);
  assert.equal(TOKEN_RULE_PATTERNS.tailwindArbitrary.source, TAILWIND_ARBITRARY_RE.source);
});

test('ESLint inline-style warnings match the shared token validator', async () => {
  for (const [label, source] of inlineFixtures) {
    const warnings = await tokenWarnings(source);

    assert.equal(
      warnings.length > 0,
      matches(INLINE_STYLE_RE, source),
      `${label} inline-style fixture must agree with INLINE_STYLE_RE`,
    );
    assert.equal(warnings[0]?.messageId, 'noHardcodedToken');
  }
});

test('ESLint Tailwind arbitrary-value warnings match the shared token validator', async () => {
  for (const [label, source] of tailwindFixtures) {
    const warnings = await tokenWarnings(source);

    assert.equal(
      warnings.length > 0,
      matches(TAILWIND_ARBITRARY_RE, source),
      `${label} Tailwind fixture must agree with TAILWIND_ARBITRARY_RE`,
    );
    assert.equal(warnings[0]?.messageId, 'noArbitraryToken');
  }
});

test('tokenized values and dynamic percentages stay allowed', async () => {
  const source = [
    'const percentage = 25;',
    "const probe = <div style={{ fontSize: 'var(--text-sm)', padding: 'var(--spacing-4)', marginTop: '25%', gap: `${percentage}%` }} className='text-[var(--text-sm)] p-[var(--spacing-4)] mt-[25%] gap-[var(--gap)]' />;",
  ].join('\n');

  const warnings = await tokenWarnings(source);

  assert.equal(matches(INLINE_STYLE_RE, source), false);
  assert.equal(matches(TAILWIND_ARBITRARY_RE, source), false);
  assert.equal(warnings.length, 0);
});

test('shared token exemptions remain exempt in ESLint', async () => {
  const source = "const probe = <div style={{ fontSize: '14px', padding: '8px' }} className='gap-[2rem]' />;";
  const exemptFiles = [
    ...TOKEN_EXEMPTED_FILES,
    ...TOKEN_EXEMPTED_DIR_PREFIXES.map((prefix) => `${prefix}TokenProbe.tsx`),
  ];

  assert.ok(exemptFiles.length > 0, 'validateRules must define a token exemption');

  for (const filePath of exemptFiles) {
    const warnings = await tokenWarnings(source, filePath);
    assert.equal(warnings.length, 0, `${filePath} must remain token-rule exempt`);
  }
});