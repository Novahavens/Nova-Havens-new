---
name: Comparing inline percentage styles in Playwright
description: toHaveCSS resolves to computed pixels, which cannot match a captured inline percentage style value.
---

When asserting that an element's inline `style.width` (or similar percentage-based inline style) stays unchanged across a wait, capture the value with `locator.evaluate((el) => el.style.width)` on both sides and compare the two strings directly with `expect(a).toBe(b)`.

**Why:** `expect(locator).toHaveCSS('width', capturedValue)` resolves the *computed* style, which Chromium reports in pixels (e.g. `"30.75px"`), never in the original percentage unit. Comparing it against a value captured as `el.style.width` (e.g. `"26.6667%"`) always fails, even when the style truly has not changed — the two representations can never be textually equal.

**How to apply:** Pick one representation and stay in it for both the "before" and "after" reads. For inline percentage-based styles, use `evaluate` for both sides and compare with plain `expect(...).toBe(...)`. Reserve `toHaveCSS` for cases where you already know the expected value in its computed (resolved) form, e.g. a literal pixel or color value Chromium is expected to report that way.
