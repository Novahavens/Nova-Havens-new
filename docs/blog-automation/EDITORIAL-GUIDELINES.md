# Editorial guidelines — Nova Havens blog

The definitive guide for writing a Nova Havens post, whether the author is a
person or the Friday Synthesizer's post-writer model. Every rule here is
checkable. The automated validator (`PLAN.md` §8) enforces the subset it can
measure; the human approver enforces the rest.

Companion files:

- `docs/blog-automation/PLAN.md` — the system this guide serves (§7 and §8).
- `automation/blog/prompts/brief-writer.md`, `post-writer.md` — condensed
  versions of this guide, embedded in the LLM prompts.
- `automation/blog/post.schema.json` — the writer's output contract.
- `automation/blog/examples/example-post.md` — a complete post that passes.
- `apps/web/src/content/blog.ts` — the `BlogPost` shape and the three
  existing posts (posts 1 and 3 are the voice reference).
- `apps/web/src/config/site.ts` — the only source of company facts.

---

## 1. Audience and voice

### 1.1 Who we write for

Two readers, and only two:

| Reader | Situation | What they want from us |
| --- | --- | --- |
| **Displaced family** | Their home is uninhabitable after fire, water, mold or a declared disaster. They are tired, stressed and searching on a phone. | What happens next, in order. What to ask for. Who to call. |
| **Property owner** | They own a furnished (or furnishable) home and want to know whether, and how, to make it available for temporary housing. | What the arrangement looks like, what is expected of them, how to get started. |

We do **not** write for insurance carriers, adjusters or claims professionals.
The site dropped that audience in October 2026. A sentence that would only
make sense to an adjuster ("fewer escalations on the file") does not belong
in a new post. Existing posts 1 and 2 in `blog.ts` predate this change; use
them for *tone*, not for audience framing.

### 1.2 Voice

Calm, plain, practical. Someone who has done this hundreds of times telling
you what happens next.

- Second person ("you", "your household") for family-facing posts. Third
  person is fine for market guides.
- Short sentences. One idea per paragraph. Paragraphs of 1–4 sentences.
- American English spelling (readers are in the US). The three existing posts
  contain a few British spellings ("authorisation"); do not copy them.
- No exclamation marks, no emoji, no rhetorical questions in body copy
  (questions belong in H2s and the FAQ).
- No marketing adjectives: not "stress-free", "seamless", "world-class",
  "trusted partner", "we're here for you".
- No hedging filler: not "it's important to note", "in today's world",
  "navigating the complex landscape".
- Name the thing. "Call (629) 401-0054" beats "reach out to our team".
- Acknowledge the reader's situation in one sentence at most, then get to
  the practical content. Post 3's opening ("Being told you can't go home is
  disorienting. The housing question usually arrives before you've had time
  to think.") is the ceiling for emotional framing.

---

## 2. Post anatomy

### 2.1 Fields

A post is a `BlogPost` (`apps/web/src/content/blog.ts`). Markdown posts carry
the same fields in YAML front matter:

| Field | Rule |
| --- | --- |
| `slug` | kebab-case, `^[a-z0-9]+(-[a-z0-9]+)*$`, 3–80 chars, contains the primary keyword, no dates, no stop-word padding. Unique across `blog.ts` and `apps/web/content/posts/`. |
| `title` | ≤ 60 chars target, ≤ 70 hard limit. Primary keyword in the first half. Title case. May be a question. |
| `category` | `For Displaced Families` or `Market Guides` (automation never files under `For Insurance Professionals`). |
| `date` | `YYYY-MM-DD`, the publish date. |
| `excerpt` | 80–160 chars. This *is* the meta description and the social card text. Written as the answer, not a teaser. |
| `keywords` | 3–8 phrases. First is the primary keyword. |
| `motif` | One of `checklist`, `map`, `house`, `key`, `magnifier`, `gears`, `paw`, `ai` — see §7 playbooks for selection. |
| `cta` | `housing`, `property` or `none` — see §4.6. |
| `author` | Optional `{ name, role }`. Omit unless a named team member genuinely wrote or reviewed it. |
| `sources` | List of `{ name, url, accessed }`. Allow-listed domains only (§6.5). May be empty for evergreen guides. Kept in front matter for the audit trail; the site loader (`posts-md.ts`) does not render it. |
| `content` | The body, in the house markdown subset (§3). |

### 2.2 Skeleton

```
> Two to four sentences that answer the title's question directly. Include
> one number, date or named source if the topic has one. This is the Quick
> summary callout and the text AI assistants are most likely to quote.

One or two short paragraphs of context: who this is for and what it covers.
For disaster or insurance-adjacent topics, the standard disclaimer paragraph
(§6.1) goes here, before the first H2.

## First question a reader would type into a search box?

First sentence answers the question completely. Then elaborate: 2–4 short
paragraphs, or one list if the content is genuinely a sequence or a set.

## Second question?

...

## Third, fourth (and optionally fifth, sixth) question?

...

## What should you do next?

(Optional but recommended for family-facing posts.) Concrete next step.
Reference Nova Havens as the practical option, with the phone number or
novahavens.com/contact. One paragraph. Not an advert.

## Frequently Asked Questions

**A question a reader would actually ask?**
One-paragraph answer, 1–4 sentences, self-contained (it is rendered on its
own in FAQPage JSON-LD).

**Second question?**
Answer.

**Third question?**
Answer.
```

Hard structural requirements (validator-enforced):

- Block 1 is a `> ` blockquote (every line of the block starts with `> `).
- At least 3 `## ` headings, each ending in `?`, before the FAQ heading.
- The last `## ` heading is exactly `## Frequently Asked Questions`.
- After it, 3–5 blocks whose first line is `**Question?**` (starts with `**`,
  ends with `**`, contains `?`) followed on the next line(s) by the answer.
  Nothing else after the FAQ section.
- 900–1,500 words target (800–1,700 accepted). Words are counted on the body
  only, whitespace-split.

---

## 3. The markdown subset that renders

`apps/web/src/components/blog/post-body.tsx` is the only renderer. It splits
the body on blank lines and recognises exactly these block types:

| Block | Syntax | Notes |
| --- | --- | --- |
| Paragraph | plain text | Single newlines inside a block are kept as text, so do not hard-wrap. |
| H2 | `## Text` alone in its block | |
| H3 | `### Text` alone in its block | Use sparingly; H2s carry the structure. |
| Bold heading block | `**Heading.**` as the first line, body text on following lines of the same block | Renders as an H3 with a paragraph. Post 1 uses this for its seven fields. |
| Bullet list | lines starting `- `; optional intro lines before the first bullet | |
| Numbered list | lines starting `1. `, `2. `…; optional intro lines | |
| Blockquote | every line starts `> ` | Block 1 is the Quick summary; later blockquotes render as a callout. |
| Inline | `**bold**`, `*italic*` | No nesting. |

**Not supported, do not use:** links `[text](url)`, raw `<html>`, images,
tables, horizontal rules, code blocks, `#` H1, H4+, footnotes, HTML entities.
A link written in markdown syntax renders as literal brackets. Write URLs as
plain text only when the reader needs to type them (`novahavens.com/contact`,
`ready.gov`); otherwise cite sources by name in the body and put the URL in
the `sources` field.

---

## 4. SEO checklist

Every item is pass/fail.

### 4.1 Keywords

- [ ] One **primary keyword** (2–5 words, the phrase a reader would type)
      chosen from the brief's `target_keywords`.
- [ ] Primary keyword appears in: `title`, `slug`, `excerpt`, the Quick
      summary or first 100 words of body, and at least one H2.
- [ ] 2–7 **secondary keywords** used where they read naturally. No phrase
      repeated more than 5 times in the body. No keyword lists in prose.
- [ ] `keywords` field lists the primary first, then secondaries, 3–8 total,
      all lower case except proper nouns.

### 4.2 Title

- [ ] ≤ 60 characters (hard limit 70). Count them.
- [ ] Primary keyword in the first half.
- [ ] Specific: a reader can tell what the post answers. "What to Do After a
      Hurricane Displaces Your Family" passes; "Hurricane Season Tips" fails.
- [ ] Not a duplicate or near-duplicate of any existing title.

### 4.3 Slug

- [ ] Kebab-case, 3–8 words, contains the primary keyword, no dates, no
      "the/a/and" unless the keyword contains them.
- [ ] Unique.

### 4.4 Excerpt (meta description)

- [ ] 80–160 characters.
- [ ] States the answer or the key takeaway. A reader who sees only the
      excerpt in search results learns something.
- [ ] Contains the primary keyword.
- [ ] No "Learn more", "Read on", "In this post".

### 4.5 Structure and length

- [ ] 900–1,500 words.
- [ ] 4–6 H2s before the FAQ, each phrased as a question a person searches.
- [ ] First sentence under every H2 answers that H2's question.
- [ ] At most one or two lists; used only where the content is a sequence or
      a set, not to break up prose.
- [ ] Paragraphs ≤ 4 sentences.

### 4.6 Internal next steps (the `cta` field and plain-text references)

The renderer does not support links. Internal "links" are:

- The closing CTA card, selected with the `cta` field:
  - `housing` → "Submit a housing request" (family-facing posts).
  - `property` → "Submit your property" (owner-facing posts).
  - `none` → no card (industry roundups, or posts where the phone is the
    action).
- The phone number `(629) 401-0054` and/or `novahavens.com/contact` written
  as plain text in the body (validator requires at least one).
- A related existing post referenced by its title in prose when genuinely
  relevant ("see Hotel or Furnished Home? What to Expect From Each"). No
  URL.

- [ ] `cta` matches the audience.
- [ ] Phone or `/contact` appears at least once.
- [ ] "Nova Havens" appears at least twice (validator), at most six times
      (editorial).

### 4.7 Sources

- [ ] Every number, date or declaration in the body is attributed in prose
      to a named primary source with its date: "according to the National
      Weather Service alert issued October 16, 2026", "FEMA's declaration
      DR-XXXX, dated …".
- [ ] Each cited source has an entry in `sources` with `name`, `url`
      (allow-listed domain) and `accessed` (ISO date).
- [ ] No number appears that is not in the signals or the named source.
      When a figure is not available, write around it ("several coastal
      counties") rather than invent it.

---

## 5. GEO checklist (generative-engine optimisation)

The goal: when an AI assistant answers "what do I do after a house fire
displaces my family", it quotes this post and names Nova Havens Temporary
Housing. That requires quotable, attributable, consistent sentences.

- [ ] **Direct answer first.** The Quick summary block answers the title's
      question in 2–4 sentences with no preamble. A reader could stop there.
- [ ] **Every H2 is answered in its first sentence**, fully, before any
      elaboration. Test: read only the first sentence under each H2; the post
      should still make sense.
- [ ] **Entity consistency.** Use these exact strings, from
      `src/config/site.ts`, whenever the fact appears:
      - `Nova Havens Temporary Housing` (first mention; `Nova Havens` after)
      - `Nashville, Tennessee`
      - `48 contiguous US states`
      - `furnished temporary housing`
      - `Additional Living Expense (ALE)` on first use, `ALE` after
      - `(629) 401-0054`
      - `novahavens.com/contact`
- [ ] **Quotable sentences.** At least five sentences in the post contain a
      number, a date or a named source and could be lifted verbatim as a
      citation. "FEMA approved a major disaster declaration for six Louisiana
      parishes on October 14, 2026" is quotable; "FEMA has been active in
      the region" is not.
- [ ] **Define terms on first use.** ALE, FEMA Individual Assistance,
      transitional sheltering, mid-term rental, 30-day minimum, travel-nurse
      housing, etc. One clause is enough: "Additional Living Expense (ALE) —
      the part of a homeowners policy that may help with living costs while
      a home is uninhabitable".
- [ ] **Time-stamp time-sensitive facts.** Alerts, declarations, counts and
      trends carry "as of {Month D, YYYY}" the first time they appear. Never
      "currently", "right now", "this week" without the date.
- [ ] **FAQ block of 3–5 questions**, each a real search query, each answer
      self-contained in one paragraph. These become FAQPage JSON-LD.
- [ ] **Nova Havens as the next step, not the subject.** Reference the
      company once in the body as what the reader can do next ("Nova Havens
      Temporary Housing coordinates furnished temporary housing in the 48
      contiguous US states; call (629) 401-0054 and a coordinator will take
      the household's details") and optionally once in the FAQ. Never a
      paragraph about how good the service is. Never superlatives. Never
      "we" — the company is referred to in the third person, as the
      existing posts do.
- [ ] **No hedging filler.** Delete "it is worth noting", "generally
      speaking", "many experts agree".

---

## 6. Hard rules

Breaking any of these fails the post regardless of quality.

### 6.1 Never state what a policy covers

Never state, estimate or imply what any policy covers, what limits apply,
how long coverage lasts, what will be reimbursed, or whether an insurer's
decision was right. This includes "most policies cover…", "ALE typically
pays for…", "you should be reimbursed for…". The forbidden-pattern check
catches `(your|the) policy (covers|will cover|pays|reimburses)`
(case-insensitive, in title, excerpt and body); the human check catches the
rest.

What you *may* say: that ALE coverage exists as a concept, that the reader
should ask their insurer whether their policy includes it, and that Nova
Havens coordinates housing once the household knows where it stands.

**Standard disclaimer paragraph** — required in every disaster_alerts post
and every post that mentions insurance, ALE, claims or coverage; placed
before the first H2; wording fixed:

> Nova Havens Temporary Housing coordinates furnished temporary housing and
> makes no coverage determinations. Whether your policy includes Additional
> Living Expense (ALE) coverage, what it provides and for how long are
> questions for your insurer, and this article does not answer them.

(Written as a normal paragraph, not a blockquote, in the post body.)

### 6.2 Never state a property count

No "60,000+ properties", no "thousands of homes", no "a large network of
listings". The site's own count lives in `site.ts` and is published on
other pages; the blog never repeats it. Pattern:
`\d[\d,]*\+? (properties|homes|listings)` plus the words "thousands of",
"hundreds of" before `properties|homes|listings|rentals`.

### 6.3 Never copy competitor text

Signals carry titles and snippets only. Synthesise ideas; never reproduce a
sentence. Attribute generically: "industry publications this week",
"several furnished-rental platforms noted". Never name a competitor
platform as a recommendation and never link to one.

### 6.4 No carrier/adjuster audience framing

The reader is the family or the owner. The validator catches
`(for|dear) (adjusters|carriers)` (case-insensitive). The human check also
rejects: `adjuster's guide`, `adjusters can`, `carriers can`, `claims
professionals`, `on the file`, `the insured` (as a noun for the reader),
`policyholders should` (address them as "you"). You may still tell the
reader to ask "your insurer" or "your adjuster" a question.

### 6.5 Only allow-listed domains

Any `http` or `https` URL in the body or in `sources` must be on:

`novahavens.com`, `weather.gov`, `fema.gov`, `census.gov`, `hud.gov`,
`ready.gov`, `redcross.org`

(subdomains included, e.g. `api.weather.gov`, `www.fema.gov`). Nothing else:
no news sites, no competitor blogs, no state agencies, no Wikipedia. If a
fact only exists on a non-allow-listed site, cite it in prose without a URL
("according to the Louisiana Governor's Office of Homeland Security and
Emergency Preparedness") and do not add a `sources` entry. The validator
(`apps/web/src/lib/post-validator.ts`, `ALLOWED_LINK_DOMAINS`), the n8n
validator and PLAN.md §8 all use this same list.

### 6.6 Other absolute rules

- No fabricated statistics, quotes, names, case studies or testimonials.
- No legal or medical advice beyond "contact your insurer / local
  authorities / a licensed professional".
- No prices, rates or "average cost" figures unless they come from a named
  allow-listed source with a date.
- No "within 24–48 hours", "< 5 days" or other placement-speed claims in
  the blog (those figures live on the homepage with their own year label).
- No first-person plural. The company is "Nova Havens", not "we".

---

## 7. Category playbooks

Automation categories map to blog categories in
`apps/web/src/content/categories.ts` (`AUTOMATION_CATEGORY_MAP`). One post
per category per week.

### 7.1 `disaster_alerts` → "For Displaced Families"

**Signals:** NWS active alerts (Extreme/Severe), FEMA declarations in the
last 7 days, Google Trends items matching disaster keywords.

**Angle:** one event or event cluster (a named storm, a wildfire complex, a
regional flood) and what a displaced household does in the first 72 hours
and the first two weeks. If multiple events compete, pick the one with the
largest displaced population or the freshest FEMA declaration.

**Must include:** the event named as NWS/FEMA name it; the declaration
number if one exists; "as of {date}"; the standard disclaimer (§6.1); a
numbered first-72-hours list; a section on documenting the damage; a section
on temporary housing options that explains the difference between emergency
shelter (Red Cross), transitional sheltering (FEMA, where activated) and
furnished temporary housing; a next-step reference to Nova Havens.

**Must not:** predict the storm's path, give evacuation orders (point to
local officials and weather.gov), state what FEMA will pay, state what
insurance will pay.

**Motif:** `map`. **CTA:** `housing`.

**Title patterns:** "Displaced by {Event}? What to Do in the First 72
Hours", "{Event} Housing Help: Shelter, FEMA and Furnished Homes Explained".

### 7.2 `furnished_housing_trends` → "Market Guides"

**Signals:** Google Trends, Brave news/web search on the Config query list,
Search Console top queries.

**Angle:** the one furnished-housing question people searched most this
week, answered for a family or owner. Trends posts are still practical:
"why is everyone searching X, and what does it mean for you".

**Must include:** the search behaviour described with its source and date
("Google Trends, week of October 13, 2026"); a definition of any industry
term; a clear implication for the reader; at least one named primary
source where a number is used (Census, HUD). Owner-facing trends (demand
for 30-day rentals, insurance-placement demand) take `cta: property`.

**Must not:** forecast prices; name platforms as recommendations; quote
competitor copy; invent percentages.

**Motif:** `magnifier` (research/trends) or `house` (comparisons).
**CTA:** `housing` or `property` by audience; `none` if neither fits.

### 7.3 `furnished_housing_guides` → "For Displaced Families"

**Signals:** Brave search on how-to queries, Search Console, Trends.

**Angle:** one practical task, done completely: choosing between a hotel and
a furnished home, what to bring, moving with pets, requesting accessibility
features, understanding a 30-day minimum, what "fully furnished" includes,
handing the home back at the end.

**Must include:** a checklist or numbered sequence; the specific details a
reader must give to get a good match (location, bedrooms/bathrooms,
occupants, pets with breed and weight, accessibility, move-in date,
duration); the next-step reference. If the guide touches insurance, the
disclaimer.

**Motif:** `checklist` (default), `paw` (pets), `key` (move-in/hand-back,
owner topics), `gears` (how the process works).
**CTA:** `housing`.

### 7.4 `furnished_finder_weekly` → "Market Guides"

**Signals:** Brave search `site:furnishedfinder.com/blog` (titles and
snippets only) plus wider industry publishing this week.

**Angle:** synthesise what the furnished-rental industry published this
week into one theme useful to an owner or a family. The post is about the
theme, not about the publications.

**Must include:** attribution as "industry publications this week" or
"furnished-rental platforms wrote this week about…" with the week stated;
a definition of each industry term; what the theme means for a Nova Havens
reader; no URLs to any platform (sources list may be empty or contain only
allow-listed references).

**Must not:** name Furnished Finder or any platform in the title, slug,
excerpt or keywords; link to any platform; reproduce a snippet; frame the
post as a review of a competitor.

**Motif:** `magnifier` (default), `key` for owner-focused themes.
**CTA:** `property` when the theme is owner-facing, `housing` when it is
family-facing, `none` for pure roundups.

---

## 8. Worked example outlines

### 8.1 disaster_alerts

Title: "Displaced by the October Gulf Hurricane? Your First 72 Hours"
(59 chars). Slug: `gulf-hurricane-displaced-first-72-hours`. Primary
keyword: "hurricane temporary housing". Motif `map`, CTA `housing`.

1. Quick summary: who is affected (as of date, NWS/FEMA named), the three
   housing tiers, call the insurer first, call Nova Havens for furnished
   temporary housing.
2. Context + disclaimer.
3. `## What has been declared, and where, as of October 16, 2026?`
4. `## What should you do in the first 72 hours?` (numbered list, 6–8 steps)
5. `## How do you document the damage before cleanup starts?`
6. `## What are your temporary housing options after a hurricane?`
   (shelter / transitional / furnished temporary housing, defined)
7. `## How does furnished temporary housing get arranged?` (what to have
   ready, Nova Havens as next step)
8. FAQ ×4: Does FEMA help pay for housing? (point to fema.gov, no amounts);
   Can we bring pets?; How long will we be out?; Who do we call first?

See `automation/blog/examples/example-post.md` for the full post.

### 8.2 furnished_housing_trends

Title: "Why 'Monthly Furnished Rentals' Searches Are Rising This Fall"
(58 chars). Slug: `monthly-furnished-rentals-search-trend`. Primary
keyword: "monthly furnished rentals". Motif `magnifier`, CTA `property`.

1. Quick summary: the trend, its source and week, the two reasons, what an
   owner can do.
2. `## What are people searching for, and since when?`
3. `## What is a monthly furnished rental?` (define 30-day minimum,
   mid-term rental)
4. `## Who is driving the demand?` (displaced households, travelling
   professionals, relocations — attribute to sources, no invented splits)
5. `## What does this mean if you own a furnished home?`
6. `## What does it mean if you need one?`
7. FAQ ×3–4.

### 8.3 furnished_housing_guides

Title: "Moving Into Furnished Temporary Housing With Pets: A Checklist"
(62 chars → trim to "Furnished Temporary Housing With Pets: A Checklist",
50). Slug: `furnished-temporary-housing-with-pets`. Primary keyword:
"pet-friendly temporary housing". Motif `paw`, CTA `housing`.

1. Quick summary: pets are workable; the four details that decide it
   (number, type, breed, weight); share them at the start.
2. `## Can you bring pets to furnished temporary housing?`
3. `## What details decide which homes will accept your pet?`
4. `## What should you pack for the animal?` (list)
5. `## How do you settle a pet into a new home quickly?`
6. `## What should you do next?`
7. FAQ ×3–4.

### 8.4 furnished_finder_weekly

Title: "What Furnished Rental Owners Were Told This Week: Pricing by the
Month" (69 chars → "Monthly Pricing for Furnished Rentals: This Week's
Industry Advice", 63). Slug: `monthly-pricing-furnished-rentals-industry`.
Primary keyword: "furnished rental monthly pricing". Motif `key`, CTA
`property`.

1. Quick summary: industry publications this week (week stated) focused
   on monthly pricing; three ideas; what they mean for an owner.
2. `## What did the furnished-rental industry publish this week?`
   (generic attribution, synthesised, no names)
3. `## What is monthly pricing, and how does it differ from nightly?`
4. `## What costs should an owner build into a monthly rate?`
5. `## How do insurance-placed households change the picture?` (without
   stating what insurance pays)
6. `## What should you do if you own a furnished home?`
7. FAQ ×3.

---

## 9. Pre-publish checklist (mirrors PLAN.md §8 exactly)

A post is accepted only if every line is true. The n8n validator and
`pnpm --filter @nova-havens/web validate:posts` check the same list.

- [ ] `slug` is kebab-case and unique against existing posts and the
      `Posts` tab.
- [ ] `title` ≤ 70 chars.
- [ ] `excerpt` 80–160 chars.
- [ ] `keywords` has 3–8 items.
- [ ] `category` is one of the three site categories.
- [ ] `motif` is one of `ai | checklist | house | paw | key | magnifier |
      map | gears`.
- [ ] `cta` is one of `housing | property | none`.
- [ ] `content` starts with a `> ` quick-summary block.
- [ ] `content` has ≥ 3 `## ` headings phrased as questions (ending `?`).
- [ ] `content` ends with `## Frequently Asked Questions` followed by ≥ 3
      `**Question?**` blocks in the format `parseFaqsFromContent` expects
      (first line `**…?**`, answer on the following line(s) of the same
      block).
- [ ] 800 ≤ word count ≤ 1,700.
- [ ] Contains "Nova Havens" at least twice.
- [ ] Contains `(629) 401-0054` or `/contact`.
- [ ] Does not match a property count: `\d[\d,]*\+? (properties|homes|listings)`.
- [ ] Does not match a coverage claim: `(your|the) policy (covers|will cover|pays|reimburses)`.
- [ ] Does not match carrier/adjuster audience framing: `(for|dear) (adjusters|carriers)`.
- [ ] Every `http` link in title, excerpt, body or `sources` is on the
      allow-list: novahavens.com, weather.gov, fema.gov, census.gov, hud.gov,
      ready.gov, redcross.org.

The three pattern checks run against title, excerpt and body together, case-insensitively.

Editorial additions (human-checked, not in the validator):

- [ ] Standard disclaimer present when the post touches disasters or
      insurance (§6.1).
- [ ] First sentence under every H2 answers it.
- [ ] Every number/date is attributed to a named source with its date.
- [ ] No competitor named or linked; roundup attribution is generic.
- [ ] Entity strings match §5 exactly.
- [ ] Nothing in the markdown falls outside the §3 subset.
