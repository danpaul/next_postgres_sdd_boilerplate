## Goal

Define a standard component structure, implement a `Button` atom that follows it, and document the conventions in `AGENTS.md`.

## Requirements

- Custom Tailwind components from scratch (no shadcn, Radix, or other UI kit).
- TypeScript: existing project `tsconfig` only; no extra rules.

### Folder & files

- Shared UI lives under `src/components`, organized by atomic design: `atoms` / `molecules` / `organisms` / `templates`.
- Create only `src/components/atoms/Button/` now; other layers are documented, not implemented.
- One folder per component; main file is PascalCase and matches the folder (`Button/Button.tsx`).
- Colocate only the component file in this spec (no `types.ts`, styles file, tests, stories, or per-component `index.ts`).
- No barrel files at any level. Import the file: `@/components/atoms/Button/Button` (existing `@` alias).
- Each component uses both a named export and a default export of the same component.

### Component API conventions

- Server Components by default; add `"use client"` only when the component needs client features (e.g. handlers, state).
- Always `forwardRef` and extend native element props (`React.ComponentProps<"button">` or equivalent).
- Export `ButtonProps` from the same file as the component.
- Props only (no compound components like `Button.Icon`).
- No variant library (CVA, etc.): plain class maps / conditionals in the component.
- No `className` merge helper (`clsx` / `tailwind-merge` / `cn`). Accept `className` via native props and concatenate it simply.

### Button

- Location: `src/components/atoms/Button/Button.tsx`.
- Renders a native `<button>` only (not polymorphic, no `asChild` / `as`).
- Default `type="button"`.
- Variants: `primary`, `secondary`.
- Sizes: `sm`, `md` (default), `lg`.
- States: `disabled`, `loading`, full-width.
- No icon API and no icon library.
- When `loading`: set native `disabled` and `aria-disabled`, and show a simple CSS dots/pulse indicator (not an SVG/icon).
- Styling: placeholder Tailwind aligned with the current light page (zinc/black). Light mode only.
- Hover styles may be simple color/opacity changes; no extra animation/transitions.

### Accessibility

- Rely on native `<button>` semantics and keyboard behavior; no extra key handling.
- Visible focus ring required.

### AGENTS.md

- Append conventions below the existing Next.js agent block (do not remove that block).
- Document: atomic folder map; per-component file checklist; named + default exports and no barrels; client vs server rule; how to add variants (plain maps); a11y expectations.
- `Button` is the canonical example; do not add a second example component. No separate do/don't section required.

## Acceptance Criteria

- `src/components/atoms/Button/Button.tsx` exists and is the only new file under `src/components`.
- `Button` is importable as both a named and a default export from `@/components/atoms/Button/Button`, and `ButtonProps` is exported from the same file.
- `Button` renders a native `<button>` with `type="button"` unless the caller passes another `type`.
- Every `variant` and `size` value renders distinct styles; `md` is used when no size is passed.
- With `loading`, the button is natively disabled, has `aria-disabled="true"`, and shows a CSS dots/pulse indicator.
- The full-width state stretches the button to its container's width.
- A caller's `className` is appended to the button's classes.
- Keyboard focus shows a visible focus ring.
- No CVA, `clsx`, `tailwind-merge`, `cn`, UI kit, or icon library is added.
- `AGENTS.md` documents the conventions below the unchanged Next.js block, with `Button` as the canonical example.

## Out of Scope

- Using `Button` on a page.
- Other primitives, forms, icon library, Storybook, unit/e2e tests.
- Implementing `molecules` / `organisms` / `templates` (or pages).
- Design-token / theming system.
- Animation beyond simple hover.
- Dark mode for `Button`.
