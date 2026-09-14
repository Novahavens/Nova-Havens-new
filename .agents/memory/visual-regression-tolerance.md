---
name: Visual regression tolerance can mask small section regressions
description: Why a Nova Havens smoke-test project can stay green while a real layout bug is visible in one page section.
---

**Rule:** A passing full-page Playwright screenshot test (`maxDiffPixelRatio: 0.01` in `artifacts/nova-havens/tests/smoke.spec.ts`) does not guarantee every section is pixel-correct — it only guarantees the differing area is under 1% of the *entire* page's pixels.

**Why:** A small misalignment (e.g. a stray margin utility shifting one card by ~16px) can stay under that 1% threshold on wide/short viewports (desktop `chromium`, `tablet-chrome`) where the full page is very tall relative to the affected section, while the *same* bug crosses the threshold on narrow/tall ones (`mobile-chrome`) where the section is a bigger fraction of a shorter page. This was confirmed directly: fixing the Trust Strip stat-tile's stray `-m-4` only caused Playwright to rewrite the `mobile-chrome`/`mobile-chrome-dark` baselines under `--update-snapshots` (default "changed" preset) — `chromium`, `tablet-chrome`, and their dark variants matched their existing baseline both before and after the fix, meaning those projects had been silently passing the whole time the bug was live.

**How to apply:** Don't treat "smoke tests are green" as proof a specific above-the-fold section is correct on every viewport — visually inspect the section directly (e.g. screenshot the element/section, not just the full page) when investigating or fixing a reported layout/spacing bug. When adding a regression test for a small section, prefer a tightly-toleranced element-scoped screenshot over relying on the full-page one.
