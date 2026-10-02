# Brand assets

All brand assets live in `apps/web/public/`. The files under `public/brand/`
are **generated placeholders** so the site builds today; swap each for the
approved asset using the **same filename** and no code changes are needed.
Paths are referenced from `BRAND.assets` in `apps/web/src/config/site.ts`.

## 1. Asset inventory

| File                                     | Status                   | Replace with                                                                      | Spec                                      | Used by                                                                                                                                                  |
| ---------------------------------------- | ------------------------ | --------------------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/brand/logo-horizontal-dark.svg`  | placeholder              | Horizontal wordmark for dark backgrounds                                          | SVG, transparent, ≈5:1, safe margin ≥ 10% | Not yet rendered — `components/layout/logo.tsx` draws a text wordmark; switch it to `<Image src={BRAND.assets.logoHorizontalDark}>` once the asset lands |
| `public/brand/logo-horizontal-light.svg` | placeholder              | Horizontal wordmark for light backgrounds                                         | SVG                                       | Email signatures, light-mode future                                                                                                                      |
| `public/brand/logo-mark.svg`             | placeholder              | Square mark                                                                       | SVG 1:1, legible at 32 px                 | App icon source, social avatars                                                                                                                          |
| `public/favicon.svg`                     | current (gold "N" shape) | Final favicon                                                                     | SVG 1:1                                   | `app/layout.tsx` `icons`                                                                                                                                 |
| `public/og-image.png`                    | current                  | Default social sharing card                                                       | PNG 1200×630, < 300 KB, text ≥ 48 px      | Every page without its own image; `LocalBusiness.logo` in JSON-LD                                                                                        |
| `public/logos/*.{svg,png}`               | current                  | Carrier partner logos (Allstate, Travelers, Farmers, State Farm, Lemonade, Chubb) | Monochrome-friendly; ≤ 40 px tall at 2×   | `home/partners-marquee.tsx`; list in `PARTNERS` in `site.ts`                                                                                             |
| `public/*.webp`                          | current                  | Property/amenity photography                                                      | WebP, ≤ 1600 px wide, ≤ 250 KB            | Home showcase & pet section                                                                                                                              |
| `public/team/*.jpg`                      | synced                   | Team portraits                                                                    | Square, ≥ 320 px                          | Team page (written by `scripts/sync-team.mjs`)                                                                                                           |

Recommended additions when the brand kit is ready (drop in `public/`, then
register in `app/layout.tsx` → `icons`):

- `favicon.ico` 48×48 (legacy browsers)
- `apple-touch-icon.png` 180×180
- `icon-192.png`, `icon-512.png` (+ `manifest.webmanifest` if a PWA install
  prompt is wanted)

## 2. Colour

Defined once in `apps/web/src/styles/tokens.css` (source:
`apps/web/design/tokens.json`). Components must use token classes, never hex —
ESLint enforces it.

| Token                  | Hex                               | Role                                                                            |
| ---------------------- | --------------------------------- | ------------------------------------------------------------------------------- |
| `--primary`            | `#D4A24C`                         | **The only gold.** Buttons, links, labels, active states, focus rings, dividers |
| `--primary-foreground` | `#0B0D14`                         | Text on gold                                                                    |
| `--background`         | `#0A0C10`                         | Page background (dark mode is the brand)                                        |
| `--card`               | `#111318`                         | Cards and panels                                                                |
| `--foreground`         | `#F5F5F2`                         | Primary text                                                                    |
| `--muted-foreground`   | `#9BA3AF`                         | Secondary text                                                                  |
| `--surface-1/2/3`      | `#0D0F14` / `#151820` / `#1A1D24` | Section bands and nested surfaces                                               |
| `--tertiary`           | `#7A828F`                         | Footnotes                                                                       |
| `--destructive`        | `#DC2828`                         | Errors only                                                                     |

A light palette exists in the same file for future use; the site forces dark.

## 3. Typography

**Plus Jakarta Sans**, weights 400/500/600/700/800, self-hosted via
`next/font` in `app/layout.tsx` (no Google Fonts request at runtime). Headings
are extra-bold (800) with tight tracking; body is 400 at 16–18 px with
relaxed line height. Hero size is fluid: `clamp(3rem, 6vw, 5rem)`.

## 4. Voice (for anyone writing copy)

Calm, concrete, compassionate. Short sentences. Lead with the family's
situation, then the logistics. Never state what a policy covers — direct to the
adjuster. Never publish a raw property count other than the verified,
floored figure from `lib/property-stats.ts`.

## 5. Social profiles

| Platform  | URL                                                | Image specs                    |
| --------- | -------------------------------------------------- | ------------------------------ |
| LinkedIn  | https://www.linkedin.com/company/novahavenshousing | Logo 300×300, banner 1128×191  |
| Instagram | https://www.instagram.com/novahavenshousing/       | Avatar 320×320                 |
| Facebook  | https://www.facebook.com/novahavenshousing         | Profile 170×170, cover 820×312 |

Defined in `SOCIAL` in `site.ts`; also emitted as `sameAs` in JSON-LD.

## 6. Replacing an asset

1. Export at the spec above; optimise (`svgo` for SVG, Squoosh for PNG/WebP).
2. Copy over the existing file, keeping the name.
3. Run `pnpm dev`, check the header, footer, a share preview
   (https://www.opengraph.xyz) and the favicon.
4. Commit. Browsers cache favicons aggressively — a hard refresh or a new
   profile may be needed to see the change.
