---
name: Targeted Playwright runs
description: How to run a filtered Nova Havens Playwright test reliably in the Replit Nix environment.
---

Run targeted Nova Havens Playwright checks through the project's Nix Chromium library wrapper, passing the package-local Playwright binary to the wrapper.

**Why:** Direct Playwright launches can fail because Chromium cannot find Nix-provided shared libraries such as `libgbm.so.1`. Passing filters through the chained smoke package script can also insert an extra `--`, causing Playwright to ignore the intended project and grep filters.

**How to apply:** For focused checks, run from the Nova Havens package directory and invoke the Nix wrapper with `./node_modules/.bin/playwright`, followed by the normal Playwright arguments. Keep the existing smoke script for unfiltered full-suite runs.

Regenerating snapshots for every project in one background run can stall indefinitely on the first test with no output. Update baselines one `--project=` at a time instead (each finishes in under a minute), then verify with a single full run through the smoke-tests workflow, which reports reliably.

Bare `--update-snapshots` (no value) uses Playwright's "changed" preset: it only rewrites a baseline whose new render actually crosses the configured diff threshold, and silently leaves matching ones untouched. Seeing some `--project=` runs finish with no "is re-generated" line is expected, not a sign the fix had no effect there — see [visual regression tolerance](visual-regression-tolerance.md).