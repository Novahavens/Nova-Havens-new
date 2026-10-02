# Content management: today, and how to add a CMS later

## 1. How content works today

There is no database and no CMS. Content is typed data in the repository,
edited through pull requests:

| Content                                                   | File                                                                                  | Rendered by                                           |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Blog posts                                                | `apps/web/src/content/blog.ts`                                                        | `/blog`, `/blog/[slug]`, OG images, sitemap, llms.txt |
| FAQ                                                       | `apps/web/src/content/faqs.ts`                                                        | Home + About FAQ sections, FAQ schema                 |
| How-it-works steps                                        | `apps/web/src/content/how-it-works.ts`                                                | Home tabs, HowTo schema                               |
| Team (fallback roster)                                    | `apps/web/src/content/team.ts`                                                        | `/meet-the-team`, Person schema                       |
| Team (live roster)                                        | `apps/web/data/team.json` ← Google Form via `scripts/sync-team.mjs`                   | same                                                  |
| Property count                                            | `apps/web/data/property-stats.json` ← Monday.com via `scripts/sync-property-stats.ts` | Home, Contact                                         |
| Company facts, contact details, socials, form URLs, stats | `apps/web/src/config/site.ts`                                                         | everywhere                                            |
| llms.txt text                                             | `apps/web/src/content/llms.ts`                                                        | `/llms.txt`, `/llms-txt`                              |
| Legal pages                                               | `apps/web/src/app/privacy-policy/page.tsx`, `terms-of-service/page.tsx`               | those pages                                           |

Pages never import `blog.ts` directly. They call the **content access layer**,
`apps/web/src/content/source.ts`:

```ts
getAllPosts(): Promise<BlogPost[]>
getPostBySlug(slug): Promise<BlogPost | undefined>
getAllPostSlugs(): Promise<string[]>
```

That indirection is the whole CMS strategy: when a CMS arrives, these three
functions are rewritten to fetch from it and **no page changes**.

This model is deliberate for the current team size: edits are reviewed in a
PR, the site stays 100% static (fastest, cheapest, nothing to secure), and
Jotform / Monday.com / Google Forms already hold the operational data.

## 2. When to add a CMS

Add one when a non-developer needs to publish or edit content **without a
pull request**, or when posts start arriving weekly. Until then, the file
workflow is faster and safer.

## 3. Choosing a CMS for this stack

| Option                                                 | Fits because                                                                                                                                                        | Trade-offs                                                                                                          | Verdict                                                |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **Sanity** (hosted, headless)                          | Best-in-class Next.js integration (`next-sanity`), visual editing in the live site, generous free tier, no infrastructure, webhooks for instant rebuilds.           | Content lives in Sanity's cloud; GROQ query language to learn.                                                      | **Recommended default** — lowest operational load.     |
| **Payload CMS 3** (self-hosted inside the Next.js app) | Installs into `apps/web`, admin UI at `/admin`, TypeScript schemas, data stored in **Postgres — the Supabase project you already run**. Keeps all data first-party. | Turns the static site into one with a server runtime + DB connection; you own backups, auth hardening and upgrades. | Choose if data residency in Supabase is a requirement. |
| **Keystatic / Tina** (Git-based)                       | Edits commit Markdown to the repo; keeps the current "content in git" model with a UI.                                                                              | Smaller ecosystems; media handling is weaker.                                                                       | Fine for a blog-only need.                             |
| Contentful / Storyblok / Strapi                        | Mature, but pricing or self-hosting overhead is higher than the above for a 10-page site.                                                                           |                                                                                                                     | Not recommended here.                                  |

Whatever you choose, the integration surface is the same three functions in
`source.ts`, plus a revalidation webhook.

## 4. Content model to create in the CMS

Model these document types. Field names mirror the TypeScript types so the
mapping in `source.ts` is one-to-one.

**Post** (`BlogPost` in `content/blog.ts`)

| Field      | Type                                                                               | Notes                                                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`    | string                                                                             |                                                                                                                                                                 |
| `slug`     | slug                                                                               | URL — never change after publishing (see docs/SEO.md)                                                                                                           |
| `category` | select: _For Insurance Professionals_ / _For Displaced Families_ / _Market Guides_ | drives the filter                                                                                                                                               |
| `excerpt`  | text (≤ 160 chars)                                                                 | used as meta description                                                                                                                                        |
| `dateISO`  | date                                                                               | `lastmod` in sitemap                                                                                                                                            |
| `keywords` | string[]                                                                           |                                                                                                                                                                 |
| `motif`    | select (checklist, house, key, paw, ai, magnifier, map, gears)                     | OG image artwork                                                                                                                                                |
| `author`   | reference → Team member (optional)                                                 |                                                                                                                                                                 |
| `cta`      | select: housing / property / none                                                  |                                                                                                                                                                 |
| `content`  | Portable Text / rich text                                                          | keep the conventions: opening summary callout, H2s phrased as questions, a _Frequently Asked Questions_ section of bold questions at the end (feeds FAQ schema) |
| `image`    | image (optional)                                                                   | overrides the generated OG card                                                                                                                                 |

**Team member** (`TeamMember`) — `name`, `role`, `initials`, `photo`, and
the five profile answers (`help`, `favouritePart`, `foods`, `laugh`,
`spareTime`). If the CMS becomes the roster source, retire the Google Form
sync (`scripts/sync-team.mjs`) and delete `data/team.json`.

**FAQ group** — `heading`, `items[] { question, answer }`.

**Site settings** (singleton) — only if marketing should edit them: phones,
emails, social URLs, intake form URLs, public stats. Otherwise leave them in
`config/site.ts`, which is the safer home for facts that appear in structured
data.

Do **not** move legal pages into the CMS until they have passed legal
review; a draft banner is intentionally hard-coded on them.

## 5. Step-by-step: Sanity (recommended)

1. **Create the project.** https://www.sanity.io/manage → new project →
   dataset `production`. Note the project ID.
2. **Install in the web app.**
   ```bash
   pnpm --filter @nova-havens/web add next-sanity @sanity/image-url sanity @sanity/vision
   ```
3. **Add the Studio** at `apps/web/src/app/studio/[[...tool]]/page.tsx`
   (the `next-sanity` README has the 15-line boilerplate) and `sanity.config.ts`
   with the schemas from section 4. The Studio is served at
   `/studio` on the same domain; add `disallow: '/studio'` in `app/robots.ts`.
4. **Env vars** (Vercel + `.env.local`): `NEXT_PUBLIC_SANITY_PROJECT_ID`,
   `NEXT_PUBLIC_SANITY_DATASET=production`, `SANITY_API_READ_TOKEN` (viewer
   token, only needed for draft previews).
5. **Rewrite `source.ts`:**
   ```ts
   import { client } from '@/lib/sanity';
   export async function getAllPosts() {
     return client.fetch(
       `*[_type == "post"] | order(dateISO desc){ ..., "slug": slug.current }`,
       {},
       { next: { tags: ['posts'] } },
     );
   }
   export async function getPostBySlug(slug: string) {
     return client.fetch(
       `*[_type == "post" && slug.current == $slug][0]{ ... }`,
       { slug },
       { next: { tags: ['posts', `post:${slug}`] } },
     );
   }
   export async function getAllPostSlugs() {
     return client.fetch<string[]>(`*[_type == "post"].slug.current`);
   }
   ```
   Convert Portable Text to the existing block renderer, or replace
   `components/blog/post-body.tsx` with `@portabletext/react`.
6. **Instant publishing.** Add `apps/web/src/app/api/revalidate/route.ts`:
   ```ts
   import { revalidateTag } from 'next/cache';
   import { parseBody } from 'next-sanity/webhook';
   export async function POST(req: Request) {
     const { isValidSignature, body } = await parseBody<{ _type: string; slug?: { current: string } }>(
       req,
       process.env.SANITY_REVALIDATE_SECRET,
     );
     if (!isValidSignature) return new Response('Invalid signature', { status: 401 });
     revalidateTag('posts');
     if (body?.slug?.current) revalidateTag(`post:${body.slug.current}`);
     return Response.json({ revalidated: true });
   }
   ```
   In Sanity → API → Webhooks, point a webhook at
   `https://novahavens.com/api/revalidate` with the same secret. Published
   edits appear within seconds, with no redeploy.
7. **Keep `dynamicParams = false` and `generateStaticParams`** in
   `blog/[slug]/page.tsx` so unknown slugs still 404 and all posts are
   pre-rendered; new posts trigger a rebuild via the webhook or appear on the
   next deploy. If you prefer new posts to appear without any rebuild, set
   `dynamicParams = true` — the first visit renders and caches the page.
8. **Draft preview (optional):** enable Next.js Draft Mode with
   `next-sanity`'s `defineEnableDraftMode` so editors see unpublished posts
   on the live site layout.
9. **Migrate existing posts** once: a 20-line script that imports the three
   posts from `content/blog.ts` via `client.create()`. Then delete the
   `BLOG_POSTS` array (keep the `BlogPost` type).

## 6. Step-by-step: Payload CMS 3 on Supabase (alternative)

1. In the Supabase project create a database for content (or reuse the
   existing one). Copy the **connection pooling** URL (port 6543) — Vercel's
   serverless functions need the pooler.
2. `pnpm --filter @nova-havens/web add payload @payloadcms/next @payloadcms/db-postgres @payloadcms/richtext-lexical`
   and follow `npx create-payload-app` output for the `app/(payload)` route
   group; set `DATABASE_URI` and `PAYLOAD_SECRET` in Vercel.
3. Define collections `posts`, `team-members`, `faq-groups` with the fields
   in section 4. Payload generates TypeScript types; map them in `source.ts`
   using the Local API (`payload.find({ collection: 'posts' })`) — no HTTP.
4. Add an `afterChange` hook that calls `revalidateTag('posts')`.
5. Media: use `@payloadcms/storage-vercel-blob` or Supabase Storage for
   uploads; add the host to `images.remotePatterns` in `next.config.ts`
   (`TEAM_PHOTO_HOST` already does this for team photos).
6. Lock down `/admin` (Payload auth; optionally Vercel Deployment Protection
   or an allow-list) and exclude it in `robots.ts`.

## 7. Checklist before switching the content source

- [ ] Every existing slug exists in the CMS with identical text and date.
- [ ] `pnpm build` succeeds with the CMS as the source (no network → build
      should fail loudly, not silently publish an empty blog).
- [ ] `/sitemap.xml` and `/llms.txt` list the same posts as before.
- [ ] Rich Results Test still shows `BlogPosting` + `FAQPage` on a post.
- [ ] Revalidation webhook tested from the CMS.
- [ ] `docs/COMPANY.md` and this file updated to point at the CMS.
