# Markdown blog posts

Every `*.md` file in this folder is a published blog post: it is read at build time, merged with the posts in `src/content/blog.ts`, and goes live at `/blog/<slug>` as soon as the pull request that adds it is merged (Vercel deploys automatically). The n8n automation opens those pull requests; a person can add a file the same way.

Each file starts with YAML front matter followed by the post body in the house Markdown format (opening `> ` quick summary, `## Question?` headings, closing `## Frequently Asked Questions` section of `**Question?**` blocks):

```yaml
---
slug: optional-kebab-case-slug # defaults to the file name
title: Title, 70 characters or fewer
category: For Displaced Families # or "For Insurance Professionals" / "Market Guides"
date: 2026-10-16 # YYYY-MM-DD
excerpt: Meta description, 80 to 160 characters.
keywords: [three, to, eight, keywords]
motif: checklist # optional: ai, checklist, house, paw, key, magnifier, map, gears
cta: housing # housing (default), property or none
author: { name: Nova Havens Team, role: Housing Coordination } # optional
image: /blog/custom-social-card.png # optional
sources: [https://www.fema.gov/...] # optional, not rendered
---
```

Run `pnpm --filter @nova-havens/web validate:posts` before opening a PR; CI runs the same check and fails on any rule in `docs/blog-automation/PLAN.md` §8.
