---
name: FAQ content source of truth
description: The audience FAQ is shared across rendered pages, machine-readable content, and route schemas.
---

Keep the public audience FAQ synchronized across the homepage, About page, `llms.txt`, and every matching `FAQPage` schema by consuming the shared FAQ data rather than maintaining local copies.

**Why:** A copy-and-paste FAQ update can leave visible content, machine-readable content, and search structured data describing different audiences or question sets.

**How to apply:** When the audience FAQ changes, update the shared data first, regenerate derived public content, rebuild prerendered HTML, and refresh affected visual baselines.