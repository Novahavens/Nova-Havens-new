# SEO Strategy

## In scope
- All public-facing Nova Havens pages: `/`, `/about-us`, `/meet-the-team`, `/blog`, public blog articles, `/contact`, `/privacy-policy`, and `/terms-of-service`
- Machine-readable public resources including `/robots.txt`, `/sitemap.xml`, and `/llms.txt`

## Out of scope
- API server (backend only, no public-facing HTML pages)
- Mockup sandbox and design-system previews (internal tools)

## Target audience
- Insurance adjusters and carriers needing a temporary housing coordinator
- Displaced families seeking furnished housing during a home insurance claim
- Property owners who want to list furnished homes for insurance placements

## Primary keywords
- Temporary furnished housing (insurance)
- Nationwide housing coordination for insurance claims
- Displaced family housing
- Insurance housing coordinator

## Rendering mode
- React/Vite application with a build-time prerender step.
- Public routes receive route-specific static body content, metadata, canonicals, and JSON-LD in generated HTML; React replaces the static body after client startup.

## Crawler assumptions
- Search, social, and AI crawlers can consume the generated static HTML without executing JavaScript.
- AI crawlers are explicitly allowed by `robots.txt`, and `/llms.txt` is maintained as a public machine-readable resource.

## Dismissed categories
- (None yet)
