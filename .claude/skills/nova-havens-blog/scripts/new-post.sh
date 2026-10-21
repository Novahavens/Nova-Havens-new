#!/usr/bin/env bash
# Scaffold a new blog post in the house format.
# Usage: scripts/new-post.sh <slug> "<Title>" "<Category>" [repo-root]
#   <Category> is one of: "For Displaced Families" | "Market Guides" | "For Insurance Professionals"
# Writes apps/web/content/posts/<slug>.md with today's date and the required
# skeleton, then prints the path. Refuses to overwrite an existing post.
set -eu
slug="${1:?slug (kebab-case) required}"
title="${2:?title required}"
category="${3:?category required}"
root="${4:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
case "$slug" in
  *[!a-z0-9-]*|-*|*-|"") echo "slug must be kebab-case: a-z, 0-9, single hyphens" >&2; exit 1 ;;
esac
case "$category" in
  "For Displaced Families"|"Market Guides"|"For Insurance Professionals") ;;
  *) echo "category must be exactly one of: For Displaced Families | Market Guides | For Insurance Professionals" >&2; exit 1 ;;
esac
dir="$root/apps/web/content/posts"
file="$dir/$slug.md"
mkdir -p "$dir"
if [ -e "$file" ]; then echo "refusing to overwrite $file" >&2; exit 1; fi
if grep -rqs "slug: '$slug'" "$root/apps/web/src/content/blog.ts"; then echo "slug already used in src/content/blog.ts" >&2; exit 1; fi
today="$(date -u +%F)"
esc_title="$(printf '%s' "$title" | sed 's/"/\\"/g')"
cat > "$file" <<MD
---
slug: $slug
title: "$esc_title"
category: $category
date: $today
excerpt: "REPLACE: 80-160 characters that answer the title's question; contains the primary keyword."
keywords:
  - REPLACE primary keyword
  - REPLACE secondary keyword
  - REPLACE secondary keyword
motif: checklist
cta: housing
sources:
  - name: "REPLACE source name"
    url: https://www.ready.gov/
    accessed: $today
---

> REPLACE: two to four sentences that answer the title's question outright, with a number, date or named source where the topic has one. Mention Nova Havens Temporary Housing once as the practical next step.

REPLACE: one or two short context paragraphs. If the topic touches disasters, insurance, claims, ALE or coverage, include the fixed disclaimer paragraph as the next block:

Nova Havens Temporary Housing coordinates furnished temporary housing and makes no coverage determinations. Whether your policy includes Additional Living Expense (ALE) coverage, what it provides and for how long are questions for your insurer, and this article does not answer them.

## REPLACE first question a reader would type into a search box?

REPLACE: first sentence answers the question completely; then two to four short paragraphs or one list.

## REPLACE second question?

REPLACE

## REPLACE third question?

REPLACE

## What should you do next?

REPLACE: Nova Havens as the practical next step, with (629) 401-0054 and/or novahavens.com/contact. No superlatives, no property counts.

## Frequently Asked Questions

**REPLACE question one?**
REPLACE one to four sentence answer.

**REPLACE question two?**
REPLACE

**REPLACE question three?**
REPLACE
MD
echo "$file"
