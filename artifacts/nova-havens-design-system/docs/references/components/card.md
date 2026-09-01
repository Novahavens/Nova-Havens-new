# Card family

- **Source:** `artifacts/nova-havens/src/components/ui/card.tsx:1-82`
- **Public exports:** `Card`, `CardHeader`, `CardTitle`, `CardDescription`,
  `CardContent`, and `CardFooter`.
- **Behavior:** semantic grouped surface with forwarded refs and composable
  header/body/footer regions.
- **Dependencies:** `cn`.
- **Consumers:** `not-found.tsx:7-9`; the same visual treatment is repeated in
  homepage and contact page compositions.
- **States:** static content surface; action and hover states are composed by
  the consuming page.

Cards use the raised dark surface and 16px base radius. They should group
related information with a clear hierarchy rather than turn every page section
into a floating container.