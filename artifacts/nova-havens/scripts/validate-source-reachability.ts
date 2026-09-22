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
 * Exclusions are checked in both directions. An exclusion that no longer
 * covers an unreachable build-time-only path is reported too, because a
 * leftover directory exclusion would otherwise keep hiding the next
 * unreachable file added under it.
 *
 * Run with: node --experimental-strip-types scripts/validate-source-reachability.ts
 */

import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

import {
  APPLICATION_ENTRY_POINTS,
  DEFAULT_APPLICATION_SOURCE_EXCLUSIONS,
  DEFAULT_SOURCE_ROOT,
  findStaleSourceExclusions,
  findUnusedApplicationFiles,
} from './validate-ui-components.ts';

export function validateSourceReachability(
  sourceRoot = DEFAULT_SOURCE_ROOT,
  entryPoints: readonly string[] = APPLICATION_ENTRY_POINTS,
  exclusions: readonly string[] = DEFAULT_APPLICATION_SOURCE_EXCLUSIONS,
): void {
  const unusedFiles = findUnusedApplicationFiles(sourceRoot, entryPoints, exclusions);
  const staleExclusions = findStaleSourceExclusions(sourceRoot, entryPoints, exclusions);

  if (unusedFiles.length === 0 && staleExclusions.length === 0) {
    console.log(
      'Application source reachability report: every non-UI source file is reachable or explicitly excluded.',
    );
    return;
  }

  if (unusedFiles.length > 0) {
    console.error('Unreachable application source files found:');
    for (const file of unusedFiles) console.error(`  - ${file}`);
    console.error(
      `Excluded build-time source paths: ${exclusions.length > 0 ? exclusions.join(', ') : '(none)'}`,
    );
  }

  if (staleExclusions.length > 0) {
    console.error('Obsolete build-time source exclusions found:');
    for (const exclusion of staleExclusions) console.error(`  - ${exclusion}`);
    console.error(
      'Each exclusion above covers no unreachable non-UI application source file — the path is reachable from the browser entry point, no longer exists, or names only UI files (checked separately by validate-ui-components.ts). Remove it from DEFAULT_APPLICATION_SOURCE_EXCLUSIONS so it cannot hide a future unreachable file.',
    );
  }

  const failures: string[] = [];
  if (unusedFiles.length > 0) {
    failures.push(
      `${unusedFiles.length} non-UI application source file(s) are not reachable from the browser entry point`,
    );
  }
  if (staleExclusions.length > 0) {
    failures.push(
      `${staleExclusions.length} configured build-time source exclusion(s) no longer name an unreachable path`,
    );
  }
  throw new Error(`${failures.join('; ')}.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  validateSourceReachability();
}