---
name: Property-count source of truth
description: How Nova Havens keeps its public property-network-size claim consistent between React pages and prerendered crawler HTML.
---

Nova Havens' only verified property-network size is `totalProperties` in `public/property-stats.json`, synced daily from Monday.com. Multiple unbacked figures ("60,000+", "20,000+") had drifted into the homepage, contact page, and prerender templates independently before this was fixed.

**Why:** Each surface (React homepage, React contact page, prerendered crawler HTML) previously hardcoded its own number rather than reading the synced figure, so they silently diverged whenever anyone edited one copy without the others — the same class of bug as the service-area claim (see [Nova Havens service area](nova-havens-service-area.md)).

**How to apply:** Never hardcode a property-count figure. Client-side React and prerender HTML must read the same public snapshot and use the shared conservative formatter. Describe the result as a dated “verified network properties” snapshot, not “live” or “active” inventory: the source counts usable database records, but does not prove real-time availability. Adding another surface that states this figure must use the same snapshot and terminology, never a new literal.
