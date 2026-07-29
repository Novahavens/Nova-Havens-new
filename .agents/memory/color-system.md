---
name: Nova Havens color system
description: Single-gold token discipline and accent rules for the Nova Havens site
---

The site has exactly ONE gold: `#D4A24C` (`--primary`). The secondary gold `#F2CD6B` was deliberately retired in July 2026 — do not reintroduce it.

**Why:** two golds applied to large type and fills made sections read as "going yellow"; off-white on gold also failed WCAG AA (2.12:1 vs required 4.5:1).

**How to apply:**
- Never hardcode hex colors in pages/components — use tokens (`primary`, `card`, `surface-1/2/3`, `tertiary`, etc.). The rule block at the top of `src/index.css` `:root` is the authoritative reference.
- Gold is accent-only: icons ≤32px, eyebrows, pills, buttons, active states, links, rings, thin dividers, small markers. Never on type >24px, section backgrounds, or shape fills >48px (use dark surface + thin gold border instead).
- Text on a gold fill is always `text-primary-foreground` (near-black), never off-white.
- Exactly three text colors: foreground / muted-foreground / tertiary — no opacity variants like `text-foreground/50`.
- shadcn lib defaults (`ui/chart.tsx`, `ui/toast.tsx`) are exempt and untouched.
