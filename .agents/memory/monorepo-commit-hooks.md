---
name: Monorepo commit hooks
description: Where to configure Git hooks when a workspace contains artifact packages.
---

**Rule:** Configure `simple-git-hooks` and its `prepare` script in the workspace root. Keep artifact-specific validation commands in their package, and invoke staged-file modes from root-level `lint-staged` configuration.

**Why:** Running the hook installer from an artifact package treats that package as the hook base and can create a local `.git` directory instead of installing the hook for the shared repository. A full working-tree scan can both miss index-only violations and block unrelated commits because of unstaged edits.

**How to apply:** When adding or changing a pre-commit check for an artifact, define a focused package script there, but add the hook installer and staged-file glob to the root `package.json`. Verify partially staged files by making the index invalid while leaving the working copy clean.