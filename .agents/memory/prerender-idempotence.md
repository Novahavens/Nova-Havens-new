---
name: Prerender idempotence
description: Why Nova Havens post-build route generation must be safe to run repeatedly against existing output.
---

**Rule:** Keep post-build prerender generation idempotent when its input shell may already contain an injected route body.

**Why:** Validation can rerun prerendering against an existing Vite output directory. If generation assumes an empty root, stale content can be copied into every route and make canonical-content checks fail.

**How to apply:** When changing prerendered bodies or validation behavior, run the prerender step twice before validating the generated routes.