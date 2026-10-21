# Blog automation — master plan

Nova Havens publishes four blog posts a week, written from what people in the
US actually searched for and what actually happened that week, approved by a
human before a word is written, and shipped through the same pull-request path
as every other site change. This document is the single source of truth for
how that system is built and operated.

## 1. Outcome

Every Friday at 09:00 UTC, William receives one email listing four proposed
posts — one per category below — with the week's evidence behind each. He
clicks **Approve**. Within minutes a pull request appears on GitHub containing
four finished posts in the website's own blog format. Merging the PR publishes
them; Vercel deploys automatically.

| # | Category (internal key)        | What it covers                                                                                           | Blog category it is filed under |
| - | ------------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 1 | `disaster_alerts`              | Active US natural-disaster alerts and federal disaster declarations, and what displaced households do next | For Displaced Families          |
| 2 | `furnished_housing_trends`     | The most-searched furnished-housing topics, providers and questions this week                            | Market Guides                   |
| 3 | `furnished_housing_guides`     | Practical how-to guidance on finding, choosing and living in furnished housing                           | For Displaced Families          |
| 4 | `furnished_finder_weekly`      | What Furnished Finder (and the wider furnished-rental industry) published this week, synthesised         | Market Guides                   |

The categories on the right are the three that already exist in
`apps/web/src/content/blog.ts` and drive the filter on `/blog`. No new
category is introduced; the mapping is fixed in `AUTOMATION_CATEGORY_MAP` in
`apps/web/src/content/categories.ts`.

## 2. Principles (non-negotiable)

1. **Zero marginal cost.** Every data source is a free public feed or an
   n8n gateway-credit service already in the account. No paid SEO APIs.
2. **A human approves before anything is written.** Nothing is drafted until
   William approves the four briefs. Nothing is published until a human merges
   the PR. Two gates, both human.
3. **Follow the website's blog schema exactly.** Posts are produced in the
   `BlogPost` shape (`apps/web/src/content/blog.ts`) and rendered by the
   existing `PostBody` component. The automation never changes site code.
4. **Obey the house content rules** (`blog.ts` header comment, `docs/SEO.md`):
   never state what a policy covers, never state a property count, always
   direct coverage questions to the policyholder's insurer, never fabricate
   statistics or quotes.
5. **SEO and GEO are built into the writer, not bolted on** — see §7.
6. **Everything is observable.** Every signal, brief, approval and post is a
   row in the master Google Sheet. Failures email the owner.

## 3. System overview

```
                 ┌──────────────────────────────────────────────────────────┐
  daily 07:00    │  n8n · "Blog · Daily Signal Collector"                    │
  UTC            │  Google Trends RSS ─┐                                     │
                 │  NWS alerts API ────┤                                     │
                 │  FEMA declarations ─┼─▶ normalise ─▶ classify ─▶ score ─▶ │──▶ Google Sheet
                 │  Brave news search ─┤   (Code)      (Code)     (Code)     │     tab: Signals
                 │  Furnished Finder ──┤                                     │
                 │  Search Console ────┘ (optional, when credential exists)  │
                 └──────────────────────────────────────────────────────────┘

                 ┌──────────────────────────────────────────────────────────┐
  Friday 09:00   │  n8n · "Blog · Friday Synthesizer"                        │
  UTC            │  read Signals (7 days) ─▶ group by category               │
                 │  ─▶ LLM: 4 topic briefs ─▶ Sheet tab: Briefs (pending)    │
                 │  ─▶ Gmail send-and-wait ─▶ william@novahavens.com         │
                 │        │ approve                      │ decline / 48h     │
                 │        ▼                              ▼                   │
                 │  LLM writes 4 posts ─▶ validate ─▶ Sheet tab: Posts       │
                 │  ─▶ GitHub: branch + 4 .md files + pull request           │
                 │  ─▶ Gmail: "PR ready" to William                          │
                 └──────────────────────────────────────────────────────────┘

                 ┌──────────────────────────────────────────────────────────┐
  on merge       │  GitHub main ─▶ Vercel build ─▶ apps/web/content/posts/*.md│
                 │  loaded by src/content/source.ts ─▶ /blog, sitemap, OG,  │
                 │  BlogPosting + FAQPage JSON-LD                            │
                 └──────────────────────────────────────────────────────────┘
```

## 4. Data sources (all free)

| Source                              | Endpoint                                                                                      | Cost | Category it feeds            | Notes                                                                                                   |
| ----------------------------------- | --------------------------------------------------------------------------------------------- | ---- | ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| Google Trends — US daily trends     | `https://trends.google.com/trending/rss?geo=US`                                               | free | all (keyword-filtered)       | ~20 items/day. Keyword rules route items to categories; unmatched items are stored with category `other`. |
| NWS active alerts                   | `https://api.weather.gov/alerts/active?status=actual&severity=Extreme,Severe`                 | free | `disaster_alerts`            | Requires a `User-Agent` header. Grouped by event type + state; counts and headline kept.                  |
| FEMA disaster declarations          | `https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$orderby=declarationDate desc&$top=50` | free | `disaster_alerts`     | Filtered to the last 7 days.                                                                              |
| Brave Search — news & web           | n8n Brave Search node, gateway credits                                                        | free | `furnished_housing_trends`, `furnished_housing_guides` | Fixed query list in the Config tab; `freshness: pw`.                                             |
| Furnished Finder blog               | Brave Search `site:furnishedfinder.com/blog`, `freshness: pw`                                 | free | `furnished_finder_weekly`    | Direct fetch returns 403 (Cloudflare), so discovery goes through search. Titles + snippets only.           |
| Google Search Console               | `https://searchconsole.googleapis.com/webmasters/v3/sites/{site}/searchAnalytics/query`       | free | all                          | Top queries for `sc-domain:novahavens.com`, last 7 days. Runs only when the Google OAuth credential exists; otherwise the branch is skipped (`continueOnFail`). |

Only titles, snippets, URLs and public metadata are stored. No article bodies
are copied; posts are written from the signals, not from competitors' text.

## 5. Master Google Sheet

Name: **Nova Havens · Blog Automation** (owner: fazal@novahavens.com, shared
with william@novahavens.com). ID is stored in the n8n workflows' Config node.

| Tab       | Columns                                                                                                                                             | Written by              |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `Config`  | `key`, `value` — search queries per category, keyword rules, recipients, site URL, repo                                                             | humans                  |
| `Signals` | `signal_id`, `collected_at`, `category`, `source`, `title`, `url`, `summary`, `region`, `score`, `raw_json`                                           | daily collector         |
| `Briefs`  | `brief_id`, `week`, `category`, `blog_category`, `proposed_title`, `angle`, `target_keywords`, `outline`, `evidence_ids`, `status`, `decided_at`      | Friday synthesizer      |
| `Posts`   | `post_id`, `week`, `brief_id`, `slug`, `title`, `blog_category`, `excerpt`, `keywords`, `motif`, `cta`, `word_count`, `validation`, `pr_url`, `status` | Friday synthesizer      |
| `Runs`    | `run_at`, `workflow`, `status`, `items`, `notes`                                                                                                     | both                    |

`status` values — Briefs: `pending` → `approved` / `declined` / `expired`.
Posts: `generated` → `pr_opened` → `published` (set by hand or a later sync).

## 6. Workflows

### 6.1 Blog · Daily Signal Collector (07:00 UTC, every day)

1. **Schedule Trigger** 07:00 UTC.
2. **Load Config** — reads the `Config` tab once (queries, keyword rules).
3. Six parallel fetch branches (above). Each ends in a Code node that emits
   normalised items `{category, source, title, url, summary, region, score, raw}`.
   Every branch is `onError: continue` so one dead feed never blocks the run.
4. **Classify & score** (Code): keyword rules from Config assign a category;
   score = source weight × recency × keyword hits. Deduplicated on `url` and
   on normalised title against the last 14 days of Signals.
5. **Append → Signals.**
6. **Log → Runs.** On any node error, the workflow-level error handler emails
   fazal@novahavens.com with the execution link.

### 6.2 Blog · Friday Synthesizer (09:00 UTC, Fridays)

1. **Schedule Trigger** Friday 09:00 UTC.
2. **Read Signals** where `collected_at` ≥ now − 7 days; group by category;
   keep the top 15 by score per category.
3. **Brief writer** (LLM, structured output): for each category, one brief —
   `proposed_title`, `angle`, `target_keywords[]` (3–6), `outline[]` (H2s as
   questions), `evidence_ids[]`, `blog_category` (from the fixed map). Written
   with `prompts/brief-writer.md`.
4. **Append → Briefs** (`status: pending`).
5. **Approval email** — Gmail *Send and Wait* to `william@novahavens.com`,
   subject `Blog approval · week {{ISO week}} · 4 posts`, body lists the four
   briefs with their evidence. Buttons **Approve all** / **Decline**. Timeout
   48 h. Decline or timeout → Briefs set to `declined`/`expired`, email to
   fazal@, stop.
6. **Post writer** (LLM, one call per brief, structured output): produces the
   full `BlogPost` JSON — `slug`, `title`, `category`, `excerpt`, `keywords`,
   `motif`, `cta`, `content` (markdown in the house format). Written with
   `prompts/post-writer.md` and the editorial guidelines.
7. **Validate** (Code): see §8. A post that fails is regenerated once with the
   validation errors appended to the prompt; a second failure is logged and
   the post is skipped (the PR still opens with the others).
8. **Append → Posts** (`status: generated`).
9. **GitHub** (HTTP Request, credential `GitHub account`, classic PAT of the `Novahavens` user):
   `GET /git/ref/heads/main` → `POST /git/refs` (`blog/{{year}}-w{{week}}`) →
   `PUT /contents/apps/web/content/posts/{{slug}}.md` ×4 →
   `POST /pulls` (draft) with the briefs and validation summary as the body.
10. **Update Posts** rows with `pr_url`, `status: pr_opened`.
11. **Email William** the PR link.

### 6.3 Blog · Setup (manual, run once)

Creates the Google Sheet with the five tabs and headers, seeds `Config`, and
prints the spreadsheet ID. Kept in n8n so the sheet can be rebuilt.

## 7. SEO + GEO rules the writer follows

Full detail lives in `docs/blog-automation/EDITORIAL-GUIDELINES.md` and is
compiled into the system prompts. Summary:

**SEO**
- One primary keyword from the brief in the title (≤ 60 chars), slug, first
  100 words and one H2; secondary keywords used naturally, never stuffed.
- `excerpt` ≤ 160 chars, written as the meta description: the answer, not a
  teaser.
- 900–1,500 words; H2s phrased as the questions people search; short
  paragraphs; one list where it genuinely helps.
- Internal links: one to `/contact`, one to the housing or property intake
  form via the `cta` field, and one to a related existing post when relevant.
- Cite primary sources by name (NWS, FEMA, Census, HUD) with the date of the
  data. No invented numbers.

**GEO (generative-engine optimisation — being the source AI assistants cite)**
- Open with a 2–4 sentence direct answer in the `> Quick summary` block; the
  first sentence under every H2 answers that H2's question completely.
- Use the canonical entity names consistently: *Nova Havens Temporary
  Housing*, *Nashville, Tennessee*, *48 contiguous US states*, *furnished
  temporary housing*, *Additional Living Expense (ALE)*.
- Include a *Frequently Asked Questions* section of 3–5 bold questions with
  one-paragraph answers (this is what feeds the `FAQPage` JSON-LD).
- Define terms on first use; prefer concrete, quotable sentences with a
  number, a date or a named source; avoid hedging filler.
- Reference Nova Havens as the practical next step in every post, in the
  reader's interest (what to do, who to call), never as an advert.

**House rules (hard constraints)**
- Never state or imply what any policy covers, limits, or durations; direct
  those questions to the reader's insurer.
- Never state a property count.
- Never copy competitor text; synthesise, attribute ideas generically
  ("industry sources this week"), and link only to primary sources.
- No carrier/adjuster audience framing — write for families and property
  owners (site positioning since Oct 2026).

## 8. Validation gate (runs in n8n before the PR, and in CI after)

A post is accepted only if:

- `slug` is kebab-case, unique against existing posts and the `Posts` tab.
- `title` ≤ 70 chars; `excerpt` 80–160 chars; `keywords` 3–8 items.
- `category` ∈ the three site categories; `motif` ∈ the allowed set;
  `cta` ∈ `housing | property | none`.
- `content` starts with a `> ` quick-summary block; has ≥ 3 `## ` headings
  phrased as questions; ends with `## Frequently Asked Questions` followed by
  ≥ 3 `**Question?**` blocks (the format `parseFaqsFromContent` expects).
- 800 ≤ word count ≤ 1,700.
- Contains "Nova Havens" at least twice and `(629) 401-0054` or `/contact`.
- Does **not** match the forbidden patterns: property counts
  (`\d[\d,]*\+? (properties|homes|listings)`), coverage claims
  (`(your|the) policy (covers|will cover|pays)`), carrier/adjuster audience
  framing, or any `http` link that is not on the allow-list (novahavens.com,
  weather.gov, fema.gov, census.gov, hud.gov, ready.gov, redcross.org).

The same checks run in the repo as `pnpm --filter @nova-havens/web validate:posts`
and in the `verify` GitHub workflow, so a hand-edited post is held to the
same standard.

## 9. Site changes (branch `blog-automation`)

| Change                                                   | File                                                        |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| Markdown posts with YAML front matter                    | `apps/web/content/posts/*.md`                               |
| Loader: parse front matter, merge with `BLOG_POSTS`, sort | `apps/web/src/content/posts-md.ts`, `source.ts`             |
| Category constants + automation map                      | `apps/web/src/content/categories.ts`                        |
| Validation script shared by n8n and CI                   | `apps/web/scripts/validate-posts.ts`                        |
| Post schema JSON for the LLM structured output           | `automation/blog/post.schema.json`                          |
| Prompts                                                  | `automation/blog/prompts/brief-writer.md`, `post-writer.md` |
| n8n workflow exports (for review and disaster recovery)  | `automation/blog/n8n/*.json`                                |
| Runbook                                                  | `docs/BLOGGING.md`                                          |

Existing posts stay in `blog.ts`; nothing about them changes.

## 10. Credentials and access

| Need                        | Status                                                       | Action                                                                                                     |
| --------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Google Sheets               | exists in n8n (`Google Sheets OAuth2 API`)                   | none                                                                                                       |
| Gmail (send + send-and-wait) | exists in n8n (`Gmail account`, fazal@)                     | none                                                                                                       |
| LLM                         | `n8n free OpenAI API credits` (managed) + Anthropic via gateway | none; switch the model node if credits run out                                                          |
| Brave Search                | gateway credits                                              | none                                                                                                       |
| GitHub                      | exists (`GitHub account`, added 2026-10-21)                  | Classic PAT of the `Novahavens` user, expires 2026-11-20; renewal steps in docs/BLOGGING.md §5.4. If it lapses the PR step is skipped and the posts are emailed as `.md` files. |
| Google Search Console       | optional                                                     | Google OAuth2 credential with scope `webmasters.readonly`; the GSC branch activates automatically.        |

## 11. Rollout

1. Merge this branch (site loader + validator + docs). Zero visible change.
2. Run *Blog · Setup* once → paste the sheet ID into both workflows' Config.
3. Activate *Daily Signal Collector*; let it run 2–3 days; eyeball `Signals`.
4. Add the GitHub credential.
5. Activate *Friday Synthesizer*; first Friday is a dry run — William approves,
   PR opens as draft, we review the four posts closely before merging.
6. From week two, the loop runs on its own: approve → merge → request indexing
   in Search Console (docs/SEO.md §6).

## 12. Operating cost and limits

- n8n Cloud: 2 workflows, ~35 executions/month — well inside any plan.
- LLM: four briefs + four posts/week ≈ 40k tokens/week, covered by n8n's free
  OpenAI credits; if those expire, the Anthropic gateway or an API key at
  roughly $1–2/month.
- Google Sheets API: < 100 calls/day.
- Brave Search via gateway: ~12 queries/day.

## 13. Risks and mitigations

| Risk                                      | Mitigation                                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| Thin or repetitive AI content hurts SEO   | Human approval of topics, strict validator, 900+ words, primary-source citations, one post per category per week, not per day. |
| Factual error about a disaster            | Posts quote NWS/FEMA by name and date; the writer is told to say "as of {date}"; William reviews the PR. |
| Insurance-advice liability                | Hard forbidden-pattern checks + standing disclaimer paragraph inserted by the writer prompt. |
| Feed changes shape or dies                | Each source branch is isolated with `continueOnFail`; the run logs which sources returned 0 items. |
| Competitor copying                        | Only titles/snippets stored; writer instructed to synthesise; no competitor links in posts.  |
| GitHub token leaks                        | Fine-grained PAT scoped to one repo, two permissions; rotated yearly; stored only in n8n.     |

## 14. Ownership

- **Product owner:** William (approves topics, merges PRs).
- **System owner:** Fazal (n8n, Google Sheet, credentials).
- **Escalation:** error emails go to fazal@novahavens.com; the Runs tab is
  the audit trail.
