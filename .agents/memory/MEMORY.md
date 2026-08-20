# Memory Index

- [Nova Havens color system](color-system.md) — one gold only (#D4A24C, --primary); #F2CD6B retired; no hardcoded hexes; accent rules documented in index.css.
- [Monorepo commit hooks](monorepo-commit-hooks.md) — install shared hooks at the root and validate the staged commit candidate, not unrelated working-tree edits.
- [Targeted Playwright runs](targeted-playwright-runs.md) — invoke Nova Havens Playwright through its Nix wrapper and package-local binary when filtering tests.
- [Prerender idempotence](prerender-idempotence.md) — post-build route generation must tolerate existing prerendered bodies because validation may rerun it without rebuilding Vite.
