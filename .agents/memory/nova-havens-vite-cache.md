---
name: Nova Havens Vite lazy-route cache recovery
description: Recovery guidance for stale Vite optimized dependencies after Nova Havens dependency or lockfile changes
---

When a lazy-loaded Nova Havens route reports an invalid hook call together with a failed dynamic import or a 504 from an optimized dependency, treat the running dev process and its optimization cache as suspect before changing React code.

**Why:** A stale Vite process can keep serving an invalid optimized module graph after dependency cleanup, making a healthy single-React installation appear to have a hook mismatch.

**How to apply:** Stop the orphaned Nova Havens dev process, clear the artifact's Vite cache, restart the managed web workflow, and verify the affected lazy route plus its optimized dependencies before editing application code.