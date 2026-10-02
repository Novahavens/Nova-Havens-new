# Deployment

The site is a Next.js app in `apps/web`. It builds to static HTML plus a
small Node server for image optimisation and the handful of generated routes.
**Vercel** is the recommended host: it is built by the Next.js team, needs no
server configuration, gives a preview URL for every pull request, and its Web
Analytics / Speed Insights are already wired in. Replit and Docker
instructions are included for completeness.

## 1. Vercel (recommended)

### First-time setup

1. Sign in at https://vercel.com and click **Add New → Project**.
2. Import the GitHub repository `Novahavens/Nova-Havens-new`. If the repo is
   not listed, grant the Vercel GitHub App access to it.
3. In **Configure Project**:
   - **Framework Preset:** Next.js (detected automatically)
   - **Root Directory:** `apps/web` — click _Edit_, pick the folder.
     Vercel still installs from the repository root because it detects the
     pnpm workspace via `pnpm-lock.yaml`.
   - **Build Command / Output Directory / Install Command:** leave default.
   - **Node.js version:** 22.x (Project Settings → General after import).
4. Add **Environment Variables** (Production + Preview unless noted):

   | Variable                                                       | Value                     | Notes                                                                                           |
   | -------------------------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------- |
   | `NEXT_PUBLIC_SITE_URL`                                         | `https://novahavens.com`  | Canonical base. Set the same value on Preview so previews never emit preview-domain canonicals. |
   | `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`                         | token from Search Console | Only if using the HTML-tag method (docs/SEO.md).                                                |
   | `NEXT_PUBLIC_GA_MEASUREMENT_ID`                                | `G-…`                     | Optional.                                                                                       |
   | `NEXT_PUBLIC_UMAMI_WEBSITE_ID`, `NEXT_PUBLIC_UMAMI_SCRIPT_URL` |                           | Optional.                                                                                       |

   Do **not** add `MONDAY_API_TOKEN` to Vercel — the sync runs in GitHub
   Actions, not in the site build.

5. Click **Deploy**. The first build takes 2–3 minutes. You get a
   `*.vercel.app` URL immediately.
6. Enable **Analytics** and **Speed Insights** in the project's tabs (free
   tier is sufficient). The components only render when `VERCEL` is set, so
   nothing loads on other hosts.

### Connecting the domain

1. Project → **Settings → Domains → Add**: `novahavens.com`, then
   `www.novahavens.com`. Set `www` to **redirect to** `novahavens.com`
   (308), so there is exactly one canonical host.
2. Vercel shows the DNS records to add at the registrar/DNS provider:
   - `A  @   76.76.21.21` (or the CNAME flattening option if offered)
   - `CNAME  www  cname.vercel-dns.com`
3. **Before switching production DNS**, lower the TTL on the existing records
   to 300 s a day in advance, and complete the pre-launch checklist in
   [docs/SEO.md → Launching without losing traffic](SEO.md#5-launching-the-new-site-without-losing-traffic).
4. After the switch Vercel provisions TLS automatically (a few minutes).
   Verify `https://novahavens.com/robots.txt` and `/sitemap.xml` respond.

### Day-to-day

- **Push to `main` → production deploy.** Pull requests get a preview URL in
  the PR checks. Preview deployments carry `X-Robots-Tag: noindex`
  automatically, so they are never indexed.
- **Rollback:** Deployments tab → pick a previous deployment → _Promote to
  Production_. Instant.
- **Logs:** Project → Logs (runtime) and the deployment page (build).

## 2. Daily data sync (GitHub Actions)

`.github/workflows/sync-data.yml` runs every day at 06:00 UTC:

1. `pnpm sync:property-stats` pulls the property count from the Monday.com
   PROPERTY DATABASE board (ID `18415735059`) into `apps/web/data/property-stats.json`.
2. `pnpm sync:team` pulls the team roster from the Google Form responses
   sheet into `apps/web/data/team.json` and photos into `apps/web/public/team/`.
3. If anything changed it commits to `main`, which triggers a Vercel deploy.

Setup (one time):

- Repository → **Settings → Secrets and variables → Actions → New secret**:
  `MONDAY_API_TOKEN` (a Monday.com personal API token with read access to the
  board).
- **Settings → Actions → General → Workflow permissions:** "Read and write
  permissions" (the job commits).
- Google prerequisites for the team sync: the responses **sheet** and the
  Drive **folder** holding the photo uploads must both be shared as _Anyone
  with the link can view_. Until then the team step is skipped
  (`continue-on-error`) and the fallback roster in `src/content/team.ts` is
  used.
- Run it manually any time: Actions → _Sync site data_ → **Run workflow**.

If the figures on the site look stale, check the latest run of that workflow
first.

## 3. Replit (alternative)

`.replit` is configured for an Autoscale deployment: build command
`pnpm install --frozen-lockfile && pnpm build`, run command `pnpm start`,
port 3000. Set `NEXT_PUBLIC_SITE_URL` in the Replit Secrets tab. The
scheduled data refresh still comes from GitHub Actions; Replit redeploys when
`main` changes if the Replit project is linked to the GitHub repo.

## 4. Docker / any Node host

```bash
NEXT_OUTPUT=standalone pnpm build
# copies: apps/web/.next/standalone (server), apps/web/.next/static, apps/web/public
node apps/web/.next/standalone/apps/web/server.js   # PORT=3000 by default
```

A minimal Dockerfile:

```dockerfile
FROM node:22-alpine AS build
WORKDIR /repo
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile && NEXT_OUTPUT=standalone pnpm build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /repo/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
```

## 5. Environment variables reference

All variables are optional. See `apps/web/.env.example` for the full list with
comments. `NEXT_PUBLIC_*` values are embedded in the client bundle at build
time — never put secrets in them.

## 6. Checks that run before anything ships

`.github/workflows/ci.yml` runs on every pull request: `pnpm lint`,
`pnpm typecheck`, `pnpm build`, then Playwright smoke tests against the
production build. Vercel also builds each PR; a failing build blocks the
preview. Merge only when both are green.
