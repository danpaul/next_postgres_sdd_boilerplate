## Goal

Install [shadcn/ui](https://ui.shadcn.com/), replace hand-rolled UI that has a shadcn equivalent, apply shadcn's default theme tokens at the page level, and update `README.md` and `AGENTS.md` to make shadcn the standard way to build UI in this repo.

## Requirements

### Install

- Initialize shadcn with its CLI using the default `neutral` base color. Commit the generated `components.json`.
- Generated primitives live in `src/components/ui/` under shadcn's file names (kebab-case, e.g. `ui/button.tsx`). The `cn` helper lives in `src/lib/utils.ts`.
- Add the packages shadcn requires: `class-variance-authority`, `clsx`, `tailwind-merge`, `radix-ui`, `lucide-react`, `tw-animate-css`.

### Components to add and replace

- Add these shadcn components: `button`, `input`, `textarea`, `label`, `table`, `badge`, `alert`, `card`. Use them as generated; do not add props.
- Delete `src/components/atoms/Button`, `atoms/Input`, and `atoms/Textarea` (component, story, test). Callers import from `@/components/ui/...` instead.
- Button uses shadcn's API (variants `default`, `secondary`, `outline`, `ghost`, `destructive`, `link`; sizes `default`, `sm`, `lg`, `icon`). The `loading` and `fullWidth` props are dropped: callers use `disabled` and `className="w-full"`. Update every caller, story, and test.
- Form field labels in `SignInForm`, `SignUpForm`, and `ProfilePage` use `Label`.
- The `AdminPage` users table uses `Table`.
- The Header "Admin" link uses `Badge`, and must still be a link to `/admin`.
- Inline error messages use `Alert`. They keep `role="alert"` and the existing generic copy.
- Auth and profile form panels are wrapped in `Card`.
- Molecules, organisms, templates, and pages keep the atomic folder layout and the existing component conventions.

### Stories and tests for `ui/`

- Each `src/components/ui/` component gets a colocated story (`ui/button.stories.tsx`) titled `UI/{Name}` (e.g. `UI/Button`). It follows the existing story rules: a `Default` story with `play`, `tags: ["autodocs"]`, `layout: "centered"`, and `parameters.controls.include`.
- `ui/` components get no unit tests. Higher-layer tests cover them.

### Styling

- `globals.css` uses shadcn's default light `:root` tokens through `@theme inline`. Keep the Geist font variables.
- Light mode only: remove the existing `prefers-color-scheme` dark block, and do not keep shadcn's `.dark` block.
- `PageTemplate`, `Header`, `Footer`, and the page components replace hardcoded zinc/black/white/red color classes with semantic token classes (`bg-background`, `text-foreground`, `bg-muted`, `text-muted-foreground`, `border-border`, etc.).

### Conventions (AGENTS.md)

- `cn` and CVA are allowed repo-wide. Replace the Variants section: variants use CVA, and class merging uses `cn` from `@/lib/utils` with the caller's `className` last.
- Remove CVA, clsx, tailwind-merge, and `cn` from the banned-packages line.
- Document that `src/components/ui/` holds shadcn-generated primitives, added with `npx shadcn@latest add <name>`, and that their file names and exports follow shadcn, not the per-folder rules. Story and test rules for `ui/` are as above, and `UI` is added to the story sidebar layers.
- Use shadcn primitives from `ui/` before writing a new component. `atoms` stays documented as the layer for repo-authored primitives shadcn doesn't provide.
- `src/components/molecules/SignInForm` replaces `atoms/Button` as the canonical component, story, and test example. Update every reference, including the Button `controls.include` example.
- Use semantic color tokens instead of hardcoded palette colors.

### README

- Add shadcn/ui to the stack list and `src/components/ui/` and `src/lib/` to the folder map. Add a short section on adding a shadcn component.

## Acceptance Criteria

- `components.json` exists, `src/components/ui/` contains the eight listed components, each with a `UI/{Name}` story, and `src/lib/utils.ts` exports `cn`.
- `src/components/atoms/Button`, `atoms/Input`, and `atoms/Textarea` no longer exist, and nothing imports them.
- Header, forms, AdminPage, and ProfilePage render shadcn `Button`, `Input`, `Textarea`, `Label`, `Table`, `Badge`, `Alert`, and `Card` where listed above.
- Error messages still render with `role="alert"` and the generic copy. The Admin badge still links to `/admin`.
- Page-level views (`PageTemplate` and the pages) use shadcn theme tokens, with no hardcoded zinc/black/white/red color classes left in `src/components` outside `ui/`.
- `globals.css` has no dark-mode styles. The app renders light in a dark-mode OS.
- `AGENTS.md` and `README.md` describe the shadcn setup, `src/components/ui/`, `cn`/CVA usage, how to add a component, and SignInForm as the canonical example.
- `npm run lint`, `npm run build`, and `npm test` pass.

## Out of Scope

- Adding pages, components beyond those listed, or backend functionality.
- Dark mode, including a theme toggle or `next-themes`.
- A theme customization option or its documentation (custom brand colors, theme presets).
