# Memory Index

- [Nova Havens color system](color-system.md) — one gold only (#D4A24C, --primary); #F2CD6B retired; no hardcoded hexes; accent rules documented in index.css.
- [Monorepo commit hooks](monorepo-commit-hooks.md) — install shared hooks at the root and validate the staged commit candidate, not unrelated working-tree edits.
- [Targeted Playwright runs](targeted-playwright-runs.md) — invoke Nova Havens Playwright through its Nix wrapper and package-local binary when filtering tests.
- [Nova Havens build env vars](nova-havens-build-env.md) — the Vite config hard-fails unless PORT and BASE_PATH are set, so ad-hoc builds must pass both.
- [Prerender idempotence](prerender-idempotence.md) — post-build route generation must tolerate existing prerendered bodies because validation may rerun it without rebuilding Vite.
- [FAQ content source of truth](faq-content-source-of-truth.md) — keep rendered FAQs, llms.txt, and FAQPage schemas on the shared audience question set.
- [Team roster sync lag](team-roster-sync-lag.md) — a valid but stale Object Storage roster can hide newly added fallback members until the next successful sync.
- [llms.txt article selection](llms-blog-selection.md) — list the three confirmed housing and family articles; omit the property-owner article.
- [Vite lazy-route cache recovery](nova-havens-vite-cache.md) — stale optimized modules can mimic duplicate React after dependency cleanup; clear the cache and restart before editing hooks.
- [Node source integration tests](node-source-integration-tests.md) — direct Node type-strip workers need explicit TS module specifiers throughout imported workspace packages.
