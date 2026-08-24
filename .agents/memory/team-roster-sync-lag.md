---
name: Team roster sync lag
description: How the Meet the Team page should behave while the scheduled roster export is stale or unavailable
---

The live team roster can be a valid, nonempty response while still lagging behind the fallback roster. Matching live records should remain authoritative, but fallback-only additions must stay visible until a successful sync publishes them.

**Why:** The roster export depends on external sheet permissions and can fail or remain stale without making the API response invalid. Replacing the fallback wholesale would silently hide a newly added team member.

**How to apply:** When adding a team member, update the fallback data and sync role mapping, and preserve unmatched fallback entries when hydrating from the live roster. Keep the sync failure non-destructive.