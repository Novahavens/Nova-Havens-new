---
name: Node source integration tests
description: Constraint for child-process integration tests that execute TypeScript source directly with Node.
---

Direct Node execution with `--experimental-strip-types` does not apply bundler-style
extension resolution. Any workspace package imported by the child process, along
with its transitive local imports, must use explicit `.ts` module specifiers and
enable TypeScript's `allowImportingTsExtensions` option.

**Why:** A source-level integration worker should not depend on generated,
ignored build output, but Node otherwise fails before the test can exercise the
application.

**How to apply:** When adding a child-process test that imports workspace
source, verify the complete import chain with Node directly; keep the worker
focused so unrelated services do not initialize during the test.