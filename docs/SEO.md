# SEO operations: Search Console, sitemap, indexing, and launching without losing traffic

This guide is written for whoever runs novahavens.com day to day. It assumes
no SEO background. Sections 1–4 are setup; section 5 is the launch playbook
for switching production to this new codebase; section 6 is the ongoing
routine.

## 1. What the site already does for you

These are built in and need no configuration:

| Signal                                                                                                                                           | Where it comes from                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Unique `<title>` and meta description on every page                                                                                              | `pageMetadata()` in `apps/web/src/lib/seo.ts`, called from each `page.tsx` |
| Canonical URL on every page (`https://novahavens.com/...`, no trailing slash, no `www`)                                                          | same; base comes from `NEXT_PUBLIC_SITE_URL`                               |
| Open Graph + Twitter cards, per-post generated social images                                                                                     | `pageMetadata()`, `app/blog/[slug]/opengraph-image.tsx`                    |
| Structured data (JSON-LD): `LocalBusiness`, `WebSite`, `FAQPage`, `HowTo`, `BlogPosting`, `BreadcrumbList`, `Person`, `AboutPage`, `ContactPage` | `src/lib/seo.ts`                                                           |
| `/sitemap.xml` with `lastmod` for every URL                                                                                                      | `app/sitemap.ts`                                                           |
| `/robots.txt` allowing all crawlers incl. AI crawlers, pointing at the sitemap                                                                   | `app/robots.ts`                                                            |
| `/llms.txt` machine-readable company index for AI assistants                                                                                     | `app/llms.txt/route.ts`                                                    |
| Fully server-rendered HTML (no JavaScript needed to read any content)                                                                            | React Server Components                                                    |
| Fast Core Web Vitals: self-hosted font, optimised images, minimal client JS                                                                      | `next/font`, `next/image`, server components                               |
| 301 redirects for the old build's `/index.html` URLs; `www` → apex redirect                                                                      | `next.config.ts`; Vercel domain settings                                   |
| `noindex` on preview deployments                                                                                                                 | Added automatically by Vercel                                              |

## 2. Google Search Console (GSC)

GSC is Google's free console for seeing how the site is crawled, indexed and
ranked. Everything else in this document depends on having it.

### 2.1 Create the property

1. Go to https://search.google.com/search-console and sign in with the Google
   account that should own the data (use a shared company account, e.g.
   `info@novahavens.com`, not a personal one).
2. Click **Add property**. You will see two options:
   - **Domain** (`novahavens.com`) — covers http/https, www/non-www, and all
     subdomains in one property. **Use this one.** Verification is a DNS TXT
     record.
   - **URL prefix** (`https://novahavens.com/`) — only that exact prefix.
     Use only if you cannot edit DNS. Verification is an HTML meta tag.
3. **Domain verification:** GSC shows a TXT record like
   `google-site-verification=abc123…`. Add it at your DNS provider (same place
   you added the Vercel records; if DNS is on Vercel, Project → Settings →
   Domains → DNS Records → Add TXT, name `@`). Wait 5–30 minutes, click
   **Verify**. The record must stay in DNS permanently.
4. **URL-prefix verification (fallback):** choose _HTML tag_, copy only the
   `content="…"` value, set it as `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in
   Vercel (Production), redeploy, click **Verify**. The tag is rendered by
   `app/layout.tsx`.

### 2.2 Grant access

Settings → **Users and permissions → Add user**. Give _Full_ to whoever
manages the site, _Restricted_ to agencies or analysts.

### 2.3 Bing Webmaster Tools (10 minutes, worth it)

https://www.bing.com/webmasters → **Import from Google Search Console**. This
also feeds DuckDuckGo and Yahoo. Optionally set
`NEXT_PUBLIC_BING_SITE_VERIFICATION` for tag verification.

## 3. The sitemap

### 3.1 How it works

`apps/web/src/app/sitemap.ts` generates `https://novahavens.com/sitemap.xml`
at build time from the list of static routes plus every blog post in
`src/content/blog.ts`. Each entry has a `lastmod` date. Adding a post or a
page updates the sitemap on the next deploy — there is nothing to upload.

When you add a **new page**, add one line to the `staticRoutes` array in
`sitemap.ts`. Blog posts need nothing.

Verify it any time:

```bash
curl -s https://novahavens.com/sitemap.xml | head -30
curl -s https://novahavens.com/robots.txt
```

### 3.2 Submit it to Google (once)

GSC → **Sitemaps** (left menu) → enter `sitemap.xml` → **Submit**. Status
should read _Success_ within a day and show the number of discovered URLs
(currently 11). You never need to resubmit: Google re-reads the sitemap on its
own schedule, and `robots.txt` also advertises it. (The old "ping" endpoint
was retired in 2023 — ignore any guide that tells you to call it.)

Submit the same URL in Bing Webmaster Tools → Sitemaps.

### 3.3 `lastmod` honesty

Google trusts `lastmod` only if it is accurate. The dates in `sitemap.ts` and
`blog.ts` should change when content actually changes, not on every deploy.
When you materially edit a page, update its date.

## 4. Getting URLs indexed

### 4.1 Normal case: do nothing

Once the sitemap is submitted, Google discovers and indexes new URLs by
itself, typically within a few days for a site this size. Internal links
(nav, footer, blog list) are the strongest signal — every page on this site is
linked from somewhere, which is exactly what you want.

### 4.2 Speed up one URL: URL Inspection → Request Indexing

For a new blog post or a page you just fixed:

1. GSC → paste the full URL in the top search bar (**URL Inspection**).
2. Click **Test live URL**. Confirm _URL is available to Google_, that the
   canonical shown is the same URL, and that the rendered HTML includes the
   content (click _View tested page_).
3. Click **Request indexing**. Google usually crawls within hours to a couple
   of days.

Limits: around 10–12 requests per property per day. Use it for genuinely new
or changed pages only. Requesting the same URL repeatedly does not help.

### 4.3 What _not_ to do

- **Google Indexing API** — it is only for `JobPosting` and
  `BroadcastEvent` pages. Using it for a normal site violates Google's
  guidelines and does not help ranking.
- Paid "indexing services" — unnecessary for a site with a clean sitemap.
- Submitting URLs that redirect or are `noindex` (preview URLs) — they will
  show as errors and waste quota.

### 4.4 Bing (optional): IndexNow

Bing (and Yandex) accept instant notifications via IndexNow. If you want it,
Vercel has a one-click integration, or you can POST
`https://api.indexnow.org/indexnow` with the changed URLs. Not needed for
Google.

## 5. Launching the new site without losing traffic

The single most important fact: **the domain and every public URL stay the
same.** Rankings are attached to URLs, so if each URL keeps returning a
200 with equivalent content, Google treats this as a redesign, not a move.
No "Change of Address" in GSC is needed or wanted.

### 5.1 URL parity (already handled in code)

| Old URL (Vite build)                                                         | New URL                        | Status                                                                                                        |
| ---------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `/`                                                                          | `/`                            | same                                                                                                          |
| `/about-us`, `/meet-the-team`, `/contact`, `/blog`, `/blog/<slug>` (3 posts) | same                           | same                                                                                                          |
| `/privacy-policy`, `/terms-of-service`, `/llms-txt`                          | same                           | same                                                                                                          |
| `/robots.txt`, `/sitemap.xml`, `/llms.txt`                                   | same                           | same                                                                                                          |
| `/<page>/index.html` (how the old prerender was stored)                      | `/<page>`                      | 301 via `next.config.ts`                                                                                      |
| `/<page>/` (trailing slash)                                                  | `/<page>`                      | 308 (Next.js default)                                                                                         |
| `www.novahavens.com/*`                                                       | `novahavens.com/*`             | 308 (Vercel domain setting)                                                                                   |
| `/og-blog-<slug>.png` (old static social images)                             | `/blog/<slug>/opengraph-image` | old files no longer exist; social platforms re-fetch the new `og:image` from the page, so nothing to redirect |

If you ever **rename** a URL, add a `permanent: true` redirect in
`next.config.ts` from the old path to the new one, and keep it for at least a
year. Never let an old URL return 404.

### 5.2 Pre-launch checklist (do on the Vercel preview URL)

1. **Export the old URL inventory.** GSC → _Pages_ → _Export_, plus the old
   `sitemap.xml`. Every URL in that list must return 200 (or 301 to a 200) on
   the preview. Quick check:
   ```bash
   for p in / /about-us /meet-the-team /contact /blog /privacy-policy /terms-of-service /llms-txt \
            /blog/details-that-speed-up-housing-placement /blog/hotel-or-furnished-home-adjusters-guide \
            /blog/hotel-or-furnished-home-what-to-expect /robots.txt /sitemap.xml /llms.txt; do
     printf "%s " "$p"; curl -s -o /dev/null -w "%{http_code}\n" "https://<preview>.vercel.app$p"
   done
   ```
2. **Compare titles and descriptions** with the live site for the top pages
   (view source, or use the _Meta SEO inspector_ browser extension). They
   were carried over verbatim; confirm nothing truncated.
3. **Validate structured data.** Paste each page URL into
   https://search.google.com/test/rich-results and
   https://validator.schema.org. Expect `FAQPage`, `HowTo`, `LocalBusiness`
   on the home page; `BlogPosting` + `FAQPage` on posts. No errors.
4. **Canonicals point to production**, not the preview:
   `curl -s https://<preview>.vercel.app/about-us | grep canonical` should
   show `https://novahavens.com/about-us`. (That is why
   `NEXT_PUBLIC_SITE_URL` is set on Preview too.)
5. **Lighthouse** (Chrome DevTools → Lighthouse, mobile): aim for ≥ 90
   Performance, 100 SEO, ≥ 95 Accessibility on `/` and a blog post.
6. **Confirm the smoke tests passed** on the PR (CI status check).
7. **Lower DNS TTL** to 300 s at least 24 hours before switching.

### 5.3 Launch day

1. Merge to `main`; wait for the production deployment to finish.
2. In Vercel add the domains (section 1 of docs/DEPLOYMENT.md). Switch the
   DNS `A`/`CNAME` records. Within the TTL window traffic moves over.
3. Verify production: run the URL loop above against
   `https://novahavens.com`, open the site on a phone, check
   `/robots.txt` and `/sitemap.xml`.
4. GSC → Sitemaps → the existing `sitemap.xml` entry → click it →
   it will re-process automatically; you may resubmit once to be explicit.
5. URL Inspection → _Request indexing_ for `/`, `/about-us`, `/contact`,
   `/blog` and each blog post (fits in one day's quota).
6. Raise DNS TTL back to 3600 s after 48 hours.

### 5.4 The first four weeks

- **GSC → Pages (Indexing):** the count of indexed pages should stay at ~11
  and _Not indexed_ should not grow. Click any new reason to see the URL.
- **GSC → Performance:** compare clicks and impressions week over week with
  the same weeks before launch. A dip of a few percent for 1–2 weeks is
  normal while Google recrawls; a sustained drop on a specific URL means
  check that URL first (status code, canonical, content).
- **GSC → Experience → Core Web Vitals:** should improve; the new build is
  lighter than the old one.
- **Vercel → Logs**, filter status 404: any old URL you missed shows up here.
  Add a redirect for it.
- **GSC → Settings → Crawl stats:** confirm Googlebot is hitting the site and
  response codes are 2xx/3xx.

### 5.5 If the domain itself ever changes

Not planned, but for completeness: keep the old domain live for ≥ 1 year
with 301 redirects to the matching new URLs, verify both domains in GSC, then
use GSC → Settings → **Change of address** on the old property. Only then does
Google carry signals across.

## 6. Ongoing routine

| Cadence                         | Task                                                                                                                                                                         |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Weekly (5 min)                  | Glance at GSC Performance and Pages. Look at the daily data-sync workflow run (figures stale?).                                                                              |
| When publishing a post          | Add to `content/blog.ts` (and `content/llms.ts`), merge, then _Request indexing_ for the new URL. Share it on LinkedIn/Instagram/Facebook — social links drive first crawls. |
| Monthly                         | Run Lighthouse on `/` and one post; check GSC → Enhancements (FAQ, breadcrumbs) for new errors; review the top queries and refresh the matching page copy if it is thin.     |
| Quarterly                       | Review `PUBLIC_STATS` in `site.ts` (families assisted, days to place) and the `lastmod` dates; update the year-end figures.                                                  |
| Before any content/brand change | Keep URLs; keep H1 meaning; keep the FAQ Q&A structure (the FAQ schema is generated from it).                                                                                |

## 7. Glossary

- **Canonical URL** — the one URL a page should be credited to; prevents
  duplicate-content splits between `www`/non-`www` or trailing-slash variants.
- **Crawl / Index / Rank** — Google fetches the page (crawl), stores it
  (index), then decides where it appears (rank). GSC reports on all three.
- **Structured data / JSON-LD** — machine-readable facts in the page
  (`<script type="application/ld+json">`) that unlock rich results such as FAQ
  dropdowns and breadcrumbs.
- **Core Web Vitals** — Google's page-speed metrics (LCP, INP, CLS). A
  ranking factor and a usability one.
