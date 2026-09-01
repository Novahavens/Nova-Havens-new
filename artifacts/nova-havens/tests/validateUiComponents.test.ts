import { deepEqual, equal } from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';

import {
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

test('the checked-in UI directory has no unreachable components', () => {
  equal(findUnusedUiComponents().length, 0);
});