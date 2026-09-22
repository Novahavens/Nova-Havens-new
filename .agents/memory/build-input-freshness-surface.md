---
name: Build-input surface for the stale-build guard
description: Why the Nova Havens freshness guard tracks "artifact root minus an exclusion set" instead of an enumerated include list, and how to extend it.
---

The stale-build guard resolves its build-input surface from the artifact root minus a named, path-specific exclusion set, rather than an enumerated include list.

**Why:** an include list drifts silently in the one direction that matters — a new build input nobody remembers to register never stales `dist/public`, so every consumer of the guard keeps reporting "fresh" over output that no longer matches its source. Inverting it makes the same forgetfulness fail safe: an unrecognised entry counts as an input, and the worst outcome is an unnecessary rebuild rather than silently stale output.

**How to apply:** when something new appears in the artifact root, do nothing — it is tracked automatically. Only add an exclusion when the entry genuinely cannot affect build output, and keep exclusions as specific paths (they're matched at every depth) — excluding a whole directory reopens the same drift hole inside it.

**Known gap:** the surface stops at the artifact root, so sources of workspace packages the artifact imports (e.g. the design system) and the workspace lockfile can change the bundle without staling it.
