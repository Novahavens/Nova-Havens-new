---
name: Contact rate-limit retention
description: Expiry cleanup must remain correct when contact limiter namespaces use different window lengths.
---

Contact rate-limit cleanup must filter by namespace and compare each row with
that namespace's window length using the database clock. A single global
cutoff can remove an active bucket when namespaces have different windows.

**Why:** Email and sender buckets are separate fixed-window limiters, and their
configuration may diverge even if their current production windows match.

**How to apply:** Any new limiter namespace must use its own cleanup predicate
and keep the expiry query indexed by the stored window start time.
