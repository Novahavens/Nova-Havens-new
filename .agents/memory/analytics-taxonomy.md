---
name: Nova Havens analytics taxonomy
description: The custom Umami event taxonomy instrumented on the nova-havens web artifact — event names, property conventions, and what was deliberately left out.
---

## Events

- `intake_form_click` — props: `form` ('housing' | 'property'), `location`. Fired on every external Jotform CTA link site-wide (navbar desktop/mobile, home hero/pets/how-it-works/emergency, contact quick actions, blog post CTA).
- `ask_ai_click` — props: `assistant`, `location`.
- `team_member_viewed` — props: `member`. Fired from the single `openProfile` handler, covers all team-card entry points automatically.
- `faq_expanded` — props: `question`, `location` ('home_faq' | 'about_faq'). Fires only when a FAQ item transitions closed→open, never on collapse. Instrumented on both the Home and About page FAQ accordions.
- `blog_filter_selected` — props: `filter`. Fires only when the filter actually changes (not on re-clicking the active filter).
- `social_link_click` — props: `platform` ('linkedin' | 'instagram' | 'facebook').
- `contact_link_click` — props: `method` ('phone' | 'email'), `location`. Fired on every direct phone/email link site-wide: footer, home emergency band, contact hero banner/info cards/form-side note/embed-load-failure fallback, blog post CTA, team page CTA. Deliberately excludes the mailto/tel mentions embedded in the Terms of Service and Privacy Policy legal boilerplate — not a designed contact flow, low signal.

## Conventions to keep consistent

- `location` values follow a `{page}_{section}` snake_case pattern (e.g. `home_hero`, `home_pets`, `navbar_desktop`, `contact_quick_action`, `contact_info`, `blog_post_cta`, `team_cta`). Match this pattern for new location props instead of inventing a different shape.
- `form` is always exactly `'housing' | 'property'` — reuse those two literals rather than synonyms like `'housing_request'`.
- `method` on `contact_link_click` is always exactly `'phone' | 'email'`.
- All events use the shared `trackEvent` wrapper in `src/lib/analytics.ts` (safe no-op via `window.umami?.track`, wrapped in try/catch) — never call `window.umami.track` directly.

**Why:** decorative/non-outcome interactions (review carousel prev/next, the automatic showcase carousel, the team-member modal's close button/backdrop click) were deliberately excluded as not "meaningful" per the project-analytics skill's guidance — don't instrument them later without a reason to revisit that call. Legal-page (Terms/Privacy) contact mentions were excluded for the same reason: real but low-signal, not a designed conversion path.

**How to apply:** when adding a new trackable interaction, check this list first so event/property names stay consistent (queries and dashboards depend on stable naming), and re-apply the same exclusion judgment to purely decorative UI or incidental legal-page mentions.
