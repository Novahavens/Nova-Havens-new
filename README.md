# Nova Havens — novahavens.com

The public website for **Nova Havens Temporary Housing**, an insurance
relocation housing company headquartered in Nashville, Tennessee. The site is
a statically generated Next.js application: every page is rendered to HTML at
build time, served from a CDN, and hydrated only where a component needs
interactivity.

- Production: https://novahavens.com
- Framework: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4
- Hosting: Vercel (recommended) — see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## Documentation

| Document                                 | What it covers                                                                                                                         |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deploying to Vercel (and Replit/Docker), environment variables, domains, the daily data sync                                           |
| [docs/SEO.md](docs/SEO.md)               | Google Search Console setup, the sitemap, submitting URLs for indexing, and launching the new site **without losing existing traffic** |
| [docs/CMS.md](docs/CMS.md)               | How content is modelled today and how to plug in a CMS later                                                                           |
| [docs/BRAND.md](docs/BRAND.md)           | Brand asset inventory, specs, and the placeholders to replace                                                                          |
| [docs/COMPANY.md](docs/COMPANY.md)       | Every company fact published on the site, and where it is defined in code                                                              |

## Quick start

Prerequisites: Node.js 22+ and pnpm 10 (`corepack enable` installs the pinned
version automatically).

```bash
pnpm install          # install dependencies
pnpm dev              # http://localhost:3000 with hot reload
pnpm build            # production build (static HTML + assets)
pnpm start            # serve the production build locally
pnpm lint             # ESLint (Next.js rules + the design-token guard)
pnpm typecheck        # TypeScript
pnpm test:smoke       # Playwright smoke tests against the production build
```

Copy `apps/web/.env.example` to `apps/web/.env.local` for optional settings
(analytics, Search Console verification). Nothing is required to run locally.

## Repository structure

```
.
├── apps/web/                      The Next.js site (the only deployable)
│   ├── src/app/                   Routes (App Router). One folder per URL.
│   │   ├── layout.tsx             Root layout: fonts, metadata defaults, header/footer, analytics
│   │   ├── page.tsx               /                 Home
│   │   ├── about-us/page.tsx      /about-us
│   │   ├── meet-the-team/page.tsx /meet-the-team
│   │   ├── contact/page.tsx       /contact
│   │   ├── blog/page.tsx          /blog
│   │   ├── blog/[slug]/page.tsx   /blog/<slug>      pre-rendered for every post
│   │   ├── blog/[slug]/opengraph-image.tsx          generated social card per post
│   │   ├── privacy-policy/, terms-of-service/, llms-txt/
│   │   ├── llms.txt/route.ts      /llms.txt         plain-text AI index
│   │   ├── sitemap.ts             /sitemap.xml
│   │   ├── robots.ts              /robots.txt
│   │   └── not-found.tsx          branded 404
│   ├── src/components/
│   │   ├── layout/                Navbar, Footer, Logo, analytics scripts
│   │   ├── home/                  Home-page sections (carousels, map, tabs, marquee)
│   │   ├── blog/                  Post renderer, filterable list
│   │   ├── team/                  Team grid + profile dialog
│   │   ├── contact/               Embedded Jotform
│   │   ├── shared/                JSON-LD, tracked links, CTAs, FAQ, icons
│   │   └── ui/                    Button, Sheet, Tabs, Card (shadcn-style primitives)
│   ├── src/config/site.ts         ★ Single source of truth for company facts, URLs, brand
│   ├── src/content/               ★ Site content: blog posts, FAQs, how-it-works, team, llms.txt
│   │   └── source.ts              Content access layer — swap for a CMS here (docs/CMS.md)
│   ├── src/lib/                   seo.ts (metadata + JSON-LD), property-stats, team loader, analytics
│   ├── src/styles/                globals.css (Tailwind) + tokens.css (design tokens)
│   ├── data/                      Synced data: property-stats.json, team.json (written by scripts)
│   ├── scripts/                   sync-property-stats.ts (Monday.com), sync-team.mjs (Google Form)
│   ├── public/                    Images, logos, favicon, og-image, brand/ placeholders
│   ├── tests/smoke.spec.ts        Playwright smoke tests
│   ├── design/tokens.json         Design tokens (DTCG) — the source for tokens.css
│   └── next.config.ts             Headers, redirects, images, React Compiler
├── docs/                          Operations documentation (see table above)
├── .github/workflows/
│   ├── ci.yml                     Lint, typecheck, build, smoke tests on every PR
│   └── sync-data.yml              Daily data refresh → commit → redeploy
└── .replit, replit.md             Optional Replit preview/deploy configuration
```

★ = the two places most edits happen.

## How the site works

### Rendering model

Everything is **static** (`next build` emits HTML for every route). There are
no server-side requests at page-view time, no database, and no API the browser
depends on. That gives the fastest possible first paint, trivially cacheable
pages, and nothing to go down at 2 a.m. when a family needs the phone number.

Components are **React Server Components** by default and ship zero
JavaScript. Only these pieces are client components ("islands"):

| Island                                                    | Why it needs JS                                       |
| --------------------------------------------------------- | ----------------------------------------------------- |
| `layout/navbar.tsx`                                       | Mobile menu sheet, active-link highlight              |
| `home/showcase-carousel.tsx`, `home/reviews-carousel.tsx` | Autoplay, swipe, embla                                |
| `home/how-it-works-tabs.tsx`                              | Radix tabs                                            |
| `shared/faq-accordion.tsx`                                | Native `<details>`; JS only fires the analytics event |
| `blog/blog-list.tsx`                                      | Category filter                                       |
| `team/team-grid.tsx` + `team-member-modal.tsx`            | Scroll reveal, focus-trapped dialog                   |
| `contact/contact-form-embed.tsx`                          | Iframe load/timeout handling                          |
| `shared/tracked-link.tsx`                                 | Click analytics on external links                     |

The React Compiler (`reactCompiler: true`) auto-memoises those islands.

### Data flow

```
src/config/site.ts ───────────────► every page, JSON-LD, llms.txt, sitemap
src/content/*.ts ──► source.ts ───► blog pages, FAQ, team fallback, llms.txt
data/property-stats.json ─────────► lib/property-stats.ts ──► home + contact figures
data/team.json (optional) ────────► lib/team.ts (merged over content/team.ts) ──► team page
```

`data/*.json` is refreshed by `scripts/` on a daily schedule
(`.github/workflows/sync-data.yml`). A change is committed to `main`, which
triggers a new deployment. The site therefore never fetches live data in the
browser, yet the figures stay current.

### SEO layer

- `src/lib/seo.ts` builds per-page `Metadata` (title, description, canonical,
  Open Graph, Twitter) and the JSON-LD graph. One `LocalBusiness` entity
  (`https://novahavens.com/#organization`) and one `WebSite` node are
  referenced from every page.
- `app/sitemap.ts`, `app/robots.ts` and `app/llms.txt/route.ts` are generated
  from the same content, so they can never disagree with the pages.
- `app/blog/[slug]/opengraph-image.tsx` renders a branded 1200×630 social
  card for each post at build time using `next/og`.
- Fonts are self-hosted via `next/font` (no third-party request, no layout
  shift); images go through `next/image` (AVIF/WebP, correctly sized).
- `next.config.ts` adds security headers and 301 redirects for the old
  `/index.html` style URLs from the previous Vite build.

### Analytics

`src/lib/analytics.ts` exposes `trackEvent(name, data)` and forwards to
whichever trackers are configured (Umami, Google Analytics 4, Vercel Web
Analytics). The event taxonomy is documented in that file; keep names stable.

### Design tokens

`src/styles/tokens.css` defines the palette as CSS variables (dark mode is the
brand; light mode is kept as an accessible counterpart). There is exactly one
gold, `--primary` (`#D4A24C`). ESLint fails the build if a raw hex colour
appears in a component — use `bg-primary`, `text-foreground`, etc.

## Common edits

| I want to…                                                   | Edit                                                                                                                                                                                                               |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Change a phone number, email, address, social link, form URL | `apps/web/src/config/site.ts`                                                                                                                                                                                      |
| Add or edit a blog post                                      | `apps/web/src/content/blog.ts` (follow the body conventions in the file header); the sitemap, OG image and `/blog` list update automatically. Add the slug to `content/llms.ts` if it should appear in `llms.txt`. |
| Edit the FAQ                                                 | `apps/web/src/content/faqs.ts` (feeds the page, the About page and FAQ schema)                                                                                                                                     |
| Add a team member                                            | They submit the Google Form → next daily sync. For an immediate fallback, add to `apps/web/src/content/team.ts`. Roles live in `scripts/sync-team.mjs`.                                                            |
| Update "families assisted" / "days to place"                 | `PUBLIC_STATS` in `site.ts`                                                                                                                                                                                        |
| Replace the logo / favicon / social image                    | Drop files into `apps/web/public/brand` and `public/` (see `docs/BRAND.md`)                                                                                                                                        |
| Add a page                                                   | Create `apps/web/src/app/<route>/page.tsx`, export `metadata` via `pageMetadata()`, add it to `app/sitemap.ts` and (if navigational) `NAV_LINKS` in `site.ts`                                                      |

## Scripts

| Command                        | Purpose                                                                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev` / `build` / `start` | Develop, build, serve                                                                                                              |
| `pnpm lint` / `typecheck`      | Static checks (also run in CI)                                                                                                     |
| `pnpm test:smoke`              | Playwright: every route renders, metadata + JSON-LD present, no console errors, 404 works, sitemap/robots/llms.txt/OG image served |
| `pnpm sync:property-stats`     | Pull the verified property count from Monday.com into `data/property-stats.json` (needs `MONDAY_API_TOKEN`)                        |
| `pnpm sync:team`               | Pull the team roster + photos from the Google Form sheet into `data/team.json` and `public/team/`                                  |

## Deploying

Short version: push to `main`; Vercel builds and deploys. Preview deployments
are created for every pull request. Full instructions, environment variables,
domain setup and the data-sync schedule are in
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Before the first production cut-over
read [docs/SEO.md](docs/SEO.md) — it has the checklist for switching without
losing rankings.

## Migration notes (from the previous codebase)

The site was previously a Vite/React single-page app with a post-build
prerender step, an Express API, a separate design-system preview app and a
Replit-specific object-storage integration. This refactor replaces all of
that with one Next.js app:

- **Prerender + crawler HTML duplicates are gone.** Server rendering makes the
  hand-maintained `routeContent.ts` crawler copy unnecessary; there is now one
  source for what users and crawlers see.
- **Express API removed.** The only routes it served were the team roster
  (now a build-time file) and a `/api/contact` endpoint nothing on the site
  called (the Contact page embeds Jotform). The Postgres schema package went
  with it. If a native form is needed later, add a Route Handler in
  `apps/web/src/app/api/` — see docs/CMS.md for the recommended data store.
- **Design-system package folded in.** The four primitives the site actually
  uses live in `src/components/ui`; tokens live in `design/tokens.json` and
  `src/styles/tokens.css`.
- **Static OG images replaced** by generated ones (`opengraph-image.tsx`).
- **Replit object storage replaced** by files in the repo refreshed by a
  scheduled GitHub Action, so the site deploys anywhere.
- Umami analytics (injected by Replit) is now opt-in through env vars, with
  Vercel Analytics and GA4 as alternatives.
