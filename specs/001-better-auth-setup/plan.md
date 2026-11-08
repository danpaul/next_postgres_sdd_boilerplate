# Implementation Plan: Better Auth Setup

Source spec: [spec.md](./spec.md)

Replace the hand-rolled auth (Server Actions, scrypt helpers, `User`/`Session` schema, `ADMIN_EMAIL`) with Better Auth: a Prisma-backed server instance, a single catch-all Route Handler, a client used by page components, the admin plugin for roles, and a `make-admin` script.

## Technical context

- Next 16.3, React 19.2, Prisma 7 (`prisma-client` generator → `src/generated/prisma`, `PrismaPg` adapter in `src/prisma/prismaClient.ts`), Vitest projects `storybook` / `components` / `actions`.
- `better-auth@^1.7.18` is already in `package.json` (uncommitted). Exports used: `better-auth`, `better-auth/adapters/prisma`, `better-auth/plugins` (`admin`), `better-auth/next-js` (`nextCookies`, `toNextJsHandler`), `better-auth/react` (`createAuthClient`), `better-auth/client/plugins` (`adminClient`).
- `nextCookies()` loads `"next/headers.js"` (with the `.js`), not `"next/headers"`. The test mocks must cover both specifiers.
- Better Auth error codes (`error.code` on the client, `APIError.body.code` on the server): `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL`, `USER_ALREADY_EXISTS`, `INVALID_EMAIL_OR_PASSWORD`, `PASSWORD_TOO_SHORT`, `INVALID_EMAIL`.
- The spec's "LoginPage" is `src/components/pages/SignInPage/SignInPage.tsx` (route `/login`).
- The sign-out callers are `HomePage`, `AdminPage`, and `ProfilePage`. Each passes `onSignOut` to `PageTemplate`, which passes it to `Header`.
- `tsconfig.json` has `allowJs: true`, so tests can import a `.mjs` module.
- Node 26. No `tsx`. The `make-admin` script is plain `.mjs` and uses `pg` (already a dependency).
- Storybook `@storybook/nextjs-vite` mocks `next/navigation` when a story sets `parameters.nextjs.appDirectory: true`.

## Target structure

```
prisma/
  schema.prisma                                 # change: Better Auth models (CLI-generated)
  migrations/<ts>_better_auth/migration.sql     # add: drop old User/Session/Role, create new tables
scripts/
  make-admin.mjs                                # add: exported makeAdmin() + CLI entry
  make-admin.test.ts                            # add
src/
  lib/auth.ts                                   # add: server instance
  lib/auth.test.ts                              # add: auth.api.* tests
  lib/auth-client.ts                            # add: authClient, homePathForRole, authErrorMessage
  app/api/auth/[...all]/route.ts                # add: the only Route Handler
  test/testSetup.ts                             # move from src/actions/testSetup.ts and change
  test/testGlobalSetup.ts                       # move from src/actions/testGlobalSetup.ts
  actions/auth/getCurrentUser/getCurrentUser.ts       # change
  actions/auth/getCurrentUser/getCurrentUser.test.ts  # rewrite
  actions/user/listUsers/listUsers.ts                 # change
  actions/user/listUsers/listUsers.test.ts            # rewrite
  app/{page,admin/page,login/page,profile/page,signup/page}.tsx   # change: no injected auth actions
  components/molecules/SignUpForm/*                   # change: Name field
  components/pages/{SignUpPage,SignInPage,HomePage,AdminPage,ProfilePage}/*  # change
  components/templates/PageTemplate/PageTemplate.tsx  # change: currentUser type
  components/organisms/Header/*                       # change: currentUser type + fixtures
vitest.config.ts, package.json, .env.example, README.md, AGENTS.md   # change
```

Delete:

- `src/actions/auth/signUp/`, `src/actions/auth/signIn/`, `src/actions/auth/signOut/` (actions and tests)
- `src/actions/auth/helpers.ts`, `src/actions/auth/helpers.test.ts`. Nothing on the server still needs `normalizeEmail`. `homePathForRole` moves to `src/lib/auth-client.ts`.
- `src/actions/testSetup.ts`, `src/actions/testGlobalSetup.ts` (moved to `src/test/`)

## Schema and migration

1. Write `src/lib/auth.ts` first. The CLI reads it.
2. Run `npx @better-auth/cli@latest generate --config src/lib/auth.ts` and accept the overwrite of `prisma/schema.prisma`. Keep the existing `datasource` and `generator` blocks unchanged.
   - Expected models: `User` (`id String`, `name`, `email @unique`, `emailVerified`, `image?`, `createdAt`, `updatedAt`, `role String?`, `banned Boolean?`, `banReason String?`, `banExpires DateTime?`, relations), `Session` (`token @unique`, `expiresAt`, `ipAddress?`, `userAgent?`, `impersonatedBy String?`, `userId`), `Account`, `Verification`. Keep the CLI's `@@map("user")` / `@@map("session")` / `@@map("account")` / `@@map("verification")` table names.
   - No `Role` enum.
3. Run `npx prisma migrate dev --name better_auth` against the dev DB. The generated SQL must drop the old `"User"` / `"Session"` tables and the `"Role"` enum. Commit the migration.
4. `npm run prisma:generate`.

## `src/lib/auth.ts`

Server-only (imports `@/prisma/prismaClient`). `secret` and `baseURL` come from `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`, which Better Auth reads automatically.

```ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { prisma } from "@/prisma/prismaClient";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, requireEmailVerification: false }, // autoSignIn defaults true; minPasswordLength defaults 8
  session: { expiresIn: 60 * 60 * 24 * 7 },
  plugins: [admin(), nextCookies()], // nextCookies must stay last
});
```

## `src/app/api/auth/[...all]/route.ts`

```ts
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const { GET, POST } = toNextJsHandler(auth);
```

## `src/lib/auth-client.ts`

No `"use client"` directive. It is imported by client page components and by the `/login` and `/signup` routes (for `homePathForRole`).

```ts
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({ plugins: [adminClient()] });

export function homePathForRole(role: string | null | undefined): "/admin" | "/" {
  return role === "admin" ? "/admin" : "/";
}

export const GENERIC_ERROR = "Something went wrong. Try again.";

// Never returns error.message.
export function authErrorMessage(error: { code?: string } | null | undefined): string {
  switch (error?.code) {
    case "INVALID_EMAIL_OR_PASSWORD": return "Invalid email or password.";
    case "PASSWORD_TOO_SHORT":        return "Password must be at least 8 characters.";
    case "INVALID_EMAIL":             return "Enter a valid email address.";
    default:                          return GENERIC_ERROR; // includes USER_ALREADY_EXISTS*
  }
}
```

## Server session helpers

### `getCurrentUser` (`src/actions/auth/getCurrentUser/getCurrentUser.ts`)

Keep `"use server"`, the location, and the read-only contract.

```ts
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getCurrentUser(): Promise<{
  email: string; name: string; role: "user" | "admin";
} | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const { email, name, role } = session.user;
  return { email, name, role: role === "admin" ? "admin" : "user" };
}
```

### `listUsers` (`src/actions/user/listUsers/listUsers.ts`)

- Same guard: `getCurrentUser()`, throw `new Error("Forbidden")` unless `role === "admin"`.
- `prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, email: true, role: true } })`, then map `role` to `"user" | "admin"` (the column is `String?`).
- Return type: `{ id: string; email: string; role: "user" | "admin" }[]`.

## `make-admin` script

**File:** `scripts/make-admin.mjs` (plain ESM, JSDoc types; no Prisma import, uses `pg`).

```js
import "dotenv/config";
import { pathToFileURL } from "node:url";
import pg from "pg";

/** @param {{ query: pg.Pool["query"] }} db @param {string} email @returns {Promise<string>} */
export async function makeAdmin(db, email) {
  const normalized = (email ?? "").trim().toLowerCase();
  if (normalized === "") throw new Error("Usage: npm run make-admin -- <email>");
  const { rowCount } = await db.query(
    'UPDATE "user" SET role = $1, "updatedAt" = now() WHERE email = $2',
    ["admin", normalized],
  );
  if (rowCount === 0) throw new Error(`No user with email ${normalized}`);
  return normalized;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // Pool on DATABASE_URL; await makeAdmin(pool, process.argv[2]); log "Promoted <email> to admin";
  // on error: console.error(message), process.exitCode = 1; always pool.end()
}
```

- Use the table name the CLI mapped (`"user"`). If the generated schema differs, match it.
- `package.json`: `"make-admin": "node scripts/make-admin.mjs"`.

## Test setup (`actions` project)

### `vitest.config.ts`

- `include: ["src/actions/**/*.test.ts", "src/lib/**/*.test.ts", "scripts/**/*.test.ts"]`
- `setupFiles: ["src/test/testSetup.ts"]`, `globalSetup: ["src/test/testGlobalSetup.ts"]`
- `env`: `DATABASE_URL: testDatabaseUrl`, `BETTER_AUTH_SECRET: "test-secret-0123456789abcdef0123456789abcdef"`, `BETTER_AUTH_URL: "http://localhost:3000"`. Remove `ADMIN_EMAIL`.
- Update the "Backend Server Action tests" comment to say "backend tests".

### `src/test/testSetup.ts`

- Keep the in-memory `cookieJar` and the `next/navigation` `redirect` mock.
- Mock **both** `"next/headers"` and `"next/headers.js"` with the same factory:
  - `cookies()`: the existing jar API (`get`, `set`, `delete`) plus `getAll()` and `has()`, which `nextCookies` may call.
  - `headers()`: returns `new Headers({ cookie: <jar serialized as "name=value; name2=value2"> })`, built fresh on each call.
- Result: `auth.api.signUpEmail` / `signInEmail` (through `nextCookies`) write the session cookie into the jar, and `getCurrentUser()` / `auth.api.signOut({ headers: await headers() })` read it back. If `nextCookies` does not write in this context, call with `returnHeaders: true` and copy `set-cookie` into the jar from a `signInAs`-style helper in the test file.
- `beforeEach`: clear the jar, then `TRUNCATE TABLE "verification", "account", "session", "user" RESTART IDENTITY CASCADE` (the mapped table names).
- Exports: `setTestCookie`, `getTestCookie`, and `clearTestCookies()` (to sign out locally between seeded sign-ups).

### Seeding

- Seed users with `auth.api.signUpEmail({ body: { name, email, password } })`. There is no hash helper any more.
- Promote with `prisma.user.update({ where: { email }, data: { role: "admin" } })`.
- Set explicit `createdAt` through `prisma.user.update` when order matters. Expire sessions with `prisma.session.updateMany({ data: { expiresAt: new Date(Date.now() - 60_000) } })`. No fake timers.
- Expected failures: `await expect(auth.api.signUpEmail(...)).rejects.toMatchObject({ body: { code: "..." } })`.

## Backend tests

`src/lib/auth.test.ts` (imports `./auth`):

- sign up success: returns `token` and `user`; `user.role === "user"`; one `user` row and one `account` row (`providerId: "credential"`); session cookie in jar; `getCurrentUser()` returns `{ email, name, role: "user" }`.
- sign up duplicate email → `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL`; short password (`"short"`) → `PASSWORD_TOO_SHORT`; invalid email (`"not-an-email"`) → `INVALID_EMAIL`. No extra user rows.
- sign in success (after `clearTestCookies()`): returns `user`; cookie set; `getCurrentUser()` matches.
- sign in wrong password and unknown email → `INVALID_EMAIL_OR_PASSWORD`.
- sign out: after sign in, `auth.api.signOut({ headers: await headers() })` (import `headers` from `next/headers`). That session row is gone, and `getCurrentUser()` is `null` (clear the jar if the cookie isn't cleared).

`getCurrentUser.test.ts`: `null` with no cookie; `null` for an unknown cookie value; `null` after the session is expired via Prisma; exactly `{ email, name, role }` for a valid session (with `role: "admin"` after promotion).

`listUsers.test.ts`: Forbidden signed out; Forbidden for a `user`; for an admin, returns `[{ id, email, role }]` newest first, with exact keys `["email", "id", "role"]`.

`scripts/make-admin.test.ts` (imports `./make-admin.mjs`, creates a `pg.Pool` on `process.env.DATABASE_URL`, `pool.end()` in `afterAll`): promotes a signed-up user (with `"  Ada@Example.com "` input normalized); throws for an unknown email; throws for an empty email; role unchanged on failure.

## Page components

Shared rules:

- `"use client"`. Import `authClient`, `homePathForRole`, `authErrorMessage`, `GENERIC_ERROR` from `@/lib/auth-client`, and `useRouter` from `next/navigation`. Drop `unstable_rethrow`.
- Injected callbacks are **optional** props with Better Auth's result shape. The default delegates to `authClient`. Routes never pass them.
- On success: `router.push(path)` then `router.refresh()`.
- On `{ error }`: set alert to `authErrorMessage(error)`. On throw: `GENERIC_ERROR`. Never render `error.message`.
- Clear the alert at the start of each submit.

Result type (declare locally in each page; no shared type export):

```ts
type AuthResult = {
  data?: { user?: { role?: string | null } } | null;
  error: { code?: string; message?: string } | null;
};
```

### SignUpPage

```ts
export type SignUpPageProps = {
  signUp?: (input: { name: string; email: string; password: string }) => Promise<AuthResult>;
};
// default: (input) => authClient.signUp.email(input)
```

`onSubmit({ name, email, password, confirmPassword })`:

1. `name.trim() === ""` → `"Enter your name."`; `password !== confirmPassword` → `"Passwords do not match."`. Do not call `signUp`.
2. `const { data, error } = await signUp({ name: name.trim(), email, password })`.
3. Error → mapped message. Success → `router.push(homePathForRole(data?.user?.role))`, then `router.refresh()`.

### SignInPage

`signIn?: (input: { email: string; password: string }) => Promise<AuthResult>`, defaulting to `authClient.signIn.email(input)`. Same flow (no client-side checks).

### HomePage / ProfilePage / AdminPage (sign-out callers)

- `signOut?: () => Promise<{ error: { code?: string } | null }>`, defaulting to `() => authClient.signOut()`.
- `onSignOut`: on `error` or throw → set `GENERIC_ERROR` and **throw** (Header resets its pending state); success → `router.push("/")`, then `router.refresh()`.
- `currentUser` types: `{ email: string; name: string; role: "user" | "admin" }` (`| null` on HomePage).
- AdminPage `users: { id: string; email: string; role: "user" | "admin" }[]`.
- Remove every `Role` import from `@/generated/prisma/browser` (also in `PageTemplate` and `Header`).

### SignUpForm

- Add a **Name** field first: `<Label htmlFor="sign-up-name">Name</Label>`, `<Input id="sign-up-name" type="text" autoComplete="name">`.
- `onSubmit` input becomes `{ name, email, password, confirmPassword }`. Stays presentational.

## Routes

- `/` → `<HomePage currentUser={currentUser} />`
- `/profile` → `<ProfilePage currentUser={currentUser} />` (still redirects signed-out visitors to `/login`)
- `/admin` → `<AdminPage currentUser={currentUser} users={users} />` (still redirects `/login` / `/`)
- `/login` → `<SignInPage />`; `/signup` → `<SignUpPage />`. Both still redirect signed-in visitors to `homePathForRole(currentUser.role)`, now imported from `@/lib/auth-client`.
- Keep `dynamic = "force-dynamic"`. Update the header comments ("injects signOut" etc.).

## Component tests and stories

- Component tests for pages that call `useRouter`: hoisted spies and `vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }))`. Inject `vi.fn()` auth callbacks returning `{ data, error }`. Never hit `authClient`.
  - SignUpPage: mapped error (`{ error: { code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" } }` → generic copy); thrown error → generic copy, not `"boom"`; confirm mismatch shows `"Passwords do not match."` and `signUp` is not called; success calls `signUp` with `{ name, email, password }` and pushes `/`.
  - SignInPage: `INVALID_EMAIL_OR_PASSWORD` → `"Invalid email or password."`; thrown → generic; success with `role: "admin"` pushes `/admin`.
  - Home/Profile/Admin: sign-out error shows generic copy; success pushes `/`. Update fixtures with `name` and string ids.
  - SignUpForm: fill Name; assert `onSubmit` receives `name`.
  - Header/PageTemplate: fixtures gain `name`.
- Stories: `parameters.nextjs.appDirectory: true` on every page story whose component calls `useRouter`. Inject `fn()` callbacks with Better Auth shapes in `args`. Keep `controls.include` to data props only (`currentUser`, `users`, or `[]`).
  - SignUpPage `Default` play: fill Name, Email, and mismatched passwords → `"Passwords do not match."` (no auth call).
  - SignInPage `Default` play: `signIn` mock returns `INVALID_EMAIL_OR_PASSWORD` → `"Invalid email or password."`.

## Docs and env

- `.env.example`: remove `ADMIN_EMAIL`. Add `BETTER_AUTH_SECRET="<generate: openssl rand -base64 32>"` and `BETTER_AUTH_URL="http://localhost:3000"`.
- README:
  - Env table: drop `ADMIN_EMAIL`, add the two Better Auth vars.
  - Replace "Admin user" with: sign up, then `npm run make-admin -- you@example.com`, then sign in again (`/admin` link appears).
  - Add `make-admin` to Scripts.
  - Update the file structure tree (`src/lib/auth.ts`, `auth-client.ts`, `api/auth/[...all]`, `src/test/`, `scripts/`, `actions/auth` holds only `getCurrentUser`).
  - Mention Better Auth in Stack.
- AGENTS.md (leave the Next.js block unchanged):
  - Top: "Do not add npm packages" stays; Auth: replace "No auth packages" with "Auth uses `better-auth` (server `src/lib/auth.ts`, client `src/lib/auth-client.ts`)".
  - Server Actions: "Do not add Route Handlers" gets the exception `src/app/api/auth/[...all]/route.ts`. Canonical example: drop `src/actions/auth/helpers.ts` and use `listUsers` only.
  - Backend tests: canonical example becomes `src/lib/auth.test.ts`. Include globs (`src/actions`, `src/lib`, `scripts`). Setup files in `src/test/`. Env sets `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` (no `ADMIN_EMAIL`). `next/headers` mock covers `cookies()` + `headers()` (both specifiers). Truncates `user`/`session`/`account`/`verification`. Seed with `auth.api.signUpEmail` + Prisma (no hash helpers). Assert Better Auth failures with `rejects.toMatchObject({ body: { code } })`.
  - App wiring: routes inject data and non-auth mutation actions. Auth calls come from page components through optional injected callbacks defaulting to `authClient`. Pages may import `@/lib/auth-client` (never `@/lib/auth`). The "no `router.refresh`" rule gets an exception: after sign-in/up/out, `router.push(path)` + `router.refresh()`.
  - Tests: component tests for pages using `useRouter` `vi.mock("next/navigation")`. Page stories set `parameters.nextjs.appDirectory: true`.
  - Auth section: role via admin plugin (`"user"` default / `"admin"`), promoted only with `npm run make-admin -- <email>`. `getCurrentUser()` returns `{ email, name, role } | null`. `currentUser` typed inline as `{ email: string; name: string; role: "user" | "admin" } | null` (no Prisma `Role`). Error contract: map Better Auth `error.code` with `authErrorMessage`; never show `error.message`. Remove the `unstable_rethrow` / redirecting-action rules. Canonical examples: `src/lib/auth.ts` and `src/components/pages/SignUpPage/SignUpPage.tsx`.

## Implementation order

1. Add `src/lib/auth.ts`. Add `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` to `.env` and `.env.example`.
2. Generate the schema with the Better Auth CLI, create the `better_auth` migration, and run `prisma:generate`.
3. Add the route handler and `src/lib/auth-client.ts`.
4. Move the test setup to `src/test/`, update the mocks and truncation, and update `vitest.config.ts`.
5. Rewrite `getCurrentUser` and `listUsers` and their tests. Add `src/lib/auth.test.ts`.
6. Add `scripts/make-admin.mjs`, its test, and the npm script.
7. Delete the `signUp` / `signIn` / `signOut` actions, `helpers.ts`, and their tests.
8. Update `SignUpForm`, the pages, `PageTemplate`, and `Header` (types, injection, navigation), plus their tests and stories.
9. Update the routes.
10. Update `.env.example`, README, and AGENTS.md.
11. `npm run lint`, `npm run build`, `npm test`. Then a manual check: sign up, sign out, sign in, `make-admin`, then sign in lands on `/admin`, and a non-admin hitting `/admin` is redirected to `/`.

## Out of scope

- Email verification, password reset, OAuth/social providers, email sending
- Admin UI for ban / impersonate / setRole (plugin endpoints exist but are unused)
- `proxy.ts` / middleware, `?next=` return URLs
- Playwright E2E and a dev-server harness
- Migrating existing user data
- Showing `name` anywhere beyond `currentUser` typing (no Profile/Header display changes)
- Using `authClient.useSession()` in UI (server `getCurrentUser()` remains the source for `currentUser`)
- New npm packages beyond the already-added `better-auth`
