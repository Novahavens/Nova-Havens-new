---
name: Testing the prerender stale-build guard's wiring
description: How to regression-test that prerender.ts / validate-prerender.ts still call assertBuildFresh at the right point, without copying the source tree or touching real build output.
---

**Rule:** prerender.ts and scripts/validate-prerender.ts are top-level scripts (no
`import.meta.main` guard, unlike scripts/validate-bundle-budget.ts) — importing
them always runs them, including their `process.exit()` calls. That rules out
testing them by importing an exported function the way
tests/validateBundleBudget.test.ts does. Regression-test the wiring by running
them as real subprocesses (`node --experimental-strip-types <script>`, same cwd
and args their own usage comments document) against a controlled fixture,
asserting exit code, stderr message, and that no files were written/healed.

**Why a full source-tree copy is unnecessary:** these scripts import their
project's route/content modules via plain relative paths (no bundler
aliases), so the *real* `src/` tree can stay in place — only the `distDir`
half of the freshness comparison needs to point at a disposable fixture.
Both scripts accept a test-only env var for this
(`PRERENDER_TEST_DIST_DIR`, `VALIDATE_PRERENDER_TEST_DIST_DIR`) that
overrides just `distDir`; `sourceRoot` stays the real artifact root. A
fixture `index.html` dated to year 2000 is unambiguously "stale" against any
real checkout without ever touching real source mtimes; one dated a few
minutes in the future is unambiguously "fresh" — don't rely on incidental
wall-clock ordering (e.g. "freshly written, so it's newer"), since a
same-second edit elsewhere can make that flaky.

**How to apply:** when adding this style of override, keep it to the output
path only (never sourceRoot), and confirm existing callers are unaffected
when the env var is unset. Follow-on gotcha: `package.json` and other
`scripts/lib/buildFreshness.ts` `SOURCE_PATHS` entries count as tracked
source — editing any of them makes the *real* dist/public legitimately stale,
so re-run `pnpm run build` afterward or the `jsonld`/`prerender-jsonld`
validation workflows will (correctly) start failing on staleness you just
introduced.
