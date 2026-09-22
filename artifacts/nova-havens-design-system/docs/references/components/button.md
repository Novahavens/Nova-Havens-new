# Button family

- **Public exports:** `Button`, `buttonVariants`
- **Behavior:** native button by default; `asChild` delegates to Radix Slot.
- **Variants:** default, destructive, outline, secondary, ghost, link.
- **Sizes:** default, sm, lg, icon.
- **States:** disabled, keyboard focus, hover/active elevation, icon alignment.
- **Dependencies:** `@radix-ui/react-slot`, `class-variance-authority`, `cn`.
- **Consumers:** `HomePage.tsx:617-620,667-670`, `ContactPage.tsx:299`,
  and `Navbar.tsx:49-54`.
- **Implementation:** `src/components/ui/button.tsx`; preview story:
  `src/preview/demos/button.tsx`.

The source's page-level CTA treatment uses rounded-full gold fills for primary
actions and gold outlines for secondary actions; the primitive retains the
source component API and compact radius so consumers can compose those larger
CTA treatments without a second color token.