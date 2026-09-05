/**
 * Reports source files that are not reachable from the application's entry
 * point.
 *
 * The UI directory is intentionally kept small: every component stored there
 * is a candidate for use in a route and can bring a runtime dependency with
 * it. Following the source import graph catches both directly unused files
 * and files referenced only by another unused UI primitive. The same graph is
 * also used by the informational application-source report.
 *
 * Run with: node --experimental-strip-types scripts/validate-ui-components.ts
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as ts from 'typescript';

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const UI_DIR = join('src', 'components', 'ui');
const DESIGN_SYSTEM_PACKAGE = '@workspace/nova-havens-design-system';
const DESIGN_SYSTEM_STYLE_IMPORT_RE = new RegExp(
  `@import\\s+["']${DESIGN_SYSTEM_PACKAGE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/styles\\.css["']\\s*;`,
);
const DESIGN_SYSTEM_UI_DIR = join('src', 'components', 'ui');
const DESIGN_SYSTEM_STYLESHEET = join('src', 'index.css');
const DESIGN_SYSTEM_PACKAGE_STYLESHEET = join(
  '..',
  'nova-havens-design-system',
  'src',
  'index.css',
);
const DESIGN_SYSTEM_HELPER_PATHS = new Set([
  'src/lib/utils',
  'src/hooks/use-toast',
]);

/**
 * The fallback inventory keeps theme validation useful in isolated fixture
 * directories. In the real app, the inventory is read from the design-system
 * stylesheet so newly added package-owned variables are covered automatically.
 */
export const FALLBACK_DESIGN_SYSTEM_THEME_VARIABLES = [
  '--accent',
  '--accent-border',
  '--accent-foreground',
  '--app-font-mono',
  '--app-font-sans',
  '--app-font-serif',
  '--background',
  '--badge-outline',
  '--border',
  '--button-outline',
  '--card',
  '--card-border',
  '--card-foreground',
  '--chart-1',
  '--chart-2',
  '--chart-3',
  '--chart-4',
  '--chart-5',
  '--color-accent',
  '--color-accent-border',
  '--color-accent-foreground',
  '--color-background',
  '--color-border',
  '--color-card',
  '--color-card-border',
  '--color-card-foreground',
  '--color-chart-1',
  '--color-chart-2',
  '--color-chart-3',
  '--color-chart-4',
  '--color-chart-5',
  '--color-destructive',
  '--color-destructive-border',
  '--color-destructive-foreground',
  '--color-foreground',
  '--color-input',
  '--color-muted',
  '--color-muted-border',
  '--color-muted-foreground',
  '--color-popover',
  '--color-popover-border',
  '--color-popover-foreground',
  '--color-primary',
  '--color-primary-border',
  '--color-primary-foreground',
  '--color-ring',
  '--color-secondary',
  '--color-secondary-border',
  '--color-secondary-foreground',
  '--color-sidebar',
  '--color-sidebar-accent',
  '--color-sidebar-accent-border',
  '--color-sidebar-accent-foreground',
  '--color-sidebar-border',
  '--color-sidebar-foreground',
  '--color-sidebar-primary',
  '--color-sidebar-primary-border',
  '--color-sidebar-primary-foreground',
  '--color-sidebar-ring',
  '--destructive',
  '--destructive-border',
  '--destructive-foreground',
  '--elevate-1',
  '--elevate-2',
  '--font-mono',
  '--font-sans',
  '--font-serif',
  '--foreground',
  '--input',
  '--muted',
  '--muted-border',
  '--muted-foreground',
  '--opaque-button-border-intensity',
  '--popover',
  '--popover-border',
  '--popover-foreground',
  '--primary',
  '--primary-border',
  '--primary-foreground',
  '--radius',
  '--radius-lg',
  '--radius-md',
  '--radius-sm',
  '--radius-xl',
  '--ring',
  '--secondary',
  '--secondary-border',
  '--secondary-foreground',
  '--sidebar',
  '--sidebar-accent',
  '--sidebar-accent-border',
  '--sidebar-accent-foreground',
  '--sidebar-border',
  '--sidebar-foreground',
  '--sidebar-primary',
  '--sidebar-primary-border',
  '--sidebar-primary-foreground',
  '--sidebar-ring',
  '--spacing',
  '--text-2xl',
  '--text-2xl--line-height',
  '--text-3xl',
  '--text-3xl--line-height',
  '--text-4xl',
  '--text-4xl--line-height',
  '--text-5xl',
  '--text-5xl--line-height',
  '--text-6xl',
  '--text-6xl--line-height',
  '--text-7xl',
  '--text-7xl--line-height',
  '--text-8xl',
  '--text-8xl--line-height',
  '--text-9xl',
  '--text-9xl--line-height',
  '--text-base',
  '--text-base--line-height',
  '--text-lg',
  '--text-lg--line-height',
  '--text-sm',
  '--text-sm--line-height',
  '--text-xl',
  '--text-xl--line-height',
  '--text-xs',
  '--text-xs--line-height',
] as const;

/**
 * The fallback inventory keeps this validator useful in isolated fixture
 * directories. In the real app, the inventory is augmented from the design
 * system package so adding a new package primitive does not silently weaken
 * the migration guard.
 */
export const FALLBACK_DESIGN_SYSTEM_UI_COMPONENTS = [
  'button',
  'card',
  'elegant-carousel',
  'form',
  'input',
  'label',
  'native-select',
  'sheet',
  'tabs',
  'textarea',
  'toaster',
  'toast',
] as const;

export const DEFAULT_SOURCE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
export const APPLICATION_ENTRY_POINTS = ['src/main.tsx'] as const;

/**
 * Source modules used by build-time entry points rather than the browser
 * entry point. Keep this list explicit: adding a source file here should be a
 * deliberate decision, not an accidental way to silence the report.
 */
export const DEFAULT_APPLICATION_SOURCE_EXCLUSIONS = [
  'src/lib/routeContent.ts',
  'src/lib/validateRules.ts',
] as const;

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

function withoutCssComments(stylesheet: string): string {
  return stylesheet.replace(/\/\*[\s\S]*?\*\//g, '');
}

function customPropertyNames(stylesheet: string): Set<string> {
  return new Set(
    [...withoutCssComments(stylesheet).matchAll(/(--[a-z0-9-]+)\s*:/gi)].map(
      (match) => match[1],
    ),
  );
}

function designSystemThemeVariables(sourceRoot: string): ReadonlySet<string> {
  const packageStylesheetPath = resolve(sourceRoot, DESIGN_SYSTEM_PACKAGE_STYLESHEET);
  if (!existsSync(packageStylesheetPath)) {
    return new Set(FALLBACK_DESIGN_SYSTEM_THEME_VARIABLES);
  }

  return customPropertyNames(readFileSync(packageStylesheetPath, 'utf8'));
}

function isWithin(filePath: string, directory: string): boolean {
  const relativePath = relative(directory, filePath);
  return relativePath !== '' && !relativePath.startsWith(`..${sep}`) && relativePath !== '..';
}

function normalizedSourcePath(filePath: string): string {
  return filePath.split(sep).join('/');
}

function isExcludedSourceFile(
  filePath: string,
  sourceRoot: string,
  exclusions: readonly string[],
): boolean {
  const relativePath = normalizedSourcePath(relative(sourceRoot, filePath));

  return exclusions.some((exclusion) => {
    const normalizedExclusion = normalizedSourcePath(exclusion).replace(/\/+$/, '');
    return (
      relativePath === normalizedExclusion ||
      relativePath.startsWith(`${normalizedExclusion}/`)
    );
  });
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

function moduleSpecifiers(filePath: string): string[] {
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

  return [...imports];
}

function importedFiles(filePath: string, sourceRoot: string): string[] {
  return moduleSpecifiers(filePath)
    .map((specifier) => resolveImport(filePath, specifier, sourceRoot))
    .filter((imported): imported is string => imported !== null);
}

function designSystemUiComponents(sourceRoot: string): Set<string> {
  const componentNames = new Set<string>(FALLBACK_DESIGN_SYSTEM_UI_COMPONENTS);
  const packageUiDirectory = resolve(sourceRoot, '..', 'nova-havens-design-system', DESIGN_SYSTEM_UI_DIR);

  if (!existsSync(packageUiDirectory)) return componentNames;

  for (const filePath of collectSourceFiles(packageUiDirectory)) {
    const relativePath = relative(packageUiDirectory, filePath);
    if (!relativePath.includes(sep)) {
      componentNames.add(relativePath.slice(0, -extname(relativePath).length));
    }
  }

  return componentNames;
}

function sourceRelativePath(sourceRoot: string, filePath: string): string {
  return normalizedSourcePath(relative(resolve(sourceRoot), resolve(filePath)));
}

function sourcePathWithoutExtension(sourceRoot: string, filePath: string): string {
  const relativePath = sourceRelativePath(sourceRoot, filePath);
  return relativePath.replace(/\.(?:tsx?|jsx?)$/, '');
}

function isDesignSystemUiFile(
  sourceRoot: string,
  filePath: string,
  componentNames: ReadonlySet<string>,
): boolean {
  const relativePath = sourceRelativePath(sourceRoot, filePath);
  if (!relativePath.startsWith(`${normalizedSourcePath(DESIGN_SYSTEM_UI_DIR)}/`)) {
    return false;
  }

  const componentPath = relativePath.slice(`${normalizedSourcePath(DESIGN_SYSTEM_UI_DIR)}/`.length);
  const componentName = componentPath.split('/')[0].replace(/\.(?:tsx?|jsx?)$/, '');
  return componentNames.has(componentName);
}

function isDesignSystemHelperFile(sourceRoot: string, filePath: string): boolean {
  return DESIGN_SYSTEM_HELPER_PATHS.has(sourcePathWithoutExtension(sourceRoot, filePath));
}

function isToastHookFile(sourceRoot: string, filePath: string): boolean {
  return sourcePathWithoutExtension(sourceRoot, filePath) === 'src/hooks/use-toast';
}

function localDesignSystemImportKind(
  importer: string,
  specifier: string,
  sourceRoot: string,
  componentNames: ReadonlySet<string>,
): 'ui' | 'utils' | 'toast' | null {
  const absoluteSourceRoot = resolve(sourceRoot);
  const uiPrefix = 'components/ui/';
  const normalizedSpecifier = specifier.replace(/\\/g, '/').replace(/\.(?:tsx?|jsx?)$/, '');

  if (
    normalizedSpecifier.startsWith(`@/${uiPrefix}`) &&
    componentNames.has(normalizedSpecifier.slice(`@/${uiPrefix}`.length).split('/')[0])
  ) {
    return 'ui';
  }
  if (normalizedSpecifier === '@/lib/utils' || normalizedSpecifier === '@/hooks/use-toast') {
    return normalizedSpecifier === '@/lib/utils' ? 'utils' : 'toast';
  }

  const imported = resolveImport(importer, specifier, absoluteSourceRoot);
  if (!imported) return null;
  if (isDesignSystemUiFile(absoluteSourceRoot, imported, componentNames)) return 'ui';
  if (isDesignSystemHelperFile(absoluteSourceRoot, imported)) {
    return isToastHookFile(absoluteSourceRoot, imported) ? 'toast' : 'utils';
  }
  return null;
}

function expectedDesignSystemImport(
  importer: string,
  specifier: string,
  kind: 'ui' | 'utils' | 'toast',
  sourceRoot: string,
): string {
  const normalizedSpecifier = specifier.replace(/\\/g, '/').replace(/\.(?:tsx?|jsx?)$/, '');
  if (kind === 'ui') {
    const uiPrefix = '@/components/ui/';
    const componentName = normalizedSpecifier.startsWith(uiPrefix)
      ? normalizedSpecifier.slice(uiPrefix.length).split('/')[0]
      : (() => {
          const imported = resolveImport(importer, specifier, sourceRoot);
          return imported
            ? sourceRelativePath(sourceRoot, imported)
                .slice(`${normalizedSourcePath(DESIGN_SYSTEM_UI_DIR)}/`.length)
                .split('/')[0]
                .replace(/\.(?:tsx?|jsx?)$/, '')
            : normalizedSpecifier;
        })();
    return `${DESIGN_SYSTEM_PACKAGE}/components/ui/${componentName}`;
  }

  return `${DESIGN_SYSTEM_PACKAGE}/${kind === 'utils' ? 'lib/utils' : 'hooks/use-toast'}`;
}

/**
 * Finds local copies of package-owned UI modules, cn, and the toast hook.
 */
export function findRecreatedDesignSystemFiles(sourceRoot = DEFAULT_SOURCE_ROOT): string[] {
  const absoluteSourceRoot = resolve(sourceRoot);
  const componentNames = designSystemUiComponents(absoluteSourceRoot);
  const sourceFiles = collectSourceFiles(join(absoluteSourceRoot, 'src'));
  const recreated = sourceFiles.filter((filePath) => {
    if (isDesignSystemUiFile(absoluteSourceRoot, filePath, componentNames)) return true;
    if (isToastHookFile(absoluteSourceRoot, filePath)) return true;
    if (sourcePathWithoutExtension(absoluteSourceRoot, filePath) !== 'src/lib/utils') {
      return false;
    }

    return /\b(?:export\s+)?(?:const|let|var|function)\s+cn\b|\bexport\s*\{[^}]*\bcn\b/.test(
      readFileSync(filePath, 'utf8'),
    );
  });

  return recreated.map((filePath) => relative(absoluteSourceRoot, filePath)).sort();
}

/**
 * Finds imports that bypass the design-system package for package-owned APIs.
 */
export function findDesignSystemImportViolations(
  sourceRoot = DEFAULT_SOURCE_ROOT,
): string[] {
  const absoluteSourceRoot = resolve(sourceRoot);
  const componentNames = designSystemUiComponents(absoluteSourceRoot);
  const violations: string[] = [];

  for (const filePath of collectSourceFiles(join(absoluteSourceRoot, 'src'))) {
    for (const specifier of moduleSpecifiers(filePath)) {
      const kind = localDesignSystemImportKind(
        filePath,
        specifier,
        absoluteSourceRoot,
        componentNames,
      );
      if (!kind) continue;

      const expected = expectedDesignSystemImport(
        filePath,
        specifier,
        kind,
        absoluteSourceRoot,
      );
      violations.push(
        `${relative(absoluteSourceRoot, filePath)}: ${specifier} (use ${expected})`,
      );
    }
  }

  return violations.sort();
}

/**
 * Checks that the consumer uses the package's generated theme stylesheet.
 */
export function findDesignSystemThemeViolations(
  sourceRoot = DEFAULT_SOURCE_ROOT,
): string[] {
  const absoluteSourceRoot = resolve(sourceRoot);
  const stylesheetPath = join(absoluteSourceRoot, DESIGN_SYSTEM_STYLESHEET);

  if (!existsSync(stylesheetPath)) {
    return ['src/index.css: missing the design-system styles.css import'];
  }

  const stylesheet = withoutCssComments(readFileSync(stylesheetPath, 'utf8'));
  const violations: string[] = [];

  if (!DESIGN_SYSTEM_STYLE_IMPORT_RE.test(stylesheet)) {
    violations.push('src/index.css: missing the design-system styles.css import');
  }

  const packageThemeVariables = designSystemThemeVariables(absoluteSourceRoot);
  const localThemeVariables = customPropertyNames(stylesheet);
  for (const variable of [...localThemeVariables].sort()) {
    if (packageThemeVariables.has(variable)) {
      violations.push(`src/index.css: local package-owned theme variable ${variable}`);
    }
  }

  if (/(?:^|[}\n])\s*\.dark\s*\{/m.test(stylesheet)) {
    violations.push(
      'src/index.css: scaffolded .dark token block; use the design-system theme instead',
    );
  }

  return violations.sort();
}

export function findDesignSystemDrift(sourceRoot = DEFAULT_SOURCE_ROOT): string[] {
  return [
    ...findRecreatedDesignSystemFiles(sourceRoot).map(
      (filePath) => `local package-owned module: ${filePath}`,
    ),
    ...findDesignSystemImportViolations(sourceRoot),
    ...findDesignSystemThemeViolations(sourceRoot),
  ].sort();
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
  exclusions: readonly string[] = [],
): string[] {
  const unreachableFiles = unreachableSourceFiles(sourceRoot, entryPoints);
  const absoluteSourceRoot = resolve(sourceRoot);

  return unreachableFiles.filter((sourceFile) => {
    const absoluteSourceFile = resolve(absoluteSourceRoot, sourceFile);
    return !isExcludedSourceFile(absoluteSourceFile, absoluteSourceRoot, exclusions);
  });
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

/**
 * Finds unreachable application files while leaving the shared UI directory
 * to its stricter, blocking validator. Exclusions are relative to sourceRoot
 * and can name either a file or a directory.
 */
export function findUnusedApplicationFiles(
  sourceRoot = DEFAULT_SOURCE_ROOT,
  entryPoints: readonly string[] = APPLICATION_ENTRY_POINTS,
  exclusions: readonly string[] = DEFAULT_APPLICATION_SOURCE_EXCLUSIONS,
): string[] {
  const absoluteSourceRoot = resolve(sourceRoot);
  const uiDirectory = join(absoluteSourceRoot, UI_DIR);

  return findUnreachableSourceFiles(sourceRoot, entryPoints, exclusions)
    .map((sourceFile) => resolve(absoluteSourceRoot, sourceFile))
    .filter((sourceFile) => !isWithin(sourceFile, uiDirectory))
    .map((sourceFile) => relative(absoluteSourceRoot, sourceFile))
    .sort();
}

export function validateUiComponents(sourceRoot = DEFAULT_SOURCE_ROOT): void {
  const unusedComponents = findUnusedUiComponents(sourceRoot);
  const designSystemDrift = findDesignSystemDrift(sourceRoot);

  if (unusedComponents.length > 0) {
    console.error('Unused UI components found:');
    for (const component of unusedComponents) console.error(`  - ${component}`);
  }

  if (designSystemDrift.length > 0) {
    console.error('Design-system migration violations found:');
    for (const violation of designSystemDrift) console.error(`  - ${violation}`);
  }

  if (unusedComponents.length === 0 && designSystemDrift.length === 0) {
    console.log(
      'UI component and design-system migration checks passed.',
    );
    return;
  }

  const failures = [];
  if (unusedComponents.length > 0) {
    failures.push(
      `${unusedComponents.length} UI component(s) are not reachable from application source`,
    );
  }
  if (designSystemDrift.length > 0) {
    failures.push(`${designSystemDrift.length} design-system migration violation(s)`);
  }
  throw new Error(`${failures.join('; ')}.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  validateUiComponents();
}