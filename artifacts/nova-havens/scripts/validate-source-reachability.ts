/**
 * Reports application source files that are not reachable from the browser
 * entry point.
 *
 * This is intentionally informational. The shared UI directory has a
 * separate blocking guard in validate-ui-components.ts; this report broadens
 * visibility without making the existing cleanup guard less strict.
 *
 * Run with: node --experimental-strip-types scripts/validate-source-reachability.ts
 */

import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

import {
  DEFAULT_APPLICATION_SOURCE_EXCLUSIONS,
  DEFAULT_SOURCE_ROOT,
  findUnusedApplicationFiles,
} from './validate-ui-components.ts';

export function validateSourceReachability(sourceRoot = DEFAULT_SOURCE_ROOT): void {
  const unusedFiles = findUnusedApplicationFiles(sourceRoot);

  if (unusedFiles.length === 0) {
    console.log(
      'Application source reachability report: every non-UI source file is reachable.',
    );
    return;
  }

  console.warn(
    'Unreachable application source files found (report only; CI will not fail):',
  );
  for (const file of unusedFiles) console.warn(`  - ${file}`);
  console.warn(
    `Excluded build-time source paths: ${DEFAULT_APPLICATION_SOURCE_EXCLUSIONS.join(', ')}`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  validateSourceReachability();
}