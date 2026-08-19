import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import stylelint from 'stylelint';
import {
  COLOR_EXEMPTED_FILES,
  HEX_COLOR_RE,
} from '../src/lib/validateRules.ts';

const packageRoot = new URL('..', import.meta.url).pathname;
const stylelintConfig = join(packageRoot, 'stylelint.config.js');
const validator = join(packageRoot, 'scripts', 'validate-colors.ts');
const fixtureFiles: string[] = [];

function writeFixture(relativePath: string, contents: string): string {
  const path = join(packageRoot, relativePath);
  assert.equal(
    existsSync(path),
    false,
    `${relativePath} must be reserved for this test`,
  );
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
  fixtureFiles.push(path);
  return path;
}

function cleanupFixtures() {
  for (const path of fixtureFiles.splice(0)) {
    rmSync(path, { force: true });
  }
}

async function stylelintWarnings(path: string, source: string) {
  const result = await stylelint.lint({
    code: source,
    codeFilename: path,
    configFile: stylelintConfig,
  });

  return result.results.flatMap((file) => file.warnings);
}

function runValidator(path: string) {
  return spawnSync(
    process.execPath,
    ['--experimental-strip-types', validator, '--staged', path],
    { cwd: packageRoot, encoding: 'utf8' },
  );
}

function matches(rule: RegExp, source: string): boolean {
  rule.lastIndex = 0;
  const result = rule.test(source);
  rule.lastIndex = 0;
  return result;
}

test('Stylelint and color validation reject every supported raw hex form', async (t) => {
  t.after(cleanupFixtures);

  const fixtures = [
    ['three-digit', '#abc'],
    ['four-digit', '#abcd'],
    ['six-digit', '#a1b2c3'],
    ['eight-digit', '#a1b2c3d4'],
  ] as const;

  for (const [label, hex] of fixtures) {
    await t.test(label, async () => {
      const relativePath = `src/components/ColorProbe-${label}.css`;
      const path = writeFixture(relativePath, `.probe { color: ${hex}; }\n`);

      assert.equal(
        matches(HEX_COLOR_RE, hex),
        true,
        `${hex} must match HEX_COLOR_RE`,
      );
      assert.ok(
        (await stylelintWarnings(path, readFileSync(path, 'utf8'))).some(
          (warning) => warning.rule === 'color-no-hex',
        ),
        `Stylelint must reject ${hex}`,
      );

      const validatorResult = runValidator(path);
      assert.equal(
        validatorResult.status,
        1,
        `validator must reject ${hex}; stderr: ${validatorResult.stderr}`,
      );
      assert.match(validatorResult.stderr, new RegExp(`line 1: ${hex}`));
    });
  }
});

test('a shared CSS color exemption is ignored by Stylelint and color validation', async () => {
  const relativePath = [...COLOR_EXEMPTED_FILES].find((path) =>
    path.endsWith('.css'),
  );
  assert.ok(relativePath, 'validateRules must define a CSS color exemption');

  const path = join(packageRoot, relativePath);
  const original = existsSync(path) ? readFileSync(path, 'utf8') : undefined;

  try {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, '.probe { color: #a1b2c3; }\n');

    assert.equal(
      (await stylelintWarnings(path, readFileSync(path, 'utf8'))).length,
      0,
      `${relativePath} must remain Stylelint-exempt`,
    );
    const validatorResult = runValidator(path);
    assert.equal(
      validatorResult.status,
      0,
      `${relativePath} must remain validator-exempt; stderr: ${validatorResult.stderr}`,
    );
    assert.match(validatorResult.stdout, /Color validation passed/);
  } finally {
    if (original === undefined) {
      rmSync(path, { force: true });
    } else {
      writeFileSync(path, original);
    }
  }
});
