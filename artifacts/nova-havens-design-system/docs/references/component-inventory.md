# Nova Havens component inventory

Source: existing workspace artifact `artifacts/nova-havens`.

The inventory represents reusable UI families from `src/components/ui`. Page
compositions such as `Navbar`, `Footer`, `Layout`, `AskAiAboutUs`, and
`TeamMemberModal` remain application-owned; they are captured as usage patterns,
not copied into the design-system package.

| Family | Reference | Dependencies / blockers | Evidence | Chunk | Status |
| --- | --- | --- | --- | --- | --- |
| Button | `components/button.md` | `@radix-ui/react-slot`, CVA, `cn` | Homepage CTAs, contact submit, mobile menu trigger | 1 · pilot | implemented |
| Form field kit | `components/form-field-kit.md` | React Hook Form, Radix Label/Slot, `cn` | Contact name/email/subject/message fields and validation states | 1 · pilot | implemented |
| Sheet | `components/sheet.md` | Radix Dialog, CVA, Lucide X, `cn` | Responsive Navbar mobile menu | 1 · pilot | implemented |
| Card | `components/card.md` | `cn` | Not-found card plus repeated site card treatment | 1 · pilot | implemented |
| Tabs | `components/tabs.md` | Radix Tabs, `cn` | Homepage audience switcher for family, adjuster, and owner paths | 1 · pilot | implemented |
| ElegantCarousel | `components/elegant-carousel.md` | React state/effects, Lucide controls | Homepage property showcase and testimonials | 2 | implemented |
| Toast | `components/toast.md` | Radix Toast, `use-toast` | Shared feedback infrastructure; no current user-facing call site | 2 | implemented |

## Source runtime and composition notes

- `src/index.css` supplies the global token runtime, Tailwind theme aliases,
  one-gold rule, content-width scale, architectural heights, and reduced-motion
  behavior.
- The source loads Plus Jakarta Sans from Google Fonts and uses it for all UI
  and marketing copy.
- The source breakpoint keeps the compact navigation through 1023px and
  switches to desktop navigation at 1024px.
- The source uses Wouter for app routing, but product navigation remains in the
  consuming app rather than this package.