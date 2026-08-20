---
name: Nova Havens build environment variables
description: The Nova Havens Vite config hard-fails without PORT and BASE_PATH, so ad-hoc builds outside the workflow need them set explicitly.
---

Running the Nova Havens production build (or any `vite build`/analysis run) from a
plain shell fails with "PORT environment variable is required" and then
"BASE_PATH environment variable is required" before Vite even loads.

**Why:** the artifact's Vite config validates both variables at load time so the
managed workflow's per-artifact port and preview path can never be silently
guessed. The workflow supplies them; a manual shell does not.

**How to apply:** prefix ad-hoc builds with `PORT=<free port> BASE_PATH=/`
(e.g. `PORT=5000 BASE_PATH=/ pnpm run build`). Use `BASE_PATH=/` so routes
resolve at their canonical paths, matching what the Playwright config does.
