# Sheet family

- **Public exports:** `Sheet`, `SheetPortal`, `SheetOverlay`, `SheetTrigger`,
  `SheetClose`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`,
  and `SheetDescription`.
- **Behavior:** Radix Dialog focus management, escape/outside close, portal,
  overlay, close affordance, and four side variants.
- **Dependencies:** `@radix-ui/react-dialog`, CVA, Lucide X, and `cn`.
- **Consumers:** `Navbar.tsx:47-75`.
- **States:** closed by default, open/closed animation, focus, and responsive
  compact navigation.
- **Implementation:** `src/components/ui/sheet.tsx`; preview story:
  `src/preview/demos/sheet.tsx`.

The mobile panel is a navigation utility, not a default first-use overlay. Keep
the trigger visible and keep primary request actions available inside the panel.