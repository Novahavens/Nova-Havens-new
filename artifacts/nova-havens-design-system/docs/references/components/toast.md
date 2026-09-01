# Toast family

- **Source:** `toast.tsx:1-125`, `toaster.tsx:1-32`, and `hooks/use-toast.ts`
  in `artifacts/nova-havens/src/`.
- **Public exports:** Toast primitives plus `Toaster`; provider-backed
  notifications are grouped as one family.
- **Behavior:** transient feedback, action/close controls, viewport placement,
  and provider state.
- **Consumers:** shared app infrastructure; no current user-facing call site
  was found during extraction.
- **Dependencies:** Radix Toast, React context/state, and `cn`.
- **Chunk:** 2, pending until the pilot is approved.