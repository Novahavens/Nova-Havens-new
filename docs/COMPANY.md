# Company information

Every fact below is published on the site and defined in exactly one place:
`apps/web/src/config/site.ts` (plus the content files noted). Change it there
and every page, JSON-LD block, `llms.txt` and the sitemap update together.
Items marked **TBC** are not yet confirmed and are intentionally not published.

## Identity

| Fact                                                                 | Value                                                                                                                                                                                                                                                                                                                                                | Defined in            |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Brand name                                                           | Nova Havens                                                                                                                                                                                                                                                                                                                                          | `COMPANY.name`        |
| Trading / legal name                                                 | Nova Havens Temporary Housing                                                                                                                                                                                                                                                                                                                        | `COMPANY.legalName`   |
| Tagline                                                              | Nationwide Furnished Housing Coordination                                                                                                                                                                                                                                                                                                            | `COMPANY.tagline`     |
| Canonical definition (used verbatim in structured data and llms.txt) | Nova Havens Temporary Housing is an insurance relocation housing company headquartered in Nashville, Tennessee, that coordinates furnished temporary housing for policyholders displaced by insured property damage, working directly with insurance carriers, adjusters, and relocation specialists under Additional Living Expense (ALE) coverage. | `COMPANY.definition`  |
| Meta description (default)                                           | Nova Havens places insurance-displaced families into verified furnished homes nationwide within 24–48 hours — billed directly to carriers so families pay nothing out of pocket.                                                                                                                                                                     | `COMPANY.description` |
| Category                                                             | Additional Living Expense (ALE) housing                                                                                                                                                                                                                                                                                                              | `COMPANY.category`    |
| Service type (schema.org)                                            | Insurance Housing Coordination                                                                                                                                                                                                                                                                                                                       | `COMPANY.serviceType` |
| Business type (schema.org)                                           | `LocalBusiness`                                                                                                                                                                                                                                                                                                                                      | `lib/seo.ts`          |
| Founded                                                              | **TBC**                                                                                                                                                                                                                                                                                                                                              | `COMPANY.founded`     |
| Legal entity type / registration                                     | **TBC** (not published)                                                                                                                                                                                                                                                                                                                              | —                     |

## Contact

| Channel                     | Value                                                                    | Notes                                                                           | Defined in                |
| --------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------- | ------------------------- |
| Main phone                  | (629) 401-0054 · `+16294010054`                                          | 24/7 for emergency claims and placements                                        | `CONTACT.phone`           |
| After-hours specialty line  | (629) 206-2360 · `+16292062360`                                          | Shown on home emergency band and Contact page                                   | `CONTACT.afterHoursPhone` |
| General email               | info@novahavens.com                                                      |                                                                                 | `CONTACT.email`           |
| Housing requests (bulk)     | claims@novahavens.com                                                    | Published in llms.txt                                                           | `CONTACT.claimsEmail`     |
| Property submissions (bulk) | properties@novahavens.com                                                | Published in llms.txt                                                           | `CONTACT.propertiesEmail` |
| Contact-form fallback       | william@novahavens.com                                                   | Shown only if the embedded form fails to load; also on the Privacy Policy draft | `CONTACT.fallbackEmail`   |
| Headquarters                | Nashville, Tennessee, United States                                      | Street address and ZIP **TBC** — add to `CONTACT.address` to publish            | `CONTACT.address`         |
| Hours                       | Urgent requests 24/7; general enquiries answered within one business day |                                                                                 | `COMPANY.hoursNote`       |

## Intake forms (Jotform)

| Form                                | URL                                      | Who uses it                                           |
| ----------------------------------- | ---------------------------------------- | ----------------------------------------------------- |
| Housing request                     | https://form.jotform.com/233367822228156 | Adjusters, carriers, relocation specialists, families |
| Property submission                 | https://form.jotform.com/233211031603032 | Property owners and managers                          |
| Contact form (embedded on /contact) | https://form.jotform.com/262575434019055 | General enquiries                                     |

Defined in `INTAKE_FORMS`. Every CTA on the site links to one of the first two.

## Social profiles

| Platform  | URL                                                |
| --------- | -------------------------------------------------- |
| LinkedIn  | https://www.linkedin.com/company/novahavenshousing |
| Instagram | https://www.instagram.com/novahavenshousing/       |
| Facebook  | https://www.facebook.com/novahavenshousing         |

Defined in `SOCIAL`; emitted as `sameAs` in JSON-LD.

## Service area and public figures

| Fact                      | Value                                                                                        | Source / rule                                                                                                                    | Defined in                         |
| ------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Service area              | All 48 contiguous US states                                                                  | Authoritative claim; every surface derives from this                                                                             | `SERVICE_AREA`                     |
| Verified property records | 60,000+ | `PUBLISHED_PROPERTY_COUNT` in `config/site.ts`. The Monday.com snapshot in `data/property-stats.json` is kept for reference but is no longer the published figure. | `lib/property-stats.ts`            |
| Families assisted         | 531+ in 2025                                                                                 | Year-end figure; update annually                                                                                                 | `PUBLIC_STATS.familiesAssisted`    |
| Average days to place     | < 5 days (2025)                                                                              |                                                                                                                                  | `PUBLIC_STATS.averageDaysToPlace`  |
| Google rating             | 4.8 / 5                                                                                      | Shown on home page                                                                                                               | `PUBLIC_STATS.googleRating`        |
| Pet placement counters    | 340+ dogs, 70+ cats, 13+ birds (baseline Sept 2026, +21/+7/+3 per month)                     | Illustrative marketing figures, not a live feed                                                                                  | `components/home/pet-counters.tsx` |

## Partners shown on the site

Allstate, Travelers, Farmers Insurance, State Farm, Mercury, Lemonade, Chubb
(`PARTNERS` in `site.ts`; logos in `public/logos/`). Partner logos are
trademarks of their owners.

## Team

Roster, roles and profile answers: `apps/web/src/content/team.ts` (fallback)
and `apps/web/data/team.json` (synced from the Google Form). Roles are
maintained in `scripts/sync-team.mjs` because the form does not collect them.

| Name               | Role                           |
| ------------------ | ------------------------------ |
| Paulina Avellaneda | Senior Property Coordinator    |
| Alishia Isaac      | Housing Coordination           |
| Sydney Maraletos   | Leasing & Move-In Coordination |
| Chané Burger       | Client Coordination            |
| Brenda Mlunjwa     | Client Support                 |
| Fazal Abed         | AI Engineer                    |

Values published on the team page: **G.I.V.E.** — Give a damn, Integrity,
Value, Efficiency.

## Operational systems referenced by the site

| System                                                             | Purpose                               | Where                            |
| ------------------------------------------------------------------ | ------------------------------------- | -------------------------------- |
| Monday.com board `18415735059` (PROPERTY DATABASE)                 | Source of the verified property count | `scripts/sync-property-stats.ts` |
| Google Form + Sheet `1o0gu36md6JGGbP2NH5NZaKJWtMXAc5lrlCibxfnikFo` | Team profiles and photos              | `scripts/sync-team.mjs`          |
| Jotform                                                            | All intake and contact forms          | `INTAKE_FORMS`                   |
| Vercel                                                             | Hosting, analytics                    | docs/DEPLOYMENT.md               |
| GitHub Actions                                                     | CI and the daily data sync            | `.github/workflows/`             |

## Legal pages

Privacy Policy and Terms of Service are **drafts pending attorney review**
and carry a visible draft banner (`components/shared/legal-page.tsx`).
Governing law stated: State of Tennessee.
