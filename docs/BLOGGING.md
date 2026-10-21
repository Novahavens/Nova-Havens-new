# Blogging: the weekly automation and how to run it

Four blog posts a week are drafted by an n8n automation, approved by William
before anything is written, reviewed as a GitHub pull request, and published
by merging. This document is the runbook. Sections 1–4 are for William
(no technical background assumed); sections 5–8 are for Fazal, who owns the
n8n side. The design behind it is in
[docs/blog-automation/PLAN.md](blog-automation/PLAN.md).

## 1. What happens every week

| When                 | What happens                                                                                                                                                                                                                              | Who does it     |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Every day, 07:00 UTC | n8n collects the day's signals: Google Trends, National Weather Service alerts, FEMA disaster declarations, news and web search results on furnished housing, and what Furnished Finder published. Each item becomes a row in the Google Sheet. | automatic       |
| Friday, 09:00 UTC    | n8n reads the last seven days of signals and proposes four posts, one per category. It emails William the four proposals with the evidence behind each.                                                                                 | automatic       |
| Friday               | William reads the email and clicks **Approve all** or **Decline**.                                                                                                                                                                        | William         |
| Within minutes       | On approval, n8n writes the four posts, checks them against the house rules, and opens a draft pull request on GitHub with four `.md` files. William receives a second email with the PR link.                                            | automatic       |
| Friday or Monday     | William reads the four posts in the PR, edits anything that needs it, and merges. Vercel deploys within about three minutes and the posts are live on `/blog`.                                                                              | William         |
| After merging        | William requests indexing for the four new URLs in Google Search Console so Google picks them up in hours rather than days.                                                                                                              | William         |

The four categories, every week:

| #   | Post                                                                              | Filed under on `/blog`  |
| --- | --------------------------------------------------------------------------------- | ----------------------- |
| 1   | Active US disaster alerts and declarations, and what displaced households do next | For Displaced Families  |
| 2   | The most-searched furnished-housing topics and questions this week                | Market Guides           |
| 3   | A practical how-to on finding, choosing or living in furnished housing            | For Displaced Families  |
| 4   | What Furnished Finder and the wider furnished-rental industry published this week | Market Guides           |

**What the Friday email looks like.** Subject
`Blog approval · week <number> · 4 posts`. The body lists the four proposed
titles. Under each one: the angle, the three to six keywords it targets, the
planned headings, and the signals it is based on (headlines, sources, dates).
At the bottom are two buttons, **Approve all** and **Decline**.

**What the buttons do.**

- **Approve all** — n8n writes all four posts and opens the pull request.
  There is no partial approval; if one of the four is wrong, approve, then
  delete that file from the PR (section 3) or decline and let next week's run
  propose again.
- **Decline** — nothing is written. The proposals are marked `declined` in
  the Sheet, Fazal gets a note, and the next proposals arrive the following
  Friday.
- **No click within 48 hours** — same as Decline. The proposals expire.

**The pull request.** It is opened as a *draft* on
`Novahavens/Nova-Havens-new`, on a branch named `blog/<year>-w<week>`. It
contains exactly four new files under `apps/web/content/posts/`. The PR
description repeats the four briefs and the result of the automatic checks.
Nothing on the live site changes until the PR is merged.

**Merging.** Merging the PR into `main` publishes the posts: Vercel builds
the site, the posts appear on `/blog`, in the sitemap, with their social
images and FAQ schema. The same path every other site change takes.

**Indexing.** Google finds new posts on its own within a few days. Requesting
indexing in Search Console (step 5 of the checklist) shortens that to hours.

## 2. Your Friday checklist (William)

Under ten minutes.

1. **Read the email** (`Blog approval · week …`). Check that the four titles
   are things Nova Havens should be saying this week and that the evidence
   under each looks real and current.
2. **Click Approve all** (or Decline). Wait for the second email, *PR ready*,
   which arrives within a few minutes and contains the PR link.
3. **Review the PR on GitHub.** Open the link, click **Files changed**, and
   read each of the four posts. Look for:
   - **Facts.** Every number, date and place name must come from a named
     source (NWS, FEMA, Census, HUD). If a figure has no source, delete it.
   - **Tone.** Written for families and property owners, calm and practical,
     not an advert. Nova Havens is mentioned as the next step, not sold.
   - **The FAQ section.** Each post ends with `## Frequently Asked Questions`
     and three to five bold questions with one-paragraph answers. This is what
     Google uses for the FAQ rich result; do not remove it.
   - **No coverage advice.** The post must never say what a policy covers,
     pays or how long it lasts. Coverage questions go to the reader's insurer.
     If a sentence does this, delete it; the validator will also block it.
   - The automatic check at the bottom of the PR (**CI / verify**) is green.
4. **Merge.** Click **Ready for review** (it is a draft), then **Merge pull
   request** → **Confirm merge**. Vercel deploys in about three minutes;
   check `https://www.novahavens.com/blog`.
5. **Request indexing.** In Google Search Console paste each new post URL into
   the top search bar, click **Request indexing**. Four URLs fits in one day's
   quota. Share the posts on LinkedIn if you like; social links bring the
   first crawl. (Details: [docs/SEO.md §4.2](SEO.md#42-speed-up-one-url-url-inspection--request-indexing).)

## 3. If you want to change a post before publishing

Edit it in the pull request. Nothing is live until you merge.

1. In the PR, **Files changed** → find the post → click the pencil icon
   (**Edit file**) at the top right of the file.
2. Make the change, then **Commit changes…** → keep *Commit directly to the
   `blog/…` branch* → **Commit changes**.
3. The checks run again automatically. When they are green, merge.

To drop one post from the week, open the file, click the **…** menu →
**Delete file**, and commit to the same branch.

### The fields at the top of each file (front matter)

Each post starts with a block between two `---` lines. Change text freely;
keep the field names.

| Field      | What it is                                                                                           | Rules                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `title`    | The headline, shown on `/blog`, in the browser tab and in Google results                             | 70 characters or fewer; contains the main keyword                                               |
| `category` | Where it is filed on `/blog`                                                                         | Exactly one of `For Displaced Families`, `Market Guides`, `For Insurance Professionals`         |
| `date`     | Publication date                                                                                     | `YYYY-MM-DD`; used for sorting and the sitemap                                                  |
| `excerpt`  | The one-paragraph summary under the title on `/blog`; also the description Google shows             | 80–160 characters; an answer, not a teaser                                                      |
| `keywords` | Search phrases the post targets                                                                      | 3–8 items, one per line, each starting with `- `                                                |
| `motif`    | The drawing on the generated social-share image                                                      | One of `checklist`, `house`, `key`, `paw`, `ai`, `magnifier`, `map`, `gears`                    |
| `cta`      | The button card at the end of the post                                                               | `housing` (Submit a housing request), `property` (Submit your property), or `none`              |
| `author`   | Optional byline                                                                                      | `name` and `role` on two indented lines; omit the field for no byline                           |

The file name is the post's web address (`what-to-do-after-a-house-fire.md`
becomes `/blog/what-to-do-after-a-house-fire`). Do not rename a file after
the post is live; the URL is what Google has indexed.

### The text formatting the site understands

The body below the front matter is plain text with a small set of markers.
Leave one empty line between blocks.

| You write                                                   | The site shows                                                                      |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| A paragraph of text                                         | A paragraph                                                                         |
| `> ` at the start of the very first block                   | The *Quick summary* box at the top. Required; two to four sentences.                |
| `## Why does this matter?`                                  | A section heading. Phrase every one as a question; the first sentence answers it.   |
| `### Smaller heading`                                       | A sub-heading                                                                       |
| `**Question or label?**` on its own line                    | A bold heading. In the FAQ section, each question is written this way.              |
| `- item` lines                                              | A bulleted list                                                                     |
| `1. item` lines                                             | A numbered list                                                                     |
| `> ` lines anywhere after the first block                   | A highlighted quote                                                                 |
| `**bold**` and `*italic*` inside a sentence                 | Bold and italic text                                                                |

Not supported: web links, images, tables, code blocks and `#` top-level
headings. Links are not rendered, so write addresses as plain text
(`novahavens.com/contact`, `(629) 401-0054`); the writer already does this.
Every post must end with a `## Frequently Asked Questions` heading followed
by at least three `**Question?**` blocks.

## 4. Writing a post by hand (no automation)

The automation is optional. A post written by hand goes through the same
file, the same checks and the same PR.

1. Copy `automation/blog/examples/example-post.md` to
   `apps/web/content/posts/<slug>.md`, where `<slug>` is lowercase words
   joined by hyphens, unique among existing posts.
2. Fill in the front matter and the body following section 3 and
   [docs/blog-automation/EDITORIAL-GUIDELINES.md](blog-automation/EDITORIAL-GUIDELINES.md).
3. Run the checks locally:
   ```bash
   pnpm --filter @nova-havens/web validate:posts
   ```
   It prints one line per post, `ok` or the list of problems. Fix until clean.
4. Open a pull request and merge it as in section 2. The same validator runs
   in CI, so a post that fails cannot be merged by accident.

The three original posts stay in `apps/web/src/content/blog.ts`; nothing
about them changes. New posts go in `apps/web/content/posts/`.

## 5. Operating the system (Fazal)

### 5.1 The master Google Sheet

**Nova Havens · Blog Automation** —
<https://docs.google.com/spreadsheets/d/1vpVWf9-Nv_ZElTa_v1T5HGx4NH5POhg8lClYB6SDCw4/edit>. Owner
fazal@novahavens.com, shared with william@novahavens.com. Its ID is stored in
the Config node of both workflows. Every signal, brief, approval and post is a
row here; it is the audit trail.

| Tab       | What is in it                                                                                                                                       | Written by         |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `Config`  | `key`, `value` — search queries per category, keyword rules, recipients, site URL, repo                                                             | humans             |
| `Signals` | `signal_id`, `collected_at`, `category`, `source`, `title`, `url`, `summary`, `region`, `score`, `raw_json`                                           | daily collector    |
| `Briefs`  | `brief_id`, `week`, `category`, `blog_category`, `proposed_title`, `angle`, `target_keywords`, `outline`, `evidence_ids`, `status`, `decided_at`      | Friday synthesizer |
| `Posts`   | `post_id`, `week`, `brief_id`, `slug`, `title`, `blog_category`, `excerpt`, `keywords`, `motif`, `cta`, `word_count`, `validation`, `pr_url`, `status` | Friday synthesizer |
| `Runs`    | `run_at`, `workflow`, `status`, `items`, `notes`                                                                                                     | both               |

Status values. Briefs: `pending` → `approved` / `declined` / `expired`.
Posts: `generated` → `pr_opened` → `published` (set by hand or a later sync).

### 5.2 The n8n workflows

| Workflow                          | Schedule             | Link                                                          | What it does                                                                                                                                                                                                                                    |
| --------------------------------- | -------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Blog · Daily Signal Collector** | 07:00 UTC, every day | <https://novahavensai.app.n8n.cloud/workflow/NGZCzdK4xZ8ISYhu> | Reads `Config`, fetches six sources in parallel (each branch isolated with `onError: continue`), classifies and scores, upserts into `Signals` keyed by `signal_id` (a story seen on several days keeps one row), logs to `Runs`.                 |
| **Blog · Friday Synthesizer**     | 09:00 UTC, Fridays   | <https://novahavensai.app.n8n.cloud/workflow/HPSDXEavJe2zOFNp> | Reads 7 days of `Signals`, writes four briefs to `Briefs`, sends the Gmail *send-and-wait* approval (48 h timeout), writes and validates four posts (one rewrite on failure), appends to `Posts`, opens the GitHub PR, emails the link.           |
| **Blog · Setup (run once)**       | manual               | <https://novahavensai.app.n8n.cloud/workflow/C1vJ8PFpjud8Ke43> | With an empty `existingSpreadsheetId`: creates the Sheet with the five tabs, headers and `Config`. With an ID: refreshes `Config` by key and leaves the data tabs alone. Keep it so the Sheet can be rebuilt.                                     |
| **Blog · Error alert**            | on failure           | <https://novahavensai.app.n8n.cloud/workflow/IXnMBhGgS4nkS4gy> | Error workflow for the two scheduled ones: emails fazal@novahavens.com the execution link, last node and error message.                                                                                                                          |

Exports of all four live in `automation/blog/n8n/*.json` for review and
disaster recovery (re-export after any change in n8n: *Workflow menu →
Download*). The prompts the LLM nodes use are
`automation/blog/prompts/brief-writer.md` and `post-writer.md`, embedded
verbatim in the *Build brief prompts* and *Build post prompts* Code nodes;
the structured-output schema is `automation/blog/post.schema.json`. When a
prompt file changes, paste the new text into the matching Code node (it is
the `PROMPT` string at the top).

Workflow errors email fazal@novahavens.com with a link to the execution.

### 5.3 Changing what gets collected

Everything tunable is a row in the `Config` tab (`key`, `value`, `notes`);
no workflow edit is needed. Lists are pipe-separated inside one cell.

- **Search queries.** `queries.furnished_housing_trends`,
  `queries.furnished_housing_guides`, `queries.furnished_finder_weekly` —
  e.g. `furnished housing | furnished apartments for rent | …`. Each query is
  one Brave Search call per day (past-week results); keep the total around a
  dozen. The next 07:00 run picks changes up.
- **Keyword rules.** `keywords.disaster_alerts`,
  `keywords.furnished_housing_trends`, `keywords.furnished_housing_guides`
  route Google Trends and Search Console items to a category. An item that
  matches none of them is stored with category `other` and never proposed.
- **Recipients, site, repo.** `recipients.approver`, `recipients.ops`,
  `site.url`, `github.repo`, `github.base`, `posts.path`, `gsc.site`.
- **Limits.** `limits.signals_per_category` (top-N signals handed to the
  brief writer, default 15) and `limits.approval_hours` (shown in the email;
  the wait itself is fixed at 48 h on the Gmail node).

The seed values are in the *Config rows* node of *Blog · Setup*; running
Setup with the existing spreadsheet ID restores them without touching the
other tabs.

After changing rows, run *Daily Signal Collector* manually once and check the
new `Signals` rows before leaving it to the schedule.

### 5.4 Credentials

| Need                         | Status                                                          | Action                                                                                                             |
| ---------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Google Sheets                | exists in n8n (`Google Sheets OAuth2 API`)                      | none                                                                                                               |
| Gmail (send + send-and-wait) | exists in n8n (`Gmail account`, fazal@)                         | none                                                                                                               |
| LLM                          | `n8n free OpenAI API credits` (managed) + Anthropic via gateway | none; switch the model node if credits run out                                                                     |
| Brave Search                 | gateway credits                                                 | none                                                                                                               |
| GitHub                       | exists in n8n (`GitHub account`, classic PAT, user Novahavens)  | **Expires 2026-11-20.** Renew before then (below). If it lapses the PR step is skipped and the posts arrive by email instead.          |
| Google Search Console        | optional                                                        | Google OAuth2 credential with scope `webmasters.readonly`; the GSC branch of the collector activates on its own. |

**The GitHub token** is a classic personal access token created on
2026-10-21 by the `Novahavens` GitHub account and stored in n8n as the
credential `GitHub account`. The four *GitHub:* nodes in *Friday Synthesizer*
reference that credential by ID, so the name does not matter. It was issued
with a 30-day expiry and **expires 2026-11-20**; after that the PR step fails
and William receives the posts by email instead.

**Renewing (or replacing) the token** — about two minutes, signed in to
GitHub as `Novahavens`:

1. Open <https://github.com/settings/tokens/new?description=n8n%20blog%20bot&scopes=repo>
   (classic token, `repo` scope pre-selected). Set **Expiration** to a custom
   date one year out and put that date in the calendar. **Generate token**,
   copy it once.
   Stricter alternative: a fine-grained token at
   <https://github.com/settings/personal-access-tokens/new> → Resource owner
   `Novahavens` → *Only select repositories* → `Nova-Havens-new` →
   **Contents: Read and write**, **Pull requests: Read and write**.
2. n8n → <https://novahavensai.app.n8n.cloud/home/credentials> → open
   **GitHub account** → replace **Access Token** with the new value → Save.
   Nothing in the workflow changes.
3. Optional check: GitHub → Settings → Developer settings → Personal access
   tokens → delete the old token.

The token currently carries every classic scope; only `repo` is needed. When
renewing, tick `repo` alone.

**Optional: Google Search Console** (adds the site's own top queries to the
daily signals):

1. Google Cloud console → the project behind the existing Google OAuth client
   → **APIs & Services → Library** → enable **Google Search Console API**.
2. n8n → **Credentials** → **Add credential** → **Google OAuth2 API** (generic),
   scope `https://www.googleapis.com/auth/webmasters.readonly`, sign in with
   an account that has at least *Restricted* access to the
   `sc-domain:novahavens.com` property.
3. Select the credential on the *Search Console* node in *Daily Signal
   Collector*. No other change; the node already has `continueOnFail` and ran
   as a no-op until now.

### 5.5 Rollout order (first time)

Done on 2026-10-20: the Sheet exists and is seeded, the Sheet ID is in both
workflows' Config node, the collector has been run by hand (108 signals) and
both scheduled workflows are published.

1. Merge the `blog-automation` branch. No visible site change.
2. Eyeball `Signals` after two or three daily runs.
3. GitHub credential added and tested on 2026-10-21 (5.4); renew it before
   2026-11-20.
4. Treat the first Friday as a dry run: William approves, the draft PR
   opens, review all four posts closely before merging.
5. From week two the loop runs on its own.

## 6. Troubleshooting

| Symptom                                               | Likely cause                                                        | What to do                                                                                                                                                                                                                                                     |
| ----------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No Friday email                                       | Workflow inactive, the run failed before the email, or no signals   | n8n → *Friday Synthesizer* → **Executions**: is there a run at 09:00 UTC? None → activate the workflow. Failed → the error email has the link; open the failed node. Check the `Runs` tab and that `Signals` has rows from this week. Check spam for the email. |
| Email arrived but Approve did nothing                 | More than 48 hours passed; the wait timed out                       | The briefs are `expired` in the Sheet. Either wait for next Friday, or in n8n open the expired execution's data and run *Friday Synthesizer* manually (**Test workflow**); a fresh approval email is sent.                                                     |
| Approved, but no PR                                   | GitHub credential missing or expired                                | William and Fazal receive *posts written, GitHub step failed* with each post as a complete `.md` file; the `Posts` tab logs them as `generated`. Create the files by hand (section 4), and renew the token in the `GitHub account` credential (5.4) for next week. |
| PR opened, but CI check **verify** is red             | A post fails `validate:posts`                                       | Open the failed check → **Details** → the *Validate posts* step. The report lists each file and the rule it broke (`excerpt too long (171 > 160)`, `forbidden pattern: coverage claim`, `missing FAQ section`…). Edit the file in the PR (section 3) until green. |
| A source returned 0 items                             | Feed moved, rate-limited, or blocked (Furnished Finder returns 403 direct) | `Runs` tab → the day's row → `notes` names the source. One empty source does not stop the run. If it stays empty for three days, open the branch in the collector and test the node; update the URL or query in `Config`.                                    |
| LLM node fails with a credit or quota error           | n8n free OpenAI credits exhausted                                   | On the *Brief writer* and *Post writer* nodes switch the model/credential to Anthropic via the n8n gateway, or add an OpenAI/Anthropic API key credential. Cost is roughly $1–2 a month. Re-run the failed execution.                                           |
| Post looks wrong on the live site                     | Formatting outside the supported subset (section 3)                 | Fix the file on `main` through a normal PR. The URL must not change.                                                                                                                                                                                           |
| Post published that should not have been             | —                                                                   | Revert the merge commit on GitHub (**Revert** button on the merged PR) and merge the revert; Vercel redeploys. The URL will 404; if it had been indexed, add a redirect in `next.config.ts` to `/blog`.                                                         |

## 7. Costs and limits

- **n8n Cloud:** 2 scheduled workflows, about 35 executions a month, well
  inside any plan.
- **LLM:** four briefs plus four posts a week, about 40k tokens a week,
  covered by n8n's free OpenAI credits. If those expire, the Anthropic
  gateway or an API key at roughly $1–2 a month.
- **Google Sheets API:** under 100 calls a day.
- **Brave Search via gateway:** about 12 queries a day.
- **Search Console:** around 10–12 indexing requests per property per day;
  four posts a week uses a fraction of it.

## 8. Rules the writer follows

The full editorial and SEO/GEO guidance compiled into the writer's prompts is
[docs/blog-automation/EDITORIAL-GUIDELINES.md](blog-automation/EDITORIAL-GUIDELINES.md).
The hard rules, enforced by the validator in n8n and in CI, apply equally to
hand-written posts:

- Never state or imply what any policy covers, its limits or its duration.
  Direct coverage questions to the reader's insurer.
- Never state a property count.
- Never copy competitor text. Synthesise, attribute generically ("industry
  sources this week"), and link only allow-listed domains: novahavens.com,
  weather.gov, fema.gov, census.gov, hud.gov, ready.gov, redcross.org.
- No invented numbers or quotes. Every figure carries its source and date.
- Written for families and property owners, not carriers or adjusters.
- Structure: `> ` quick summary first, at least three `## ` question
  headings, a closing `## Frequently Asked Questions` with at least three
  `**Question?**` blocks, 800–1,700 words, Nova Havens named at least twice,
  and `(629) 401-0054` or `/contact` present.
