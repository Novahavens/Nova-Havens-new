# Visual Smoke Tests

## What they do

`tests/smoke.spec.ts` runs Playwright against a fresh Vite dev server and
checks that every key page loads without a JavaScript console error.  The tests
run in two projects — `chromium` (desktop) and `mobile-chrome` (390 × 844 px)
— so both viewport classes are covered.

## Running locally

Before the first run (or after the Playwright version is bumped), install the
browser binary:

```bash
pnpm --filter @workspace/nova-havens exec playwright install chromium
```

Then run the tests:

```bash
# Compare against saved snapshots
pnpm --filter @workspace/nova-havens test:smoke

# Re-create baseline snapshots (after intentional UI changes)
pnpm --filter @workspace/nova-havens test:smoke:update
```

### Chromium libraries on NixOS

The Replit NixOS environment ships Chromium's native dependencies in
`/nix/store` rather than the standard system paths that Playwright expects.
The `test:smoke` and `test:smoke:update` scripts use
`scripts/with-nix-chromium-libs.sh`, which starts with the library paths
provided by the active Nix environment and checks the installed Playwright
Chromium binary for unresolved libraries. Any missing libraries are located in
the current Nix store at runtime, so NixOS channel updates do not require
committing new store hashes.

If a required library is not available in the current Nix environment, the
wrapper fails with the unresolved library names and points to `replit.nix`
instead of allowing Chromium to fail later with an opaque launch error.

## CI / validation workflow

A `smoke-tests` validation workflow is registered in `.replit`:

```toml
[[workflows.workflow]]
name = "smoke-tests"
author = "agent"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "pnpm --filter @workspace/nova-havens test:smoke"

[workflows.workflow.metadata]
isValidation = true
```

Replit runs all `isValidation = true` workflows as a required gate before each
deployment.  A failing smoke test blocks the deployment, ensuring regressions
never reach users.

## Adding tests for new pages

When a new route is added to the site, add a corresponding `test` block to
`tests/smoke.spec.ts` following the existing pattern:

```ts
test('new-page loads without JS errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  await page.goto('/new-page');
  await page.waitForLoadState('networkidle');
  expect(errors).toHaveLength(0);
});
```

Then run `pnpm test:smoke:update` once to create the baseline snapshots, and
commit both the spec and the snapshots.

## Configuration

| File | Purpose |
| ---- | ------- |
| `playwright.config.ts` | Playwright project definitions, snapshot paths, webServer config |
| `tests/smoke.spec.ts`  | Individual page smoke tests |
| `tests/__snapshots__/` | Committed baseline screenshots (one per project × page) |
