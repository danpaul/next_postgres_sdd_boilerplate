# Implementation Plan: shadcn/ui

Source spec: [spec.md](./spec.md)

Install shadcn/ui (Radix, `neutral`), add eight primitives under `src/components/ui/` with `UI/{Name}` stories, replace the `Button`/`Input`/`Textarea` atoms and hand-rolled labels, table, badge, alerts, and panels with them, move page-level colors to shadcn's light tokens, and rewrite `AGENTS.md` / `README.md` around shadcn.

## Technical context

- Next 16.3, React 19.2, Tailwind 4 (`@tailwindcss/postcss`), Storybook 10 (`@storybook/nextjs-vite`), Vitest browser + Playwright
- `node_modules` is not installed in the working tree: run `npm install` before the shadcn CLI
- Path alias `@/*` → `./src/*` (`tsconfig.json`, `vitest.config.ts`)
- `src/app/globals.css` today: `--background`/`--foreground` in `:root`, `@theme inline` with Geist `--font-sans`/`--font-mono`, a `prefers-color-scheme: dark` block, and `body { font-family: Arial, ... }`
- `src/app/layout.tsx` and `.storybook/preview.tsx` set the Geist variables on `<html>`; leave both unchanged
- Atoms in use: `Button` (Header, SignInForm, SignUpForm), `Input` (SignInForm, SignUpForm). `Textarea` has no callers
- Inline errors today: `<p className="mb-4 text-red-600" role="alert">` in HomePage, AdminPage, ProfilePage, SignInPage, SignUpPage
- Hardcoded palette colors today: Header, Footer, PageTemplate, AdminPage, HomePage, ProfilePage, and the three atoms being deleted
- Generated shadcn files use their own conventions (kebab-case files, named exports only, no default export, `data-slot`, `cn`). Do not reshape them
- Tailwind 4's built-in `dark:` variant follows `prefers-color-scheme`. Generated ui files contain `dark:` classes, so `globals.css` must keep shadcn's `@custom-variant dark (&:is(.dark *));`. With no `.dark` class anywhere, those classes never apply. This line defines a variant and adds no dark styles

## Target structure

```
components.json                         # add (shadcn init)
src/lib/utils.ts                        # add (cn)
src/components/ui/
  button.tsx      button.stories.tsx
  input.tsx       input.stories.tsx
  textarea.tsx    textarea.stories.tsx
  label.tsx       label.stories.tsx
  table.tsx       table.stories.tsx
  badge.tsx       badge.stories.tsx
  alert.tsx       alert.stories.tsx
  card.tsx        card.stories.tsx
src/app/globals.css                     # change
src/components/organisms/Header/Header.tsx            # change
src/components/organisms/Footer/Footer.tsx            # change
src/components/templates/PageTemplate/PageTemplate.tsx # change
src/components/molecules/SignInForm/SignInForm.tsx     # change
src/components/molecules/SignUpForm/SignUpForm.tsx     # change
src/components/pages/{Home,Admin,Profile,SignIn,SignUp}Page/*Page.tsx # change
AGENTS.md, README.md                    # change
package.json, package-lock.json         # change (deps)

src/components/atoms/Button/            # delete (tsx, stories, test)
src/components/atoms/Input/             # delete
src/components/atoms/Textarea/          # delete
```

`src/components/atoms/` ends up empty. Do not keep an empty folder or a placeholder file. `atoms` stays documented in `AGENTS.md` only.

## Install

1. `npm install`
2. `npx shadcn@latest init --base-color neutral`. If the CLI asks, choose Radix (`radix-ui`), not Base UI, plus its default style and CSS variables `yes`.
3. Confirm `components.json` has:
   - `"rsc": true`, `"tsx": true`, `"iconLibrary": "lucide"`
   - `tailwind.css: "src/app/globals.css"`, `tailwind.baseColor: "neutral"`, `tailwind.cssVariables: true`, `tailwind.config: ""`
   - aliases `components: "@/components"`, `ui: "@/components/ui"`, `lib: "@/lib"`, `utils: "@/lib/utils"`, `hooks: "@/hooks"`
4. `npx shadcn@latest add button input textarea label table badge alert card`
5. Confirm `package.json` `dependencies` include `class-variance-authority`, `clsx`, `tailwind-merge`, `radix-ui`, `lucide-react`, `tw-animate-css` (install any the CLI missed). Add no other packages.
6. Keep the generated `ui/*.tsx` and `src/lib/utils.ts` exactly as generated. Do not add props or a default export. Keep extra generated variants or sizes too (e.g. `icon-sm`/`icon-lg`).

## globals.css

Start from what `init` writes, then:

- Keep `@import "tailwindcss";` and `@import "tw-animate-css";`
- Keep `@custom-variant dark (&:is(.dark *));` (see Technical context)
- Keep the full shadcn light `:root` block (`--radius`, `--background` … `--ring`, `--chart-*`, `--sidebar-*`) and the `@theme inline` mappings
- `@theme inline` must map `--font-sans: var(--font-geist-sans);` and `--font-mono: var(--font-geist-mono);`. Restore them if `init` replaced them
- Keep the shadcn `@layer base` block (`* { @apply border-border outline-ring/50; }`, `body { @apply bg-background text-foreground; }`)
- Delete the `.dark { … }` block
- Delete the old `@media (prefers-color-scheme: dark)` block, the old hex `--background`/`--foreground`, and the old `body { background; color; font-family: Arial… }` rule, so Geist Sans applies

Shape:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --color-background: var(--background);
  /* …rest as generated… */
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  /* …rest as generated (light only)… */
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
}
```

## ui stories

File: `src/components/ui/{name}.stories.tsx`. Import from `./{name}` (e.g. `import { Button } from "./button"`). Follow the existing story rules: CSF3, `satisfies Meta<typeof X>`, `tags: ["autodocs"]`, `layout: "centered"`, one `Default` with `play`, and `parameters.controls.include`.

| File | `title` | `component` | `controls.include` | Default / `play` |
| --- | --- | --- | --- | --- |
| `button` | `UI/Button` | `Button` | `variant`, `size`, `disabled`, `children`, `type` | args `children: "Button"`, `onClick: fn()`; click → `expect(args.onClick).toHaveBeenCalled()` |
| `input` | `UI/Input` | `Input` | `type`, `disabled`, `placeholder` | args `aria-label: "Title"`; type `"Buy peppers"` into textbox "Title" |
| `textarea` | `UI/Textarea` | `Textarea` | `disabled`, `placeholder` | args `aria-label: "Description"`; type into textbox "Description" |
| `label` | `UI/Label` | `Label` | `children` | `render` Label `htmlFor="label-story-input"` + `Input id="label-story-input"`; click the label text → expect the textbox to have focus |
| `badge` | `UI/Badge` | `Badge` | `variant`, `children` | args `children: "Badge"`; expect text visible |
| `alert` | `UI/Alert` | `Alert` | `variant` | `render` `<Alert {...args}><AlertTitle>Heads up</AlertTitle><AlertDescription>Something went wrong. Try again.</AlertDescription></Alert>`; expect `getByRole("alert")` to have that text |
| `card` | `UI/Card` | `Card` | `[]` | `render` Card > CardHeader (CardTitle "Card title", CardDescription) > CardContent > CardFooter with a `Button`; click the button |
| `table` | `UI/Table` | `Table` | `[]` | `render` Table with TableCaption, TableHeader (Email, Role), and TableBody with 2 rows; expect `getAllByRole("row")` length 3 |

- Use `fn`, `expect` from `storybook/test`
- Compound stories may import sibling ui files relatively (`./input`, `./button`)
- No `ui/*.test.tsx`

## Callers

### Button

- Import `{ Button } from "@/components/ui/button"`
- SignInForm / SignUpForm submit: `<Button type="submit" disabled={submitting}>`. Drop `variant="primary"` (the default is `default`). No `w-full`: the flex column already stretches it
- Header Sign out: `<Button variant="secondary" size="sm" disabled={signingOut} onClick={handleSignOut}>`
- No `loading` or `fullWidth` anywhere

### Input / Label (SignInForm, SignUpForm)

- `import { Input } from "@/components/ui/input"` and `import { Label } from "@/components/ui/label"`
- Replace each `<label className="text-sm font-medium" htmlFor="…">` with `<Label htmlFor="…">`. Keep ids, `type`, `autoComplete`, `value`, `onChange`
- Keep the `<form className="flex flex-col gap-3" noValidate>` layout

### Alert (HomePage, AdminPage, ProfilePage, SignInPage, SignUpPage)

```tsx
import { Alert, AlertDescription } from "@/components/ui/alert";

{errorMessage ? (
  <Alert variant="destructive" className="mb-4">
    <AlertDescription>{errorMessage}</AlertDescription>
  </Alert>
) : null}
```

- shadcn `Alert` already renders `role="alert"`. Do not pass it again
- Copy and logic stay the same: generic `Something went wrong. Try again.` on throw, and `result.error` on Sign in/up resolved errors
- No icon, no `AlertTitle`

### Card (SignInPage, SignUpPage, ProfilePage)

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

<div className="mx-auto w-full max-w-sm">
  <Card>
    <CardHeader>
      <CardTitle>
        <h2>Sign in</h2>
      </CardTitle>
    </CardHeader>
    <CardContent>
      {/* Alert (mb-4), then <SignInForm onSubmit={onSubmit} /> */}
    </CardContent>
  </Card>
</div>
```

- The `<h2>` inside `CardTitle` keeps the heading role (CardTitle is a `<div>`). The h2 gets no extra classes; CardTitle styles it
- SignUpPage: the same with "Sign up" and `SignUpForm`
- ProfilePage: keep the `max-w-2xl` wrapper. Card > CardHeader > CardTitle > `<h2>Profile</h2>`, then CardContent with the Alert followed by:

  ```tsx
  <div className="flex flex-col gap-2">
    <Label>Email</Label>
    <p className="text-sm text-muted-foreground">{currentUser.email}</p>
  </div>
  ```

- The molecules (`SignInForm`, `SignUpForm`) do not render a Card
- HomePage and AdminPage get no Card

### Table (AdminPage)

```tsx
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

<div className="rounded-md border bg-background">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead scope="col">Email</TableHead>
        <TableHead scope="col">Role</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {users.map((user) => (
        <TableRow key={user.id}>
          <TableCell>{user.email}</TableCell>
          <TableCell>{user.role}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

- Keep the order comment. Role stays plain text (not a Badge)
- Keep `<h2 className="mb-4 text-lg font-semibold">Users</h2>`

### Badge (Header)

```tsx
import { Badge } from "@/components/ui/badge";

<Badge asChild>
  <Link href="/admin">Admin</Link>
</Badge>
```

- `asChild` is part of the generated Badge API (not a new prop). The rendered element is still an `<a href="/admin">` named "Admin"

## Semantic tokens

Use `cn` from `@/lib/utils` for class merging in the files you touch, with caller `className` last. Replace the `[...].filter(Boolean).join(" ")` pattern in Header, Footer, and PageTemplate.

| File | From | To |
| --- | --- | --- |
| PageTemplate root | `bg-zinc-50` | `bg-muted` → `cn("flex min-h-screen flex-col bg-muted", className)` |
| Header root | `border-zinc-200 bg-white` | `border-border bg-background` |
| Header h1 | `text-black` | `text-foreground` |
| Header Profile / Sign in / Sign up links | `text-black hover:underline` | `text-foreground hover:underline` |
| Footer root | `border-zinc-200 bg-white` | `border-border bg-background` |
| Footer `<p>` | `text-zinc-600` | `text-muted-foreground` |
| Footer links | `text-black … hover:text-zinc-600 … focus-visible:outline-black` | `text-foreground … hover:text-muted-foreground … focus-visible:outline-ring` |
| HomePage `<p>` | `text-zinc-700` | `text-muted-foreground` |
| ProfilePage email `<p>` | `text-zinc-700` | `text-muted-foreground` |
| AdminPage table | zinc/white classes | removed (Table styles) plus the wrapper above |
| All pages' alerts | `text-red-600` | removed (Alert) |

No `zinc-*`, `red-*`, `black`, or `white` color classes stay anywhere in `src/components` outside `ui/`. No `dark:` classes in repo-authored components.

## Stories and tests outside ui/

- Delete `atoms/{Button,Input,Textarea}/*` (component, story, test)
- The existing stories and tests for Header, Footer, PageTemplate, the molecules, and the pages should pass unchanged: roles, names, `href`s, `role="alert"` text, and row counts are preserved. If a query breaks, fix the query and keep what it asserts. Do not drop the assertion
- Do not add new tests to non-ui components unless one is needed to keep a covered behavior covered

## AGENTS.md

Edit in place. Leave the "This is NOT the Next.js you know" block unchanged.

- Stack line: add shadcn/ui (Radix, `neutral`, `components.json`)
- Packages line: `Do not add npm packages (Testing Library, extra Storybook addons, etc.) unless a spec says so.` Remove CVA/clsx/tailwind-merge/`cn` from it
- Barrel example: `@/components/ui/button`, `@/components/molecules/SignInForm/SignInForm`, `@/actions/user/listUsers/listUsers`
- Components:
  - Canonical example → `src/components/molecules/SignInForm/SignInForm.tsx`
  - New subsection **shadcn primitives (`src/components/ui/`)**:
    - Holds shadcn-generated primitives. Add them with `npx shadcn@latest add <name>` (config in `components.json`, `cn` in `src/lib/utils.ts`)
    - File names, exports, and code follow shadcn (kebab-case `ui/button.tsx`, named exports, no default export). The per-folder, dual-export, and `{Name}Props` rules do not apply
    - Use them as generated. Do not hand-edit them to add props
    - Before writing a new component, use a `ui/` primitive if one fits. If shadcn has the component but it isn't installed, add it with the CLI
    - `atoms/` is for repo-authored primitives that shadcn doesn't provide
  - Folders: note that `ui/` is the exception to one-folder-per-component
  - Exports example: `SignInFormProps`. Import example: `import { SignInForm } from "./SignInForm"`
  - **Variants** (replace the section): use CVA (`class-variance-authority`) for variants. Merge classes with `cn` from `@/lib/utils`, with the caller's `className` last: `cn(baseClasses, className)`
  - New **Styling** rule: use semantic token classes (`bg-background`, `text-foreground`, `bg-muted`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-destructive`, …), not palette colors (`zinc-*`, `black`, `white`, `red-*`). Light mode only: no `dark:` classes in repo-authored components. Keep `@custom-variant dark` in `globals.css`, and add no `.dark` block
  - Accessibility: "Pending uses native `disabled`." Remove the `loading` / `aria-disabled` wording
- Stories:
  - Canonical example → `src/components/molecules/SignInForm/SignInForm.stories.tsx`
  - File rule: ui stories are colocated as `src/components/ui/{name}.stories.tsx`
  - Sidebar layers: `UI`, `Atoms`, `Molecules`, `Organisms`, `Templates`, `Pages`. ui titles are `UI/{Name}` in PascalCase (`UI/Button`)
  - Layout: `UI`, atoms, molecules, and organisms use `centered`
  - Replace the Button include line with: `ui/button` include list `variant`, `size`, `disabled`, `children`, `type`. SignInForm uses `[]` (its only prop is the injected `onSubmit` callback)
- Component tests:
  - Canonical examples → `SignInForm.test.tsx` and `SignInForm.stories.tsx`
  - `src/components/ui/` gets no unit tests. Higher-layer tests cover the primitives. The "required for every shared component" rule applies outside `ui/`
- Errors and pending:
  - The inline alert uses `<Alert variant="destructive"><AlertDescription>…</AlertDescription></Alert>` from `@/components/ui/alert`, which provides `role="alert"`
  - Remove "Do not use Button `loading`" (the prop no longer exists). Keep "disable with native `disabled`"

## README.md

- Stack: add `- [shadcn/ui](https://ui.shadcn.com/) — Radix-based primitives copied into the repo; \`src/components/ui/\`, \`components.json\``. Tailwind line: mention the theme tokens in `globals.css`
- File structure: under `src/`, add `components/ui/  # shadcn primitives (generated)` and `lib/utils.ts  # cn helper`. Update the `components/` comment to `ui, atoms, molecules, organisms, templates, pages`
- New section `## Adding a shadcn component` (after Scripts or File structure):
  1. `npx shadcn@latest add <name>` (writes `src/components/ui/<name>.tsx` and installs its deps)
  2. Add `src/components/ui/<name>.stories.tsx` titled `UI/<Name>`, following the story rules in `AGENTS.md`. No unit test
  3. Import from `@/components/ui/<name>`. See `AGENTS.md` for conventions

## Implementation order

1. `npm install`, `shadcn init` (neutral, Radix), and verify `components.json` and `src/lib/utils.ts`
2. `shadcn add` the eight components and verify the deps in `package.json`
3. Clean up `globals.css` (light only, Geist, `@custom-variant dark` kept)
4. Write the eight `ui/*.stories.tsx`
5. Migrate SignInForm and SignUpForm (Button, Input, Label)
6. Migrate Header (Button, Badge, tokens, `cn`), Footer (tokens, `cn`), and PageTemplate (`bg-muted`, `cn`)
7. Migrate the pages: Alert in all five, Card in SignIn/SignUp/Profile, Label in Profile, Table in Admin, tokens
8. Delete `atoms/Button`, `atoms/Input`, `atoms/Textarea`, and grep that nothing imports `@/components/atoms/`
9. Update `AGENTS.md`, then `README.md`
10. Verify: run the grep checks, `npm run lint`, `npm run build`, `npm test`, and the dark-OS check

## Verify

- `rg -n "components/atoms" src` → no results
- `rg -n "(zinc|red)-[0-9]|\b(bg|text|border|outline|ring|fill|stroke|divide|placeholder)-(black|white)\b" src/components --glob '!src/components/ui/**'` → no results
- `rg -n "dark|prefers-color-scheme" src/app/globals.css` → only the `@custom-variant dark` line
- `rg -n "loading|fullWidth" src/components` → nothing Button-related
- `npm run lint`, `npm run build`, `npm test` pass. If browser tests fail with Vite "optimized dependencies changed" reloads, add `radix-ui`, `lucide-react`, `class-variance-authority`, `clsx`, and `tailwind-merge` to `optimizeDeps.include` in `vitest.config.ts`
- Run `npm run dev` with the OS (or DevTools "prefers-color-scheme: dark" emulation) in dark mode: the pages and Storybook render light

## Out of scope

- Dark mode: no `.dark` block, theme toggle, `next-themes`, or `dark:` classes in repo-authored code
- Theme customization: brand colors, presets, and docs for them
- shadcn components beyond the eight listed (no `form`, `sonner`, etc.), new pages, or backend changes
- Modifying generated `ui/` files or adding props to them
- Unit tests for `ui/`
- Restyling beyond the token swap and the listed component replacements (no new layout or copy)
- Using Badge for the AdminPage role column, or `Button asChild` for header links
- Changing `layout.tsx`, `.storybook/preview.tsx`, or Storybook addons
