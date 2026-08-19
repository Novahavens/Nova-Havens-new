import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { validateFile } from '../vitePluginValidateTokens.ts';

test('reports inline width-token aliases without changing width semantics', () => {
  const root = mkdtempSync(join(tmpdir(), 'nova-token-plugin-'));
  const componentDir = join(root, 'src', 'components');
  const componentPath = join(componentDir, 'WidthProbe.tsx');

  try {
    mkdirSync(componentDir, { recursive: true });
    writeFileSync(
      componentPath,
      [
        "const max = <div style={{ maxWidth: '1200px' }} />;",
        "const min = <div style={{ minWidth: '1200px' }} />;",
        "const unmatched = <div style={{ minWidth: '640px' }} />;",
      ].join('\n'),
    );

    assert.deepEqual(validateFile(root, componentPath)?.hits, [
      {
        line: 1,
        text: "const max = <div style={{ maxWidth: '1200px' }} />;",
        match: "maxWidth: '1200px'",
        kind: 'width-token-alias',
        suggestion: 'max-w-site',
      },
      {
        line: 2,
        text: "const min = <div style={{ minWidth: '1200px' }} />;",
        match: "minWidth: '1200px'",
        kind: 'width-token-alias',
        suggestion: 'min-w-site',
      },
      {
        line: 3,
        text: "const unmatched = <div style={{ minWidth: '640px' }} />;",
        match: "minWidth: '640px'",
        kind: 'inline-style',
      },
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
