---
name: Property-count source of truth
description: How Nova Havens keeps its public property-network-size claim consistent between React pages and prerendered crawler HTML.
---

Nova Havens' only verified property-network size is `totalProperties` in `public/property-stats.json`, synced daily from Monday.com. Multiple unbacked figures ("60,000+", "20,000+") had drifted into the homepage, contact page, and prerender templates independently before this was fixed.

**Why:** Each surface (React homepage, React contact page, prerendered crawler HTML) previously hardcoded its own number rather than reading the synced figure, so they silently diverged whenever anyone edited one copy without the others — the same class of bug as the service-area claim (see [Nova Havens service area](nova-havens-service-area.md)).

**How to apply:** Never hardcode a property-count figure. Client-side React reads it via the `usePropertyStats` hook (`src/lib/propertyStats.ts`), which fetches `/property-stats.json` and falls back to `FALLBACK_TOTAL_PROPERTIES` (`src/lib/companyFacts.ts`) on failure. Prerender HTML (`src/lib/routeContent.ts`) reads the same JSON file from disk at module load (via `fileURLToPath`/`readFileSync`, wrapped in try/catch with the same fallback) rather than duplicating a number. Both paths format the raw count through `formatVerifiedPropertyCount()`, which floors to the nearest thousand (e.g. 12,976 → "12,000+") so the claim stays literally true across daily sync fluctuations. Adding another surface that states this figure must read through one of these two paths, never a new literal.
