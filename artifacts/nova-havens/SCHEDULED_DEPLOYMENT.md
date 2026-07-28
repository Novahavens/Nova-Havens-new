# Daily Property-Stats Sync — Scheduled Deployment

## What this does

`scripts/sync-property-stats.ts` fetches all properties from the Monday.com
PROPERTY DATABASE board and writes `public/property-stats.json`. The homepage
stats counter and coverage map read this file at build/serve time.

Without a scheduled run the file goes stale. This document explains how to wire
up the daily refresh via a Replit Scheduled Deployment.

## Run command

```
pnpm --filter @workspace/nova-havens run sync:property-stats
```

## Required secret

| Secret              | Where to set it                                |
| ------------------- | ---------------------------------------------- |
| `MONDAY_API_TOKEN`  | Already present in workspace secrets           |

Replit Scheduled Deployments inherit your workspace secrets automatically — no
extra action needed as long as `MONDAY_API_TOKEN` is in your Secrets tab.

## How to schedule it (one-time setup)

1. Click **Deploy** (top-right corner of the workspace).
2. Choose **Scheduled** as the deployment type.
3. Set the schedule — **daily at 06:00 UTC** is recommended.
4. Paste the run command above.
5. Confirm `MONDAY_API_TOKEN` is listed under **Secrets**.
6. Click **Publish**.

The job will run automatically every day, overwrite `public/property-stats.json`,
and keep the homepage stats current.

## Verifying a run

After each scheduled execution, check the deployment logs (Deploy → Logs) for a
line like:

```
Wrote …/public/property-stats.json: 12976 properties, 47 states, 10 mapped cities.
```

If the run fails, check that `MONDAY_API_TOKEN` is still valid and that the
Monday.com board ID (`18415735059`) has not changed.

## Files

| File | Purpose |
| ---- | ------- |
| `scripts/sync-property-stats.ts` | Sync script — fetches from Monday.com and writes the JSON |
| `public/property-stats.json`     | Output consumed by the homepage                           |
