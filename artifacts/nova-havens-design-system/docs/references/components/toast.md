# Toast family

- **Source:** `toast.tsx:1-125`, `toaster.tsx:1-32`, and `hooks/use-toast.ts`
  in `artifacts/nova-havens/src/`.
- **Public exports:** Toast primitives plus `Toaster`; provider-backed
  notifications are grouped as one family.
- **Behavior:** transient feedback, one-visible-toast limit, action/close
  controls, viewport placement, swipe dismissal, and provider-backed shared
  state.
- **Consumers:** shared app infrastructure; no current user-facing call site
  was found during extraction.
- **Dependencies:** Radix Toast, React state, CVA, Lucide X, and `cn`.
- **Implementation:** primitives in `src/components/ui/toast.tsx`, provider
  renderer in `src/components/ui/toaster.tsx`, and shared API in
  `src/hooks/use-toast.tsx`; preview story:
  `src/preview/demos/toast.tsx`.
- **Usage:** mount one `Toaster` at the app shell and call `toast(...)` or
  `useToast()` from consumers. Use `ToastAction` for a short recovery action;
  Toast's built-in close control remains available for dismissal.
- **Chunk:** 2.