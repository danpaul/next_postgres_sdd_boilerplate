# Implementation Plan: Component Structure

Source spec: [spec.md](./spec.md)

Define shared-component conventions, implement one `Button` atom that follows them, and document the conventions in `AGENTS.md`. Do not use `Button` on a page.

## Technical context

- Next.js 16 / React 19 / Tailwind 4
- Path alias `@/*` → `./src/*` already exists in `tsconfig.json`
- No `src/components` tree yet
- No `clsx`, `cva`, `cn`, shadcn, or Radix — do not add them
- Current light page palette in `src/app/page.tsx`: `zinc-50`, `white`, `black`, `zinc-600`

## Target structure

Create only the `Button` folder. Document the other atomic layers in `AGENTS.md`; do not create empty `molecules` / `organisms` / `templates` directories.

```
src/components/
  atoms/Button/Button.tsx
```

Future layout (documented, not created):

```
src/components/
  atoms/
  molecules/
  organisms/
  templates/
```

Rules:

- One folder per component; main file is PascalCase and matches the folder (`Button/Button.tsx`).
- Colocate only the component file (no `types.ts`, styles file, tests, stories, or per-component `index.ts`).
- No barrel files at any level. Import the file: `@/components/atoms/Button/Button`.
- Each component uses both a named export and a default export of the same component.

## Button

**File:** `src/components/atoms/Button/Button.tsx`

### Component model

- No `"use client"`. The component is presentational (no internal state or handlers). Client parents can still import it because it uses no server-only APIs.
- Always `forwardRef`. Wrap a native `<button>` only — not polymorphic, no `asChild` / `as`.
- Props only (no compound components like `Button.Icon`).
- No icon API and no icon library.

### Props

Export `ButtonProps` from the same file.

```ts
export type ButtonProps = React.ComponentProps<"button"> & {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
};
```

If React 19’s built-in `ref` on `ComponentProps<"button">` conflicts with `forwardRef`, omit `ref` from the native props intersection:

```ts
export type ButtonProps = Omit<React.ComponentProps<"button">, "ref"> & {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
};
```

Defaults:

- `type="button"`
- `variant="primary"`
- `size="md"`

### Variants and class maps

No CVA / clsx / tailwind-merge. Plain class maps and string concatenation. Append caller `className` last.

```ts
const variantClasses = {
  primary: "bg-black text-white hover:bg-zinc-800",
  secondary: "border border-zinc-200 bg-zinc-100 text-black hover:bg-zinc-200",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-5 py-2.5 text-lg",
};
```

Shared base classes (adjust as needed while staying zinc/black, light only):

- `inline-flex items-center justify-center font-medium`
- visible focus ring: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black`
- disabled: `disabled:opacity-50 disabled:cursor-not-allowed`
- `fullWidth` → `w-full`
- no `dark:` classes
- no extra hover animation/transitions (color/opacity change only)

Concatenate:

```ts
const classes = [
  baseClasses,
  variantClasses[variant],
  sizeClasses[size],
  fullWidth ? "w-full" : "",
  className,
]
  .filter(Boolean)
  .join(" ");
```

### Loading and a11y

When `loading` is true:

- Set native `disabled` (`disabled={disabled || loading}`).
- Set `aria-disabled={true}` (loading only; plain `disabled` relies on native semantics).
- Show a simple CSS dots/pulse indicator using Tailwind `animate-pulse` on spans (not an SVG or icon).
- Keep `children` in the tree but hide them visually (`invisible` / `opacity-0`) so button width stays stable.

Rely on native `<button>` semantics and keyboard behavior. Do not add extra key handling.

### Export shape

```ts
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  props,
  ref,
) {
  // ...
});

export { Button };
export default Button;
```

## AGENTS.md

Append conventions **below** the existing Next.js agent block (`<!-- END:nextjs-agent-rules -->`). Do not remove or rewrite that block.

Document:

1. **Atomic folder map** — `src/components/{atoms,molecules,organisms,templates}`; only atoms exist today.
2. **Per-component file checklist** — folder named after the component; `ComponentName/ComponentName.tsx` only; no colocated types/styles/tests/stories/index.
3. **Exports and imports** — named + default export of the same component; no barrels; import `@/components/atoms/Button/Button`.
4. **Client vs server** — Server Components by default; add `"use client"` only when the component needs client features (handlers, state).
5. **Variants** — plain class maps / conditionals inside the component; no CVA; concatenate `className` simply.
6. **A11y** — native element semantics; visible focus ring required; loading uses `disabled` + `aria-disabled`.

Point to `Button` as the canonical example. Do not add a second example component. No separate do/don’t section.

## Implementation order

1. Create `src/components/atoms/Button/Button.tsx` with the API, class maps, loading indicator, and dual exports above.
2. Append the conventions section to `AGENTS.md`.
3. Typecheck (`npx tsc --noEmit` or project equivalent). Do not mount `Button` on a page.

## Out of scope

- Using `Button` on a page
- Other primitives, forms, icon library
- Storybook, Vitest, Playwright
- Implementing `molecules` / `organisms` / `templates` (or pages)
- Design-token / theming system
- Animation beyond simple hover
- Dark mode for `Button`
- New dependencies (`clsx`, `cva`, `tailwind-merge`, UI kits)
