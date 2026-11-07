# Tasks: shadcn/ui

Source: [plan.md](./plan.md) · [spec.md](./spec.md)

Light mode only. Do not add packages beyond the six shadcn requires. Do not edit generated `src/components/ui/*.tsx` or `src/lib/utils.ts`, and do not add props to them. No unit tests for `ui/`.

## 1. Install

- [x] `npm install`.
- [x] `npx shadcn@latest init --base-color neutral`. Choose Radix (not Base UI), the default style, and CSS variables.
- [x] Confirm `components.json`: `rsc: true`, `tsx: true`, `iconLibrary: "lucide"`, `tailwind.css: "src/app/globals.css"`, `baseColor: "neutral"`, `cssVariables: true`, and aliases `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`.
- [x] Confirm `src/lib/utils.ts` exports `cn`.
- [x] `npx shadcn@latest add button input textarea label table badge alert card`.
- [x] Confirm `package.json` has `class-variance-authority`, `clsx`, `tailwind-merge`, `radix-ui`, `lucide-react`, and `tw-animate-css`, and no other new packages.
- [ ] Commit `components.json`.

## 2. globals.css

- [x] Keep `@import "tailwindcss"`, `@import "tw-animate-css"`, the shadcn light `:root` tokens, the `@theme inline` mappings, and the `@layer base` block.
- [x] Keep `@custom-variant dark (&:is(.dark *));`. Without it, the generated `dark:` classes would follow the OS setting.
- [x] `@theme inline` maps `--font-sans: var(--font-geist-sans)` and `--font-mono: var(--font-geist-mono)`.
- [x] Delete the `.dark { … }` block, the old `prefers-color-scheme: dark` block, the old hex `--background`/`--foreground`, and the old `body` rule (including Arial).

## 3. ui stories

- [x] Add `src/components/ui/{button,input,textarea,label,table,badge,alert,card}.stories.tsx`, importing from `./{name}`.
- [x] Each one: `title: "UI/{Name}"`, `tags: ["autodocs"]`, `layout: "centered"`, a single `Default` story with `play`, and `parameters.controls.include` as listed in the plan table.
- [x] Button: include `variant`, `size`, `disabled`, `children`, `type`. The play clicks and asserts `onClick` (`fn()`).
- [x] Input and Textarea: the play types into the `aria-label`-named textbox.
- [x] Label: render Label + Input linked by `htmlFor`/`id`. Clicking the label focuses the input.
- [x] Badge: include `variant`, `children`. Expect the text visible.
- [x] Alert: include `variant`. Render AlertTitle and AlertDescription. Expect `role="alert"` with the text.
- [x] Card: include `[]`. Render Header/Title/Description/Content/Footer with a Button, and click it.
- [x] Table: include `[]`. Render a header row and 2 body rows. Expect 3 rows.
- [x] Do not add `ui/*.test.tsx`.

## 4. Molecules

- [x] SignInForm and SignUpForm: import `Button`, `Input`, and `Label` from `@/components/ui/...`.
- [x] Replace each `<label>` with `<Label htmlFor>`. Keep ids, `type`, `autoComplete`, and handlers.
- [x] Submit: `<Button type="submit" disabled={submitting}>`. No `variant="primary"`, `loading`, or `fullWidth`.
- [x] Do not wrap the molecules in a Card.

## 5. Organisms and template

- [x] Header: Sign out uses `<Button variant="secondary" size="sm" disabled={signingOut}>` from `ui/button`.
- [x] Header: Admin uses `<Badge asChild><Link href="/admin">Admin</Link></Badge>`, which still renders a link to `/admin`.
- [x] Header: switch to tokens (`border-border bg-background`, `text-foreground` for the h1 and links) and use `cn(..., className)`.
- [x] Footer: switch to tokens (`border-border bg-background`, `text-muted-foreground`, links `text-foreground hover:text-muted-foreground focus-visible:outline-ring`) and use `cn(..., className)`.
- [x] PageTemplate: `cn("flex min-h-screen flex-col bg-muted", className)`.

## 6. Pages

- [x] Home, Admin, Profile, SignIn, SignUp: replace the `<p role="alert">` with `<Alert variant="destructive" className="mb-4"><AlertDescription>{errorMessage}</AlertDescription></Alert>`. No icon, no title, no extra `role` prop, and the same copy and logic.
- [x] SignInPage and SignUpPage: `max-w-sm` wrapper > `Card` > `CardHeader` > `CardTitle` > `<h2>`. Then `CardContent` with the Alert and the form.
- [x] ProfilePage: `max-w-2xl` wrapper > `Card` > `CardHeader` > `CardTitle` > `<h2>Profile</h2>`. Then `CardContent` with the Alert and `<Label>Email</Label>` + `<p className="text-sm text-muted-foreground">{email}</p>`.
- [x] AdminPage: `Table`/`TableHeader`/`TableRow`/`TableHead scope="col"`/`TableBody`/`TableCell` inside `<div className="rounded-md border bg-background">`. Role stays plain text.
- [x] HomePage: `text-zinc-700` → `text-muted-foreground`. No Card on Home or Admin.

## 7. Delete atoms

- [x] Delete `src/components/atoms/Button`, `atoms/Input`, and `atoms/Textarea` (component, story, test). Leave no empty `atoms/` folder.
- [x] `rg -n "components/atoms" src` returns nothing.

## 8. AGENTS.md

- [x] Stack line: add shadcn/ui. Packages line: remove CVA, clsx, tailwind-merge, and `cn` from the banned list.
- [x] Canonical component/story/test examples → `src/components/molecules/SignInForm/SignInForm.{tsx,stories.tsx,test.tsx}`. Update the import/export examples (`SignInFormProps`, `./SignInForm`, `@/components/ui/button`).
- [x] Add a `src/components/ui/` subsection: shadcn-generated, added with `npx shadcn@latest add <name>`, file names and exports follow shadcn (exempt from the per-folder/dual-export/`Props` rules), used as generated, preferred before writing new components. `atoms` is for repo-authored primitives shadcn doesn't provide.
- [x] Replace Variants: CVA for variants, `cn` from `@/lib/utils` with caller `className` last.
- [x] Add a Styling rule: semantic tokens, no palette colors, light only (no `dark:` in repo code, no `.dark` block, keep `@custom-variant dark`).
- [x] Stories: add `UI` to the sidebar layers, the `ui/{name}.stories.tsx` location, `UI/{Name}` titles, and `centered` layout. Replace the Button include list with the `ui/button` list (`variant`, `size`, `disabled`, `children`, `type`) and note that SignInForm uses `[]`.
- [x] Component tests: `ui/` gets no unit tests.
- [x] Errors: the inline alert uses `Alert variant="destructive"` + `AlertDescription`. Remove the Button `loading` references (Accessibility and Errors and pending).
- [x] Leave the "This is NOT the Next.js you know" block unchanged.

## 9. README.md

- [x] Stack: add shadcn/ui (`src/components/ui/`, `components.json`).
- [x] File structure: add `src/components/ui/` and `src/lib/utils.ts`, and update the `components/` comment.
- [x] Add a short "Adding a shadcn component" section: `npx shadcn@latest add <name>`, a `UI/<Name>` story, no unit test, import from `@/components/ui/<name>`.

## 10. Verify

- [x] `rg -n "(zinc|red)-[0-9]|\b(bg|text|border|outline|ring|fill|stroke|divide|placeholder)-(black|white)\b" src/components --glob '!src/components/ui/**'` returns nothing.
- [x] `globals.css` has no dark styles (only the `@custom-variant dark` line matches `dark`).
- [x] No `loading`/`fullWidth` Button usage remains.
- [x] Existing Header/Footer/PageTemplate/molecule/page stories and tests pass. Fix queries only if needed, without dropping assertions.
- [x] `npm run lint` passes.
- [x] `npm run build` passes.
- [x] `npm test` passes. If Vite dep-optimization reloads cause failures, add the shadcn deps to `optimizeDeps.include` in `vitest.config.ts`.
- [x] In a dark-mode OS (or with emulation), the app and Storybook render light.
