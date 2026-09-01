import { deepEqual, equal } from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';

import {
  DEFAULT_APPLICATION_SOURCE_EXCLUSIONS,
  findUnusedApplicationFiles,
  findUnreachableSourceFiles,
  findUnusedUiComponents,
} from '../scripts/validate-ui-components.ts';

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

test('the checked-in UI directory has no unreachable components', () => {
  equal(findUnusedUiComponents().length, 0);
});