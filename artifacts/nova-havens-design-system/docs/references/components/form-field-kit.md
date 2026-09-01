# Form field kit

- **Source:** `form.tsx:1-178`, `input.tsx:1-21`, `label.tsx:1-25`,
  `textarea.tsx:1-21`, and `native-select.tsx:1-60` in
  `artifacts/nova-havens/src/components/ui/`.
- **Public exports:** `Form`, `FormField`, `FormItem`, `FormLabel`,
  `FormControl`, `FormDescription`, `FormMessage`, `useFormField`, `Input`,
  `Label`, `Textarea`, and `NativeSelect`.
- **Behavior:** React Hook Form controller context, generated IDs, linked
  descriptions/messages, `aria-invalid`, disabled fields, native mobile select,
  and visible focus rings.
- **Dependencies:** `react-hook-form`, `@radix-ui/react-label`,
  `@radix-ui/react-slot`, Lucide ChevronDown, and `cn`.
- **Consumers:** `ContactPage.tsx:185-299`.
- **States:** empty, filled, invalid, submitting/disabled, API error, and success
  are exercised by the contact flow.

The field kit favors explicit labels and short supporting descriptions. Native
select is intentional: it preserves keyboard, screen-reader, and mobile-picker
behavior without the heavier floating UI dependency.