---
name: Nova Havens design-system extraction
description: Durable decisions for the source-backed Nova Havens design-system artifact and its approval-gated migration.
---

The Nova Havens design-system artifact began as an approval-gated source of
truth for the live app. Its dark tokens mirror the source app; its light tokens
are an accessible counterpart because the source presentation is dark-only. The
source has no standalone wordmark asset, so the system uses the text wordmark
treatment and must not invent a logo file. The live app now consumes the
approved package directly for theme and pilot primitives.

**Why:** The design-system pilot was approved for production screens after the
extraction pass, so keeping duplicate local primitives would let the live app
drift from the reusable visual language.

**How to apply:** Keep the one-gold rule and dark-first presentation. Import
package-provided web primitives, theme, and helpers directly; retain only
product-specific compositions and app-only layout variables in the consumer.