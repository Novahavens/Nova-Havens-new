---
name: FAQ content source of truth
description: The audience FAQ is shared across rendered pages, machine-readable content, and route schemas.
---

Keep the public audience FAQ synchronized across the homepage, About page, `llms.txt`, and every matching `FAQPage` schema by consuming the shared FAQ data rather than maintaining local copies.

**Why:** A copy-and-paste FAQ update can leave visible content, machine-readable content, and search structured data describing different audiences or question sets.

**How to apply:** When the audience FAQ changes, update the shared data first, regenerate derived public content, rebuild prerendered HTML, and refresh affected visual baselines.

**Broader pattern:** This isn't unique to FAQs. Other homepage content blocks — e.g. the "How It Works" steps — are similarly hand-duplicated across `pages/HomePage.tsx` (rendered UI), `lib/routeContent.ts` (prerendered crawler HTML mirror), and `lib/routeMeta.ts` (JSON-LD `@graph` blocks), with no shared source and no automated parity check between them. Before considering any homepage content edit complete, grep the edited section's key phrases across `pages/`, `lib/routeContent.ts`, and `lib/routeMeta.ts` to find every copy that needs the same update.