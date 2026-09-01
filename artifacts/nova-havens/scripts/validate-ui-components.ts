/**
 * Reports UI primitives that are not reachable from the application's entry
 * point.
 *
 * The UI directory is intentionally kept small: every component stored there
 * is a candidate for use in a route and can bring a runtime dependency with
 * it.  Following the source import graph catches both directly unused files
 * and files referenced only by another unused UI primitive.
 *
 * Run with: node --experimental-strip-types scripts/validate-ui-components.ts
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as ts from 'typescript';

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const UI_DIR = join('src', 'components', 'ui');

export const DEFAULT_SOURCE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
export const APPLICATION_ENTRY_POINTS = ['src/main.tsx'] as const;

function collectSourceFiles(directory: string, files: string[] = []): string[] {
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      if (entry !== 'dist' && entry !== 'node_modules') {
        collectSourceFiles(fullPath, files);
      }
      continue;
    }

    if (SOURCE_EXTENSIONS.includes(extname(entry))) files.push(fullPath);
  }

  return files;
}

function isWithin(filePath: string, directory: string): boolean {
  const relativePath = relative(directory, filePath);
  return relativePath !== '' && !relativePath.startsWith(`..${sep}`) && relativePath !== '..';
}

function resolveImport(importer: string, specifier: string, sourceRoot: string): string | null {
  let basePath: string;

  if (specifier.startsWith('@/')) {
    basePath = join(sourceRoot, 'src', specifier.slice(2));
  } else if (specifier.startsWith('.')) {
    basePath = resolve(dirname(importer), specifier);
  } else {
    return null;
  }

  const candidates = [
    ...(SOURCE_EXTENSIONS.includes(extname(basePath)) ? [basePath] : []),
    ...SOURCE_EXTENSIONS.map((extension) => `${basePath}${extension}`),
    ...SOURCE_EXTENSIONS.map((extension) => join(basePath, `index${extension}`)),
  ];

  return candidates.find((candidate) => {
    try {
      return statSync(candidate).isFile();
    } catch {
      return false;
    }
  }) ?? null;
}

function scriptKind(filePath: string): ts.ScriptKind {
  switch (extname(filePath)) {
    case '.tsx':
      return ts.ScriptKind.TSX;
    case '.jsx':
      return ts.ScriptKind.JSX;
    case '.js':
      return ts.ScriptKind.JS;
    default:
      return ts.ScriptKind.TS;
  }
}

function importedFiles(filePath: string, sourceRoot: string): string[] {
  const sourceFile = ts.createSourceFile(
    filePath,
    readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    scriptKind(filePath),
  );
  const imports = new Set<string>();

  const addModuleSpecifier = (node: ts.Node): void => {
    if (ts.isStringLiteralLike(node)) imports.add(node.text);
  };

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node)) {
      addModuleSpecifier(node.moduleSpecifier);
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      addModuleSpecifier(node.moduleSpecifier);
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference)
    ) {
      if (node.moduleReference.expression) {
        addModuleSpecifier(node.moduleReference.expression);
      }
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1
    ) {
      addModuleSpecifier(node.arguments[0]);
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument)
    ) {
      addModuleSpecifier(node.argument.literal);
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return [...imports]
    .map((specifier) => resolveImport(filePath, specifier, sourceRoot))
    .filter((imported): imported is string => imported !== null);
}

function unreachableSourceFiles(
  sourceRoot: string,
  entryPoints: readonly string[],
): string[] {
  const absoluteSourceRoot = resolve(sourceRoot);
  const sourceFiles = collectSourceFiles(join(absoluteSourceRoot, 'src'));
  const pending = entryPoints.map((entryPoint) => resolve(absoluteSourceRoot, entryPoint));
  const reachable = new Set<string>();

  while (pending.length > 0) {
    const current = pending.pop();
    if (!current || reachable.has(current)) continue;
    if (!sourceFiles.includes(current)) {
      throw new Error(
        `Application entry point does not exist: ${relative(absoluteSourceRoot, current)}`,
      );
    }
    reachable.add(current);
    pending.push(...importedFiles(current, absoluteSourceRoot));
  }

  return sourceFiles
    .filter((sourceFile) => !reachable.has(sourceFile))
    .map((sourceFile) => relative(absoluteSourceRoot, sourceFile))
    .sort();
}

export function findUnreachableSourceFiles(
  sourceRoot = DEFAULT_SOURCE_ROOT,
  entryPoints: readonly string[] = APPLICATION_ENTRY_POINTS,
): string[] {
  return unreachableSourceFiles(sourceRoot, entryPoints);
}

export function findUnusedUiComponents(sourceRoot = DEFAULT_SOURCE_ROOT): string[] {
  const absoluteSourceRoot = resolve(sourceRoot);
  const uiDirectory = join(absoluteSourceRoot, UI_DIR);

  return findUnreachableSourceFiles(sourceRoot)
    .map((sourceFile) => resolve(absoluteSourceRoot, sourceFile))
    .filter((sourceFile) => isWithin(sourceFile, uiDirectory))
    .map((sourceFile) => relative(absoluteSourceRoot, sourceFile))
    .sort();
}

export function validateUiComponents(sourceRoot = DEFAULT_SOURCE_ROOT): void {
  const unusedComponents = findUnusedUiComponents(sourceRoot);

  if (unusedComponents.length === 0) {
    console.log('UI component reachability check passed: every UI component is used.');
    return;
  }

  console.error('Unused UI components found:');
  for (const component of unusedComponents) console.error(`  - ${component}`);
  throw new Error(
    `${unusedComponents.length} UI component(s) are not reachable from application source.`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  validateUiComponents();
}