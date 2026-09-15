/**
 * Fails when application source files are not reachable from the browser
 * entry point.
 *
 * The shared UI directory has its own blocking guard in
 * validate-ui-components.ts. Build-time-only source modules remain supported
 * through the explicit exclusion list exported by that module. Additions to
 * that list must be deliberate and should name only files or directories
 * reached by a non-browser build entry point.
 *
 * Run with: node --experimental-strip-types scripts/validate-source-reachability.ts
 */

import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

import {
  APPLICATION_ENTRY_POINTS,
  DEFAULT_APPLICATION_SOURCE_EXCLUSIONS,
  DEFAULT_SOURCE_ROOT,
  findUnusedApplicationFiles,
} from './validate-ui-components.ts';

export function validateSourceReachability(
  sourceRoot = DEFAULT_SOURCE_ROOT,
  entryPoints: readonly string[] = APPLICATION_ENTRY_POINTS,
  exclusions: readonly string[] = DEFAULT_APPLICATION_SOURCE_EXCLUSIONS,
): void {
  const unusedFiles = findUnusedApplicationFiles(sourceRoot, entryPoints, exclusions);

  if (unusedFiles.length === 0) {
    console.log(
      'Application source reachability report: every non-UI source file is reachable.',
    );
    return;
  }

  console.error('Unreachable application source files found:');
  for (const file of unusedFiles) console.error(`  - ${file}`);
  console.error(
    `Excluded build-time source paths: ${exclusions.length > 0 ? exclusions.join(', ') : '(none)'}`,
  );
  throw new Error(
    `${unusedFiles.length} non-UI application source file(s) are not reachable from the browser entry point.`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  validateSourceReachability();
}