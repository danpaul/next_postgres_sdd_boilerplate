# Tasks: Component Structure

Source: [plan.md](./plan.md) · [spec.md](./spec.md)

Do not use `Button` on a page. Do not add `clsx`, `cva`, `cn`, shadcn, Radix, or other UI-kit dependencies.

## 1. Button atom

- [x] Create `src/components/atoms/Button/Button.tsx` only (no `types.ts`, styles, tests, stories, or `index.ts`).
- [x] Do not create empty `molecules` / `organisms` / `templates` directories.
- [x] Export `ButtonProps` from the same file: native `<button>` props plus `variant`, `size`, `loading`, `fullWidth`.
- [x] If React 19 `ref` on `ComponentProps<"button">` conflicts with `forwardRef`, omit `ref` from the native props intersection.
- [x] Implement with `forwardRef` wrapping a native `<button>` only (not polymorphic, no `asChild` / `as`).
- [x] No `"use client"`. No icon API. Props only (no compound components).
- [x] Defaults: `type="button"`, `variant="primary"`, `size="md"`.
- [x] Use plain class maps and string concatenation; append caller `className` last.
- [x] Variants: `primary` (`bg-black text-white hover:bg-zinc-800`), `secondary` (`border border-zinc-200 bg-zinc-100 text-black hover:bg-zinc-200`).
- [x] Sizes: `sm` / `md` / `lg` as specified in the plan.
- [x] Shared classes: `inline-flex items-center justify-center font-medium`; visible focus ring; `disabled:opacity-50 disabled:cursor-not-allowed`; `fullWidth` → `w-full`.
- [x] Light mode only: no `dark:` classes; no extra hover animation/transitions.
- [x] Loading: `disabled={disabled || loading}`, `aria-disabled={true}` when loading, CSS dots/pulse (`animate-pulse` spans, not SVG), keep `children` in the tree but hide them visually.
- [x] Dual export: named `{ Button }` and `export default Button`.

## 2. Document conventions

- [x] Append conventions in `AGENTS.md` below `<!-- END:nextjs-agent-rules -->`. Do not remove or rewrite that block.
- [x] Document atomic folder map (`atoms` / `molecules` / `organisms` / `templates`); only atoms exist today.
- [x] Document per-component file checklist: `ComponentName/ComponentName.tsx` only; no colocated types/styles/tests/stories/index.
- [x] Document exports and imports: named + default of the same component; no barrels; import `@/components/atoms/Button/Button`.
- [x] Document client vs server: Server Components by default; `"use client"` only when needed.
- [x] Document variants: plain class maps / conditionals; no CVA; concatenate `className` simply.
- [x] Document a11y: native semantics; visible focus ring; loading uses `disabled` + `aria-disabled`.
- [x] Point to `Button` as the canonical example. No second example component. No separate do/don’t section.

## 3. Verify

- [x] Typecheck (`npx tsc --noEmit` or project equivalent).
- [x] Confirm `Button` is not mounted on any page.
