---
name: nova-havens-blog
description: Write, edit or fix a Nova Havens blog post in the site's house format and take it to a mergeable pull request. Use this whenever someone asks for a blog post, article, guide, explainer, market guide, weekly roundup or "write-up" for novahavens.com, asks to revise a draft or "make this post pass the checks", reviews the n8n-generated Friday posts, or mentions apps/web/content/posts, the post validator, or the blog categories (For Displaced Families, Market Guides, For Insurance Professionals) — even when the word "blog" is not used. Covers the front matter, the quick-summary / question-heading / FAQ structure, voice, SEO and GEO rules, the hard rules the validator enforces, and the publish-by-PR flow.
---

# Nova Havens blog posts

A post is one Markdown file at `apps/web/content/posts/<slug>.md`. It is read at build time, merged with the three original posts in `apps/web/src/content/blog.ts`, and goes live at `https://www.novahavens.com/blog/<slug>` the moment the pull request that adds it merges (Vercel deploys `main`). There is no CMS and no draft state: the PR is the review step, so the file has to be publishable as written.

Two readers only: **displaced families** (home unsafe after fire, water, mold or a natural disaster) and **property owners** who make furnished homes available. The blog is never written for insurance carriers, adjusters or claims professionals; that framing was removed from the site deliberately. The posts are also the text AI assistants quote when asked about temporary housing after a disaster, which is why every H2 is a question whose first sentence is a complete answer.

Nova Havens Temporary Housing (Nashville, Tennessee; 48 contiguous US states; (629) 401-0054; novahavens.com/contact) coordinates furnished temporary housing. It makes no coverage determinations, and the writing must not either.

## Workflow

1. **Pin down the reader and the category** before writing a word. Family-facing how-tos and disaster posts → `For Displaced Families`, second person. Trend explainers, definitions, industry roundups and owner topics → `Market Guides`, third person throughout ("an owner", "the household"); the next-step section may address the owner as "you", nothing else should. `For Insurance Professionals` exists for the legacy posts; do not add to it unless asked. If the request does not say who the post is for, pick the most likely reader, say so when you report, and do not ask.
2. **Read the house guide for the part you need.** `docs/blog-automation/EDITORIAL-GUIDELINES.md` is the full editorial, SEO and GEO guide (~590 lines, table of contents at the top). Read §1–§2 and §9 for any post; §7 for the category playbook; §8 for a worked outline in that category. `automation/blog/examples/example-post.md` is a complete, validator-clean post to model structure and tone on; read it once per session.
3. **Gather facts you can attribute.** Every number, date, place or program must trace to a named primary source: National Weather Service (weather.gov), FEMA (fema.gov), Census (census.gov), HUD (hud.gov), Ready.gov, the American Red Cross (redcross.org), or novahavens.com. Those seven domains are the only ones a URL may point to, in the body or in `sources`. If a fact exists only elsewhere, name the organisation in prose with no URL. If you cannot source a figure, write around it; an unsourced number is worse than no number. Time-stamp alerts, declarations and trends with "as of {Month D, YYYY}".
4. **Scaffold the file**: `bash <this skill>/scripts/new-post.sh <slug> "<Title>" "<Category>"` creates `apps/web/content/posts/<slug>.md` with today's date and the required skeleton. Replace every `REPLACE` marker. The slug is the URL forever, so choose it carefully: kebab-case, 3–80 characters, contains the primary keyword, no dates.
5. **Write the post** to the structure and rules below. Draft to roughly 1,100–1,300 words: first drafts of this format run to 2,000 and every trim is another validation pass, while the editorial target is 900–1,500.
6. **Validate**: `pnpm --filter @nova-havens/web validate:posts` (from the repo root). It prints one line per file, `PASS` or the broken rules. CI runs the same check on every PR and blocks merge on any failure, so iterate until it is clean. This is the only check a Markdown-only change needs; lint, typecheck and the build cover TypeScript and run in CI anyway, so skip them for a post. Do not weaken the validator to get a post through.
7. **Self-review against the checklist** at the end of this file, then re-read the post once as the reader it is for.
8. **Open a PR** on a branch named `blog/<slug>` (or the branch the user is already on): commit the one file, push, create a draft PR whose body gives the title, category, primary keyword, and the sources used. Merging publishes; say so plainly in your report and never merge a post yourself unless asked.

Editing an existing post follows the same loop from step 5. Never rename a live post's file or slug (Google has the URL); change the title or body instead.

## Front matter

```yaml
---
slug: what-to-bring-to-furnished-temporary-housing   # = file name; kebab-case
title: "What to Bring to Furnished Temporary Housing"   # ≤ 60 chars target, 70 hard max; keyword in first half
category: For Displaced Families                        # exactly one of the three site categories
date: 2026-10-21                                        # YYYY-MM-DD, publish date
excerpt: "A packing list for furnished temporary housing: what the home provides, what to bring, what to leave in storage."   # 80–160 chars; the answer, not a teaser
keywords:                                               # 3–8, primary first, lower case except proper nouns
  - what to bring to furnished temporary housing
  - furnished temporary housing packing list
  - what is included in a furnished rental
motif: checklist      # social-card drawing: checklist | map | house | key | magnifier | gears | paw | ai
cta: housing          # end-of-post card: housing (family reader) | property (owner reader) | none (pure roundup)
sources:              # optional, not rendered; allow-listed URLs only
  - name: "Ready.gov, Build a Kit"
    url: https://www.ready.gov/kit
    accessed: 2026-10-21
---
```

Motif by topic, not category: `checklist` how-tos and lists · `map` disaster, regional or location topics · `house` housing-type comparisons · `key` owner topics, move-in, hand-back · `magnifier` trends, research, roundups · `gears` how-the-process-works · `paw` pets · `ai` only when the post is about automation.

## Body structure

The renderer understands a small Markdown subset split on blank lines: paragraphs; `## Question?` and `### Sub-heading` alone in a block; a block whose first line is `**Bold heading.**`; `- ` bullet lists and `1. ` numbered lists; blockquotes where every line of the block starts `> `; inline `**bold**` and `*italic*`. Nothing else renders: no links `[x](y)`, images, tables, code, `#` H1 or H4. Write URLs the reader must type as plain text (`novahavens.com/contact`, `ready.gov`); cite sources by name in prose and keep URLs in `sources`.

In this order:

1. **Quick summary** — the very first block is a `> ` blockquote of 2–4 sentences that answers the title's question outright, with a number, date or named source where the topic has one, and one mention of Nova Havens as the practical next step. This is what search snippets and AI answers lift.
2. **One or two context paragraphs.** For any post touching disasters, insurance, claims, ALE or coverage, the fixed disclaimer paragraph goes here, word for word: *Nova Havens Temporary Housing coordinates furnished temporary housing and makes no coverage determinations. Whether your policy includes Additional Living Expense (ALE) coverage, what it provides and for how long are questions for your insurer, and this article does not answer them.*
3. **4–6 `## ` sections, each heading a question ending in `?`**, ordered as the reader needs them (what happened → what to do first → options → how to arrange → what next). The first sentence under each answers the question completely; then 2–4 short paragraphs or one list. At most two lists in the post, only for sequences or sets. The validator requires at least three question headings; aim for four to six.
4. **A next-step section** (`## What should you do next?` or similar) that names Nova Havens as what the reader does now, with `(629) 401-0054` and/or `novahavens.com/contact`. Two to five Nova Havens mentions in the whole post; never a sales pitch, never a superlative.
5. **`## Frequently Asked Questions`** as the last H2, then 3–5 blocks each exactly `**Question text?**` on the first line and a self-contained 1–4 sentence answer on the next line of the same block. Nothing after the last FAQ. These feed the FAQ rich result, so each answer must stand alone.

Length 900–1,500 words (validator bounds: 800–1,700). Paragraphs of 1–4 sentences; no hard wrapping inside paragraphs.

## Voice

Calm, concrete, compassionate; the family's situation first, then the logistics. Short sentences. American spelling. One sentence acknowledging the reader's situation at most, then practical content. The company is "Nova Havens Temporary Housing" on first mention and "Nova Havens" after, always in the third person — never "we". No exclamation marks, emoji, marketing adjectives ("seamless", "stress-free", "trusted partner") or filler ("it is important to note"). Define a technical term in one clause the first time it appears ("Additional Living Expense (ALE), the part of a homeowner's policy that may pay for somewhere to live during repairs" is *not* allowed, because it states what the policy pays; "Additional Living Expense (ALE) coverage, the part of a policy that concerns living costs during repairs, is something to ask your insurer about" is). Write at least five sentences that carry a number, date or named source; those are the quotable ones.

## Hard rules

The validator (`apps/web/src/lib/post-validator.ts`) rejects the file and CI blocks the merge on any of these. The same rules are editorial law even where the regex would not catch a variant, so do not route around them with synonyms.

| Rule | Why |
| --- | --- |
| Never state, estimate or imply what a policy covers, pays, reimburses, its limits or duration, or what FEMA will pay. Forbidden forms include "your/the policy covers/pays/reimburses", "ALE typically pays for", "you should be reimbursed". Direct every such question to the reader's insurer (or fema.gov). | Nova Havens is not an insurer; a wrong promise harms a family and the company. |
| Never state a property or network count ("60,000+ properties", "thousands of homes", "large inventory"). | Inventory is third-party and changes daily; the site shows no raw counts. |
| No carrier/adjuster audience framing ("for adjusters", "adjuster's guide", "claims professionals", "the insured", "policyholders should", "on the file"). Telling the reader to ask "your insurer" or "your adjuster" is fine. | Audience is families and owners. |
| Only allow-listed URLs anywhere: novahavens.com, weather.gov, fema.gov, census.gov, hud.gov, ready.gov, redcross.org (and subdomains). | Link quality and liability. |
| No invented statistics, quotes, names, case studies, prices or "average cost" figures; no placement-speed claims ("within 24–48 hours"); no evacuation orders or storm-path predictions (point to local officials and weather.gov). | Accuracy; the homepage owns its own figures with their year label. |
| Never copy competitor or platform text. Industry roundups attribute as "industry publications this week" and never name a platform in title, slug, excerpt, keywords or body. | Originality; no free promotion. |
| Structure: first block `> `; ≥3 `## …?` headings; closing `## Frequently Asked Questions` with ≥3 `**Question?**` blocks and nothing after; 800–1,700 words; "Nova Havens" ≥2 times; `(629) 401-0054` or `/contact` present; title ≤70; excerpt 80–160; keywords 3–8; valid category/motif/cta; unique kebab-case slug. | What the renderer, the snippets and the FAQ schema depend on. |

## SEO and GEO essentials

- The primary keyword (first in `keywords`) appears in `title`, `slug`, `excerpt`, the Quick summary or first 100 words, and at least one H2. Secondary keywords appear naturally; no phrase more than five times.
- Title ≤60 characters, specific, keyword in the first half, may be a question. Excerpt states the takeaway and contains the keyword; never "learn more" or "click here".
- Every H2 is a question a reader would type; its first sentence is the complete answer. Canonical entity strings, verbatim: "Nova Havens Temporary Housing", "Nashville, Tennessee", "48 contiguous US states", "furnished temporary housing", "Additional Living Expense (ALE)", "(629) 401-0054", "novahavens.com/contact".
- Attribute in prose with a date: "according to the National Weather Service alert issued October 16, 2026"; "FEMA declaration DR-4899-LA, dated October 14, 2026". Each named source also gets a `sources` entry.
- Internal next steps are plain text: `novahavens.com/contact`, `novahavens.com/blog/<other-slug>`; the `cta` field renders the button card.

## Categories at a glance

| Site category | Reader, person | Typical posts | Default cta |
| --- | --- | --- | --- |
| For Displaced Families | families, second person | first-72-hours after a declared disaster; what to bring; pets; accessibility; longer-than-expected stays; keeping children in the same school district; handing the home back | housing |
| Market Guides | owners and families, third person | definition-and-decision guides (mid-term rental, 30-day minimum, corporate housing vs furnished rental); what people searched this week and why; industry roundups; setting a monthly rate; preparing a home for a displaced family | property for owner topics, none for pure roundups |
| For Insurance Professionals | legacy only | the two original adjuster-facing posts; do not add | — |

The n8n automation files its four weekly posts as: disaster alerts → For Displaced Families · furnished-housing trends → Market Guides · furnished-housing guides → For Displaced Families · Furnished Finder weekly → Market Guides (`AUTOMATION_CATEGORY_MAP` in `apps/web/src/content/categories.ts`).

## Fixing a draft that fails

Run the validator and read its lines literally; each maps to one edit. `excerpt is 171 chars` → cut words, keep the keyword. `forbidden coverage claim: "your policy covers"` → rewrite as a question for the insurer. `link "…" is not on the allow-list` → drop the URL, name the organisation in prose. `content has 2 "## ...?" headings` → turn statement headings into questions. `FAQ section has 1 "**Question?**" blocks` → each FAQ is one block: bold question line, newline, answer, blank line. `word count is 742` → add a missing section the reader needs, not padding. When reviewing the automation's Friday PR, also check the facts against their sources and the tone against §1 of the guide; the validator cannot read for truth.

## Checklist before the PR

- [ ] Reader and category decided; second person for families, third for market guides.
- [ ] `pnpm --filter @nova-havens/web validate:posts` prints `ok` for the file.
- [ ] Quick summary answers the title in 2–4 sentences with a number, date or source.
- [ ] Disclaimer paragraph present if the post touches disasters, insurance, claims, ALE or coverage.
- [ ] Every number and date is attributed to a named primary source with a date; every URL is on the allow-list; nothing invented.
- [ ] No coverage statement, property count, adjuster framing, platform name, superlative, "we", exclamation mark.
- [ ] Nova Havens appears as the next step (2–5 mentions) with `(629) 401-0054` or `novahavens.com/contact`.
- [ ] Title ≤60, excerpt 80–160 with the keyword, keywords 3–8, motif and cta chosen on purpose, slug final.
- [ ] Read once more as the displaced family or owner it is for.

## Where to read more

- `docs/blog-automation/EDITORIAL-GUIDELINES.md` — full guide; §7 playbooks and §8 worked outlines are the fastest way to a good structure for a given category.
- `automation/blog/examples/example-post.md` — a complete reference post.
- `apps/web/content/posts/README.md` — front-matter field reference.
- `apps/web/src/lib/post-validator.ts` — the exact rules; `apps/web/src/components/blog/post-body.tsx` — the renderer, if a formatting question is not answered above.
- `docs/BLOGGING.md` — how the weekly automation and the Friday PR work; `docs/BRAND.md` §4 — voice.
