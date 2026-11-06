# Agent conventions

This repo is a Next.js App Router boilerplate used as a starting point for new applications.

Stack that differs from older training data: Next 16, React 19, Prisma 7 (hosted Prisma Postgres; generated client in `src/generated/prisma`), Tailwind 4, Storybook 10, Vitest browser + Playwright.

Specs live under `specs/`. Implement the spec, then encode only **durable** conventions here. Leave the Next.js block at the bottom unchanged.

Do not add npm packages (CVA, clsx, Testing Library, extra Storybook addons, etc.) unless a spec says so.

No barrel files anywhere (no `index.ts` re-exports at any level). Import the file itself: `@/components/atoms/Button/Button`, `@/actions/user/listUsers/listUsers`.

# Components

Canonical example: `src/components/atoms/Button/Button.tsx`.

## Folders and files

- Shared UI lives under `src/components/{atoms,molecules,organisms,templates,pages}`.
- One folder per component, named after the component. The main file matches the folder: `ComponentName/ComponentName.tsx`.
- Colocate `ComponentName.tsx`, `ComponentName.stories.tsx`, and `ComponentName.test.tsx` in that folder. No `index.ts`, no CSS modules, no extra type files.

## Exports and imports

- Each component has both a named export and a default export of the same component.
- Export the props type as `{ComponentName}Props` from the component file (e.g. `ButtonProps`).
- Story and test files import the component by name from `./ComponentName` (e.g. `import { Button } from "./Button"`). Do not use `@/` in story or test files.

## Props and refs

- No `forwardRef`. A component that wraps one native element types its props as `ComponentProps<"el">` (which includes `ref`) plus its own props, and passes `ref` to the element as a regular prop.

## Client vs server

Server Components by default. Add `"use client"` only when the component needs client features (handlers, state, browser APIs). Presentational components without those stay as Server Components.

## Variants

Plain class maps / conditionals inside the component. Do not add CVA, clsx, tailwind-merge, or `cn`. Concatenate caller `className` last with simple string joining.

## Accessibility

Rely on native element semantics and keyboard behavior. Loading uses native `disabled` plus `aria-disabled`.

## Prisma in UI

Row types come from `@/generated/prisma/browser`. Do not import `@/prisma/prismaClient` or the generated server client in UI. Do not edit `src/generated/prisma`.

# Stories

Canonical example: `src/components/atoms/Button/Button.stories.tsx`.

## File and format

- Colocate stories as `src/components/{layer}/{ComponentName}/{ComponentName}.stories.tsx`. Required for every shared component under `src/components`.
- Always `.tsx`, even when the file is args-only.
- CSF3: `Meta` / `StoryObj` from `@storybook/nextjs-vite`; default-export `meta`.

## Sidebar

- Set an explicit `title`: `{Layer}/{ComponentName}`.
- Layer is PascalCase: `Atoms`, `Molecules`, `Organisms`, `Templates`, `Pages` (e.g. `Atoms/Button`, `Templates/PageTemplate`, `Pages/HomePage`).

## Content

- One named story export: `Default`. Coverage via controls and Autodocs, not extra named stories for variants, sizes, or states.
- Every `Default` story includes a `play` function that exercises a basic interaction.
- `fn()` spies and Storybook test utilities (`expect`, `userEvent`, etc.) are allowed.

## Autodocs and controls

- Every story file sets `tags: ["autodocs"]` on `meta`.
- Atoms, molecules, and organisms use `layout: "centered"` unless a spec says otherwise. Templates and pages use `layout: "fullscreen"`.
- Every story file, pages included, curates the Controls and Autodocs table with `parameters.controls.include`. This does not change the component API or what app code can pass; it only hides Storybook UI noise.
- Show the component's own props, plus native HTML props that are part of its documented usage. Hide every other native HTML prop (`className`, event handlers, and the rest of `ComponentProps<"button">` etc.).
- Button include list: `variant`, `size`, `loading`, `fullWidth`, `disabled`, `children`, `type`.
- Pages list their own data props (e.g. `currentUser`, `users`), never injected action props, and use `[]` when they have none.

# Component tests

Canonical examples: `src/components/atoms/Button/Button.test.tsx` and `src/components/atoms/Button/Button.stories.tsx`.

- Colocate as `src/components/{layer}/{ComponentName}/{ComponentName}.test.tsx`. Required for every shared component under `src/components`.
- Vitest **browser** (Playwright Chromium, headless) + `vitest-browser-react`. `render` from `vitest-browser-react`, then query with Vitest locators (`getByRole`). No Testing Library, no jsdom.
- Scripts: `test` (Vitest run, projects: `storybook`, `components`, `actions`); `test:actions` runs only `actions`.
- `@storybook/addon-vitest` runs stories, including `play`, from the Storybook test UI.

# Server Actions

Canonical examples: `src/actions/user/listUsers/listUsers.ts` and `src/actions/auth/helpers.ts`.

- Live under `src/actions/{resource}/{actionName}/{actionName}.ts`. One folder per action, named after the exported function. The action file matches the folder.
- Each action file starts with `"use server"`. One async named export only. No default export.
- Thin Prisma: call `@/prisma/prismaClient` directly. Do not add a service or repository layer.
- Shared helpers live in `src/actions/{resource}/helpers.ts`. That file is not a Server Action (no `"use server"`). Trim and normalize there; throw before write if required fields are empty.
- Do not add Route Handlers for this app's backend.
- Every new Server Action requires a colocated `{actionName}.test.ts`, and every shared helpers file a colocated `helpers.test.ts`. Cover the success path and each expected failure path. See Backend tests.

# Backend tests

Canonical example: `src/actions/auth/signUp/signUp.test.ts`.

- Colocate as `src/actions/{resource}/{actionName}/{actionName}.test.ts`; shared helpers as `src/actions/{resource}/helpers.test.ts`.
- Node-environment Vitest project `actions`, include `src/actions/**/*.test.ts`. Test files run serially (shared database).
- Runs against a real test database from `TEST_DATABASE_URL`. The project sets `DATABASE_URL` to it and `ADMIN_EMAIL` to `admin@test.local`. Prisma is not mocked. Unset or empty → `actions` is skipped with a warning. Equal to `DATABASE_URL` → `vitest.config.ts` throws and nothing runs.
- `src/actions/testGlobalSetup.ts` runs `prisma migrate deploy` against the test database once per run.
- `src/actions/testSetup.ts` mocks `next/headers` `cookies()` (in-memory store) and `next/navigation` `redirect` (throws `NEXT_REDIRECT:{url}`), and truncates `User`/`Session` and clears cookies before each test. Tests import only `setTestCookie` / `getTestCookie` from it and never `vi.mock` Next modules. Assert redirects with `rejects.toThrow("NEXT_REDIRECT:/admin")`.
- Seed with Prisma plus helpers (`hashPassword`, `hashToken`), not by calling other actions. Use explicit `createdAt` / `expiresAt` when ordering or expiry matters; no fake timers.
- Import the subject relatively (`./signUp`, `./helpers`); everything else via `@/`. Import `describe` / `it` / `expect` from `vitest`.

# App wiring

Canonical examples: `src/app/admin/page.tsx` and `src/components/pages/AdminPage/AdminPage.tsx`.

## Routes and injection

- App routes are async Server Components. They load data with actions and pass mutation actions to the page component as props.
- The client page component calls those props. It does not import `@/actions/...` or Prisma.
- Molecules and organisms stay presentational: they receive callbacks, never call actions or Prisma.
- Every route that calls `getCurrentUser()` exports `dynamic = "force-dynamic"`.
- Do not add `revalidatePath`, `router.refresh`, or optimistic/fake rows.

## Client state after mutations

- Apply the returned row locally (add a created row, replace an updated one, remove a deleted one). Do not refetch the list after mutations.
- Coerce serialized `Date` fields to `Date` on initial data and every action result before putting them in state.

## Errors and pending

- On mutation failure: do not change list state. Set an inline `role="alert"` with generic copy (`Something went wrong. Try again.`). Do not show `error.message`. Rethrow so children can keep local UI.
- Clear the alert on the next successful mutation.
- Molecules await the callback and only reset local UI on success (clear form, exit edit).
- While the callback is pending, disable the control that fired it with native `disabled`. Do not use Button `loading`. Cancel stays enabled.

## Tests

- Component tests/stories mock action props on the page component only (`fn()` / `vi.fn()`). Lower layers use sync spies; do not add persistence mocks there.

# Auth

Canonical examples: `src/actions/auth/signUp/signUp.ts` and `src/components/pages/SignUpPage/SignUpPage.tsx`.

- No auth packages.
- Role is set only in `signUp`: `admin` when the normalized email equals the normalized `ADMIN_EMAIL`, otherwise `user`. Unset or empty `ADMIN_EMAIL` means no admin. `signIn` never changes roles.
- `getCurrentUser()` returns `{ email, role } | null`; a missing or expired session is `null`. It is read-only (runs during render).
- Never send password hashes, tokens, or session rows to the client.
- UI props type `currentUser` inline as `{ email: string; role: Role } | null`, with `Role` from `@/generated/prisma/browser`. No shared type export.
- Error contract: actions that redirect on success (e.g. `signUp`, `signIn`) return `{ error: string }` for expected failures (validation, duplicate email, bad credentials) and `redirect` on success. Unexpected errors still throw.
- Call `redirect` outside any `try`.
- Client callers of redirecting actions call `unstable_rethrow(error)` (from `next/navigation`) first in `catch`, then show generic copy. Never show `error.message`.
- Protect routes server-side in the route's `page.tsx`: call `getCurrentUser()`, then `redirect` before rendering (outside any `try`). No middleware, no `?next=` return URLs.
- Admin-only actions call `getCurrentUser()` and throw unless `role === "admin"`. They `select` only the fields the UI needs.

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
