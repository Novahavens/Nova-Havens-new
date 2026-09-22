# Form field kit

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
- **Implementation:** `src/components/ui/form.tsx`, `src/components/ui/input.tsx`,
  `src/components/ui/label.tsx`, `src/components/ui/textarea.tsx`, and
  `src/components/ui/native-select.tsx`; preview story:
  `src/preview/demos/form.tsx`.

The field kit favors explicit labels and short supporting descriptions. Native
select is intentional: it preserves keyboard, screen-reader, and mobile-picker
behavior without the heavier floating UI dependency.