---
name: Fallback inventory drift checks
description: Why hand-maintained fixture fallback lists need an automated diff against the generated source of truth, and which file that source actually is.
---

Nova Havens' UI/design-system validator keeps small hand-written "fallback"
inventories (e.g. allowed theme variable names) for isolated test fixtures
that have no sibling design-system package to read from directly. Any such
fallback list needs an automated check that diffs it against the real
generated source -- otherwise it silently drifts: a token or component added
to the live design system stays invisible to fixture-based tests forever,
even though the real app is already protected because it reads the live
stylesheet directly.

**Why:** a manual "remember to keep this list in sync" comment is not
enforced; only a running check is. The failure mode is silent -- the real app
keeps working, so nothing draws attention to the gap until a rename or
removal test should have caught something and didn't.

**How to apply:** when adding or auditing a fallback/allowlist that exists
only to keep isolated fixtures useful, add a check that reads the actual
generated source and reports both directions of drift (present in reality
but missing from the fallback, and vice versa). Wire it into both the
isolated test suite and the real validator run so it fails loudly in either
context, and make it a no-op (not an error) when the generated source isn't
reachable from whatever fixture root is being validated -- that's the
expected case for fixtures that don't model the sibling package at all.

For the design system's CSS custom-property names specifically, tokens.json
is NOT a complete inventory -- it only holds raw color/typography/radius/
spacing *values*. Many derived variable names (Tailwind `--color-*` aliases,
the `--text-*` type scale, the `--radius-*` scale, `--elevate-*`, computed
`*-border` vars, `--opaque-button-border-intensity`, etc.) exist only in
scripts/theme-template.css and the generated src/index.css. Diff against the
generated stylesheet, not tokens.json, when the goal is a full variable-name
inventory.
