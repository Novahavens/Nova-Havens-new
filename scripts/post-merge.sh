#!/bin/bash
set -e
pnpm install --frozen-lockfile

# The API server applies the project's append-only, advisory-lock-protected
# migrations when it starts. Do not run drizzle-kit push here: schema_migrations
# is intentionally outside Drizzle's declarative schema, so push treats it as a
# destructive deletion and prompts in this non-interactive setup hook.
