---
name: Playwright touch gesture simulation
description: How to simulate a held or moving touch (not just a tap) in Nova Havens Playwright tests.
---

Playwright's built-in touch APIs (`page.touchscreen.tap()`, `locator.tap()`) only
synthesize an instantaneous stationary tap — they fire touchstart+touchend in
one call and cannot hold a touch open across a wait or move it partway
through a gesture (touchmove). Testing a "paused while a touch is in
progress" contract, or a real swipe with a held drag, needs a different
approach.

**Why:** elegant-carousel.tsx's touch-pause fix needed a test that starts a
touch, waits several seconds without ending it, and confirms autoplay didn't
fire — `tap()` completes the whole gesture synchronously, so it can't express
"the touch is still down."

**How to apply:** Use `locator.evaluate()` to construct real `Touch`/
`TouchEvent` objects directly in the browser and `element.dispatchEvent(event)`
them, with one call per touchstart/touchmove/touchend so the test can
`waitForTimeout` between them. This only works in a browser context with
`hasTouch: true` (Nova Havens' `mobile-chrome` project); gate the test with
the same `test.skip(test.info().project.name !== 'mobile-chrome', ...)`
pattern already used for other touch/mobile-only checks.
