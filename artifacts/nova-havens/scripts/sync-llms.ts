/**
 * sync-llms.ts — writes the checked-in raw llms.txt from the canonical source.
 *
 * Run with: node --experimental-strip-types scripts/sync-llms.ts
 */

import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderLlmsTxt } from '../src/data/llmsContent.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rawFilePath = join(__dirname, '..', 'public', 'llms.txt');

writeFileSync(rawFilePath, renderLlmsTxt(), 'utf-8');
console.log('Synced public/llms.txt from src/data/llmsContent.ts.');