import { deepEqual, equal, throws } from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';

import {
  DEFAULT_APPLICATION_SOURCE_EXCLUSIONS,
  FALLBACK_DESIGN_SYSTEM_THEME_VARIABLES,
  findUnusedApplicationFiles,
  findDesignSystemDrift,
  findDesignSystemImportViolations,
  findDesignSystemThemeViolations,
  findFallbackThemeVariableDrift,
  findRecreatedDesignSystemFiles,
  findUnreachableSourceFiles,
  findUnusedUiComponents,
  validateUiComponents,
} from '../scripts/validate-ui-components.ts';
import { validateSourceReachability } from '../scripts/validate-source-reachability.ts';

const temporaryDirectories: string[] = [];

test.after(() => {
  for (const directory of temporaryDirectories) rmSync(directory, { recursive: true, force: true });
});

test('reports components that are unused directly and transitively', () => {
  const sourceRoot = mkdtempSync(join(tmpdir(), 'nova-havens-ui-components-'));
  temporaryDirectories.push(sourceRoot);
  mkdirSync(join(sourceRoot, 'src', 'components', 'ui'), { recursive: true });
  mkdirSync(join(sourceRoot, 'src', 'pages'), { recursive: true });

  writeFileSync(
    join(sourceRoot, 'src', 'main.tsx'),
    "import App from './App';\nexport default App;\n",
  );
  writeFileSync(
    join(sourceRoot, 'src', 'App.tsx'),
    `import Used from '@/components/ui/used';
// import CommentOnly from './components/ui/comment-only';
const stringImportExample = "import StringOnly from './components/ui/string-only';";
export default Used;
`,
  );
  writeFileSync(
    join(sourceRoot, 'src', 'components', 'dead.tsx'),
    "import DeadPrimitive from './ui/only-used-by-dead';\nexport default DeadPrimitive;\n",
  );
  writeFileSync(
    join(sourceRoot, 'src', 'components', 'ui', 'used.tsx'),
    "import Nested from './nested';\nexport default Nested;\n",
  );
  writeFileSync(
    join(sourceRoot, 'src', 'components', 'ui', 'nested.tsx'),
    'export default function Nested() { return null; }\n',
  );
  writeFileSync(
    join(sourceRoot, 'src', 'components', 'ui', 'unused.tsx'),
    'export default function Unused() { return null; }\n',
  );
  writeFileSync(
    join(sourceRoot, 'src', 'components', 'ui', 'only-used-by-dead.tsx'),
    'export default function AlsoUnused() { return null; }\n',
  );
  writeFileSync(
    join(sourceRoot, 'src', 'components', 'ui', 'comment-only.tsx'),
    'export default function CommentOnly() { return null; }\n',
  );
  writeFileSync(
    join(sourceRoot, 'src', 'components', 'ui', 'string-only.tsx'),
    'export default function StringOnly() { return null; }\n',
  );

  deepEqual(findUnusedUiComponents(sourceRoot), [
    'src/components/ui/comment-only.tsx',
    'src/components/ui/only-used-by-dead.tsx',
    'src/components/ui/string-only.tsx',
    'src/components/ui/unused.tsx',
  ]);
  deepEqual(findUnreachableSourceFiles(sourceRoot), [
    'src/components/dead.tsx',
    'src/components/ui/comment-only.tsx',
    'src/components/ui/only-used-by-dead.tsx',
    'src/components/ui/string-only.tsx',
    'src/components/ui/unused.tsx',
  ]);
});

test('reports unreachable application files outside UI and honors exclusions', () => {
  const sourceRoot = mkdtempSync(join(tmpdir(), 'nova-havens-source-reachability-'));
  temporaryDirectories.push(sourceRoot);
  mkdirSync(join(sourceRoot, 'src', 'components', 'ui'), { recursive: true });
  mkdirSync(join(sourceRoot, 'src', 'lib', 'routes'), { recursive: true });
  mkdirSync(join(sourceRoot, 'src', 'standalone'), { recursive: true });

  writeFileSync(
    join(sourceRoot, 'src', 'main.tsx'),
    "import App from './App';\nexport default App;\n",
  );
  writeFileSync(
    join(sourceRoot, 'src', 'App.tsx'),
    "import Live from './components/Live';\nexport default Live;\n",
  );
  writeFileSync(
    join(sourceRoot, 'src', 'components', 'Live.tsx'),
    'export default function Live() { return null; }\n',
  );
  writeFileSync(
    join(sourceRoot, 'src', 'components', 'ui', 'unused.tsx'),
    'export default function Unused() { return null; }\n',
  );
  writeFileSync(
    join(sourceRoot, 'src', 'lib', 'routeContent.ts'),
    "import './routes/home';\nexport const routeContent = true;\n",
  );
  writeFileSync(
    join(sourceRoot, 'src', 'lib', 'routes', 'home.ts'),
    'export const homeRoute = true;\n',
  );
  writeFileSync(
    join(sourceRoot, 'src', 'standalone', 'report.ts'),
    'export const report = true;\n',
  );

  deepEqual(findUnusedApplicationFiles(sourceRoot), [
    'src/lib/routes/home.ts',
    'src/standalone/report.ts',
  ]);
  deepEqual(
    findUnusedApplicationFiles(sourceRoot, ['src/main.tsx'], [
      ...DEFAULT_APPLICATION_SOURCE_EXCLUSIONS,
      'src/standalone',
    ]),
    ['src/lib/routes/home.ts'],
  );
  deepEqual(
    findUnusedApplicationFiles(sourceRoot, ['src/main.tsx'], [
      ...DEFAULT_APPLICATION_SOURCE_EXCLUSIONS,
      'src/standalone',
      'src/lib/routes',
    ]),
    [],
  );
});

test('source reachability validation blocks unexpected files but permits explicit build-time exclusions', () => {
  const sourceRoot = mkdtempSync(join(tmpdir(), 'nova-havens-source-guard-'));
  temporaryDirectories.push(sourceRoot);
  mkdirSync(join(sourceRoot, 'src', 'build'), { recursive: true });

  writeFileSync(
    join(sourceRoot, 'src', 'main.tsx'),
    "import App from './App';\nexport default App;\n",
  );
  writeFileSync(
    join(sourceRoot, 'src', 'App.tsx'),
    'export default function App() { return null; }\n',
  );
  writeFileSync(
    join(sourceRoot, 'src', 'dead-responsive-helper.ts'),
    'export const breakpoint = 768;\n',
  );
  writeFileSync(
    join(sourceRoot, 'src', 'build', 'route-content.ts'),
    'export const routeContent = true;\n',
  );

  throws(
    () =>
      validateSourceReachability(sourceRoot, ['src/main.tsx'], [
        'src/build',
      ]),
    /1 non-UI application source file\(s\) are not reachable/,
  );

  validateSourceReachability(sourceRoot, ['src/main.tsx'], [
    'src/build',
    'src/dead-responsive-helper.ts',
  ]);
});

test('the checked-in UI directory has no unreachable components', () => {
  equal(findUnusedUiComponents().length, 0);
});

test('fails when package-owned modules are recreated or imported locally', () => {
  const sourceRoot = mkdtempSync(join(tmpdir(), 'nova-havens-design-system-drift-'));
  temporaryDirectories.push(sourceRoot);
  mkdirSync(join(sourceRoot, 'src', 'components', 'ui'), { recursive: true });
  mkdirSync(join(sourceRoot, 'src', 'hooks'), { recursive: true });
  mkdirSync(join(sourceRoot, 'src', 'lib'), { recursive: true });

  writeFileSync(
    join(sourceRoot, 'src', 'index.css'),
    '@import "@workspace/nova-havens-design-system/styles.css";\n',
  );
  writeFileSync(
    join(sourceRoot, 'src', 'main.tsx'),
    "import App from './App';\nexport default App;\n",
  );
  writeFileSync(
    join(sourceRoot, 'src', 'App.tsx'),
    [
      "import { Button } from '@/components/ui/button';",
      "import { cn } from '@/lib/utils';",
      "import { useToast } from '@/hooks/use-toast';",
      'export default function App() {',
      '  useToast();',
      '  return <Button className={cn("example")}>Example</Button>;',
      '}',
    ].join('\n'),
  );
  writeFileSync(
    join(sourceRoot, 'src', 'components', 'ui', 'button.tsx'),
    'export function Button() { return null; }\n',
  );
  writeFileSync(
    join(sourceRoot, 'src', 'lib', 'utils.ts'),
    'export function cn(...values: unknown[]) { return values.join(" "); }\n',
  );
  writeFileSync(
    join(sourceRoot, 'src', 'hooks', 'use-toast.ts'),
    'export function useToast() { return { toast: () => undefined }; }\n',
  );

  deepEqual(findRecreatedDesignSystemFiles(sourceRoot), [
    'src/components/ui/button.tsx',
    'src/hooks/use-toast.ts',
    'src/lib/utils.ts',
  ]);
  deepEqual(findDesignSystemImportViolations(sourceRoot), [
    "src/App.tsx: @/components/ui/button (use @workspace/nova-havens-design-system/components/ui/button)",
    "src/App.tsx: @/hooks/use-toast (use @workspace/nova-havens-design-system/hooks/use-toast)",
    "src/App.tsx: @/lib/utils (use @workspace/nova-havens-design-system/lib/utils)",
  ]);
  equal(findDesignSystemDrift(sourceRoot).length, 6);
  throws(
    () => validateUiComponents(sourceRoot),
    /design-system migration violation/,
  );
});

test('accepts package-backed primitives, helpers, and theme imports', () => {
  const sourceRoot = mkdtempSync(join(tmpdir(), 'nova-havens-design-system-package-'));
  temporaryDirectories.push(sourceRoot);
  mkdirSync(join(sourceRoot, 'src'), { recursive: true });

  writeFileSync(
    join(sourceRoot, 'src', 'index.css'),
    '@import "@workspace/nova-havens-design-system/styles.css";\n',
  );
  writeFileSync(
    join(sourceRoot, 'src', 'main.tsx'),
    "import App from './App';\nexport default App;\n",
  );
  writeFileSync(
    join(sourceRoot, 'src', 'App.tsx'),
    [
      "import { Button } from '@workspace/nova-havens-design-system/components/ui/button';",
      "import { cn } from '@workspace/nova-havens-design-system/lib/utils';",
      "import { useToast } from '@workspace/nova-havens-design-system/hooks/use-toast';",
      'export default function App() {',
      '  useToast();',
      '  return <Button className={cn("example")}>Example</Button>;',
      '}',
    ].join('\n'),
  );

  deepEqual(findRecreatedDesignSystemFiles(sourceRoot), []);
  deepEqual(findDesignSystemImportViolations(sourceRoot), []);
  deepEqual(findDesignSystemDrift(sourceRoot), []);
  validateUiComponents(sourceRoot);
});

test('rejects consumer-owned package theme variables and scaffolded dark blocks', () => {
  const sourceRoot = mkdtempSync(join(tmpdir(), 'nova-havens-theme-drift-'));
  temporaryDirectories.push(sourceRoot);
  mkdirSync(join(sourceRoot, 'src'), { recursive: true });

  writeFileSync(
    join(sourceRoot, 'src', 'index.css'),
    [
      '@import "@workspace/nova-havens-design-system/styles.css";',
      ':root {',
      '  --background: 220 23% 5%;',
      '  --surface-1: #0d0f14;',
      '}',
      '.dark {',
      '  --primary: 38 61% 56%;',
      '}',
    ].join('\n'),
  );

  deepEqual(findDesignSystemThemeViolations(sourceRoot), [
    'src/index.css: local package-owned theme variable --background',
    'src/index.css: local package-owned theme variable --primary',
    'src/index.css: scaffolded .dark token block; use the design-system theme instead',
  ]);
  deepEqual(findDesignSystemDrift(sourceRoot), [
    'src/index.css: local package-owned theme variable --background',
    'src/index.css: local package-owned theme variable --primary',
    'src/index.css: scaffolded .dark token block; use the design-system theme instead',
  ]);
});

test('allows Nova Havens surface and layout variables in the consumer theme', () => {
  const sourceRoot = mkdtempSync(join(tmpdir(), 'nova-havens-theme-extensions-'));
  temporaryDirectories.push(sourceRoot);
  mkdirSync(join(sourceRoot, 'src'), { recursive: true });

  writeFileSync(
    join(sourceRoot, 'src', 'index.css'),
    [
      '@import "@workspace/nova-havens-design-system/styles.css";',
      '@theme inline {',
      '  --color-surface-1: var(--surface-1);',
      '  --width-site: 75rem;',
      '}',
      ':root {',
      '  --surface-1: #0d0f14;',
      '  --surface-2: #151820;',
      '  --tertiary: #7a828f;',
      '  --min-h-map: 18.75rem;',
      '  --text-hero: clamp(3rem, 6vw, 5rem);',
      '}',
    ].join('\n'),
  );

  deepEqual(findDesignSystemThemeViolations(sourceRoot), []);
  deepEqual(findDesignSystemDrift(sourceRoot), []);
});

test('the fallback theme-variable inventory matches the live design-system stylesheet', () => {
  // Guards against exactly the gap this validator exists to close: if a
  // future package token is added to the design-system stylesheet without a
  // matching update to FALLBACK_DESIGN_SYSTEM_THEME_VARIABLES, this fails
  // clearly instead of leaving the fixture-based tests below silently unaware
  // of the new token.
  deepEqual(findFallbackThemeVariableDrift(), []);
});

test('flags a package theme variable missing from the fallback inventory', () => {
  const parent = mkdtempSync(join(tmpdir(), 'nova-havens-fallback-theme-missing-'));
  temporaryDirectories.push(parent);
  const sourceRoot = join(parent, 'app');
  mkdirSync(join(sourceRoot, 'src'), { recursive: true });
  const designSystemSrcDir = join(parent, 'nova-havens-design-system', 'src');
  mkdirSync(designSystemSrcDir, { recursive: true });

  writeFileSync(
    join(designSystemSrcDir, 'index.css'),
    [
      ':root {',
      ...FALLBACK_DESIGN_SYSTEM_THEME_VARIABLES.map((name) => `  ${name}: 0 0% 0%;`),
      '  --brand-new-token: 0 0% 0%;',
      '}',
    ].join('\n'),
  );

  deepEqual(findFallbackThemeVariableDrift(sourceRoot), [
    'missing from FALLBACK_DESIGN_SYSTEM_THEME_VARIABLES: --brand-new-token',
  ]);
});

test('flags a fallback theme variable that no longer exists in the design-system stylesheet', () => {
  const parent = mkdtempSync(join(tmpdir(), 'nova-havens-fallback-theme-stale-'));
  temporaryDirectories.push(parent);
  const sourceRoot = join(parent, 'app');
  mkdirSync(join(sourceRoot, 'src'), { recursive: true });
  const designSystemSrcDir = join(parent, 'nova-havens-design-system', 'src');
  mkdirSync(designSystemSrcDir, { recursive: true });

  const remainingVariables = FALLBACK_DESIGN_SYSTEM_THEME_VARIABLES.filter(
    (name) => name !== '--accent',
  );
  writeFileSync(
    join(designSystemSrcDir, 'index.css'),
    [':root {', ...remainingVariables.map((name) => `  ${name}: 0 0% 0%;`), '}'].join('\n'),
  );

  deepEqual(findFallbackThemeVariableDrift(sourceRoot), [
    'stale in FALLBACK_DESIGN_SYSTEM_THEME_VARIABLES: --accent',
  ]);
});

test('the fallback theme-variable check is a no-op without a sibling design-system stylesheet', () => {
  const sourceRoot = mkdtempSync(join(tmpdir(), 'nova-havens-fallback-theme-noop-'));
  temporaryDirectories.push(sourceRoot);
  mkdirSync(join(sourceRoot, 'src'), { recursive: true });

  deepEqual(findFallbackThemeVariableDrift(sourceRoot), []);
});
