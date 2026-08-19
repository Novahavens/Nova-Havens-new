import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { chromium } from "@playwright/test";

const projectRoot = resolve(import.meta.dirname, "..");
const wrapperPath = join(projectRoot, "scripts", "with-nix-chromium-libs.sh");

function findExecutable(root: string, filename: string): string | undefined {
  if (!existsSync(root)) return undefined;

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const entryPath = join(root, entry.name);
    if (entry.isFile() && entry.name === filename) return entryPath;
    if (entry.isDirectory()) {
      const match = findExecutable(entryPath, filename);
      if (match) return match;
    }
  }
}

function launchThroughWrapper(executable: string): string {
  return execFileSync("bash", [wrapperPath, executable, "--version"], {
    cwd: projectRoot,
    encoding: "utf8",
    env: process.env,
  });
}

function getChromiumExecutable(): string {
  const chromiumExecutable = chromium.executablePath();
  assert.ok(
    existsSync(chromiumExecutable),
    `Playwright Chromium is not installed at ${chromiumExecutable}. Run "playwright install chromium" first.`,
  );
  return chromiumExecutable;
}

test("the Nix library wrapper launches Playwright Chromium", () => {
  assert.match(
    launchThroughWrapper(getChromiumExecutable()),
    /Chrome|Chromium/i,
  );
});

test("the Nix library wrapper launches Playwright chrome-headless-shell", () => {
  const chromiumExecutable = getChromiumExecutable();
  const browserCacheDir = dirname(dirname(dirname(chromiumExecutable)));
  const headlessShell = findExecutable(
    browserCacheDir,
    "chrome-headless-shell",
  );
  assert.ok(
    headlessShell,
    `Could not find chrome-headless-shell beside ${chromiumExecutable}. Playwright's browser-cache layout may have changed.`,
  );

  assert.match(launchThroughWrapper(headlessShell), /Chrome|Chromium/i);
});
