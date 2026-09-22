# Tabs family

- **Public exports:** `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`.
- **Behavior:** Radix Tabs keyboard navigation, controlled/uncontrolled values,
  disabled triggers, focus handling, and active-state styling.
- **Dependencies:** `@radix-ui/react-tabs` and `cn`.
- **Consumers:** `HomePage.tsx:531-582`.
- **States:** active, inactive, disabled, keyboard focus, and content switching.
- **Implementation:** `src/components/ui/tabs.tsx`; preview story:
  `src/preview/demos/tabs.tsx`.

Tabs are appropriate for related audience paths that share context. They are
not a replacement for primary site navigation or unrelated destinations.