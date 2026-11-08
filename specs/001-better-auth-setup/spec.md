## Goal

Migrate app from hand rolled auth setup to better auth.

## Requirements

- setup better auth and integrate with app
- remove existing auth structure
- create a better auth instance
- integrate better auth instance with app

### Decisions

**Integration: full Next integration**

- Server instance in `src/lib/auth.ts` (`betterAuth`, Prisma adapter, `nextCookies` plugin last).
- Mount the handler at `src/app/api/auth/[...all]/route.ts` (`toNextJsHandler`). This is the only Route Handler. App backend stays on Server Actions.
- Client in `src/lib/auth-client.ts` (`createAuthClient` + `adminClient`).
- Page components (`SignUpPage`, `LoginPage`, sign-out caller) import `authClient` and call `signUp.email` / `signIn.email` / `signOut`. Routes no longer inject auth actions. Molecules stay presentational and receive callbacks.
- After success, navigate client-side: admins to `/admin`, everyone else to `/`.
- Errors: show generic copy in the existing destructive `Alert`. Map expected Better Auth errors (duplicate email, invalid credentials, short password) to the existing user-facing messages. Never render raw `error.message`.

**Schema: adopt Better Auth's schema; data is throwaway**

- Generate models with the Better Auth CLI: `User`, `Session`, `Account`, `Verification`, string ids, plus admin plugin fields (`role`, `banned`, `banReason`, `banExpires`, `impersonatedBy`).
- New migration drops the old `User`/`Session` tables and the `Role` enum. No user data migration; existing users sign up again.
- Default Better Auth password hashing.

**Features**

- Email + password only. `requireEmailVerification: false`, no email sending, no OAuth.
- Session lifetime 7 days (matches current). Signup signs the user in automatically.
- Password min length 8 (Better Auth default). Confirm-password match is checked client-side in the form.
- Signup form gains a required **Name** field, passed as `name`.

**Roles: Better Auth admin plugin**

- `role` is a string (`"user"` default, `"admin"`). `ADMIN_EMAIL` is removed.
- Admins are promoted with an npm script: `npm run make-admin -- <email>` sets `role = "admin"` through Prisma. Document it in the README.
- UI types `currentUser` inline as `{ email: string; name: string; role: "user" | "admin" } | null`. The Prisma `Role` enum import goes away.

**Server-side session and route protection**

- `getCurrentUser()` stays as a read-only server helper wrapping `auth.api.getSession({ headers: await headers() })`. It returns `{ email, name, role } | null`.
- `/admin` and `/profile` keep the server check in `page.tsx` followed by `redirect`. No `proxy.ts`.
- `listUsers` stays a Server Action. It throws unless the session role is `admin` and selects only the fields the UI needs through Prisma.

**Removal**

- Delete `signUp`, `signIn`, and `signOut` Server Actions and their tests, plus the hand-rolled helpers (`hashPassword`, `verifyPassword`, `hashToken`, `createSession`, session cookie constants). Keep any helper still used (e.g. `normalizeEmail`, `homePathForRole`) only if something still calls it.

**Conventions to update in AGENTS.md**

- Allow `better-auth` (replaces "No auth packages").
- Allow the single `api/auth/[...all]` Route Handler.
- Page components may import `authClient`. Update the Auth section's role, error-contract, and `currentUser` typing rules.
- Update `testSetup.ts`: truncate `User`/`Session`/`Account`/`Verification`, and set `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` for tests.

### Reference

Creating better auth instance: https://better-auth.com/docs/installation

Integrating better auth with next: https://better-auth.com/docs/integrations/next

Admin plugin: https://better-auth.com/docs/plugins/admin

## Acceptance Criteria

- existing hand-rolled auth (actions, helpers, Session/User schema) has been removed
- better auth is set up, and email signup and sign-in still work end to end
- `npm run make-admin -- <email>` promotes a user; that user lands on `/admin` after sign-in, and non-admins are redirected away from it
- Node tests (`actions`-style Vitest project, real test DB, calling `auth.api.*`) cover:
  - sign up success (user + account created, session returned, role `user`)
  - sign up with duplicate email, short password, and invalid email
  - sign in success, wrong password, and unknown email
  - `getCurrentUser()` returns null with no session and with an expired session, and the user otherwise
  - sign out invalidates the session
  - `listUsers` rejects non-admins and returns the list for admins
  - `make-admin` script logic (if extracted to a testable function)
- existing component tests and stories still pass (update SignUpForm/SignUpPage/LoginPage for the Name field and new call site)
- `npm run lint`, `npm run build`, and `npm test` pass

## Out of Scope

- Email verification, password reset, OAuth or social providers
- Playwright E2E and dev-server harness
- Migrating existing user data
- Admin UI for ban, impersonate, or setRole (plugin endpoints exist but are unused by UI)
- `proxy.ts` / middleware

## Open Questions

- Page components now import `authClient`, so component tests and stories need a way to stub it without `vi.mock` in stories. One option is optional injected callbacks on the page component that default to `authClient`. Another is Storybook module mocking. Decide during implementation; prefer injected callbacks (no new packages).
