# Memory Index

- [Nova Havens color system](color-system.md) — one gold only (#D4A24C, --primary); #F2CD6B retired; no hardcoded hexes; accent rules documented in index.css.
- [Monorepo commit hooks](monorepo-commit-hooks.md) — install shared hooks at the root and validate the staged commit candidate, not unrelated working-tree edits.
- [Targeted Playwright runs](targeted-playwright-runs.md) — invoke Nova Havens Playwright through its Nix wrapper and package-local binary when filtering tests.
- [Nova Havens build env vars](nova-havens-build-env.md) — the Vite config hard-fails unless PORT and BASE_PATH are set, so ad-hoc builds must pass both.
- [Prerender idempotence](prerender-idempotence.md) — post-build route generation must tolerate existing prerendered bodies because validation may rerun it without rebuilding Vite.
- [FAQ content source of truth](faq-content-source-of-truth.md) — keep rendered FAQs, llms.txt, and FAQPage schemas synced; same hand-duplication risk applies to How It Works steps.
- [Team roster sync lag](team-roster-sync-lag.md) — a valid but stale Object Storage roster can hide newly added fallback members until the next successful sync.
- [llms.txt article selection](llms-blog-selection.md) — list the three confirmed housing and family articles; omit the property-owner article.
- [Vite lazy-route cache recovery](nova-havens-vite-cache.md) — stale optimized modules can mimic duplicate React after dependency cleanup; clear the cache and restart before editing hooks.
- [Node source integration tests](node-source-integration-tests.md) — direct Node type-strip workers need explicit TS module specifiers throughout imported workspace packages.
- [Contact rate-limit retention](contact-rate-limit-retention.md) — cleanup must use each namespace’s window length and the database clock so active buckets survive.
- [Nova Havens design-system migration](nova-havens-design-system.md) — live screens consume the approved package; preserve dark-first fidelity and keep app-only compositions local.
- [Visual regression tolerance](visual-regression-tolerance.md) — green ≠ correct (shifts hide under the 1% full-page threshold); also, a diffuse antialiasing diff ≠ a real regression.
- [Fallback inventory drift checks](fallback-inventory-drift-checks.md) — hand-maintained fixture fallback lists need an automated diff against generated source (not tokens.json alone) or they silently drift.
- [Nova Havens analytics taxonomy](analytics-taxonomy.md) — 8-event custom taxonomy (conversion + engagement) via shared trackEvent wrapper; keep naming/location conventions consistent for new events.
