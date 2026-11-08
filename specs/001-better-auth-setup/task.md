# Tasks: Better Auth Setup

Source: [plan.md](./plan.md) · [spec.md](./spec.md)

Do not add npm packages beyond the already-added `better-auth`. Do not add `proxy.ts`/middleware or any Route Handler other than `src/app/api/auth/[...all]/route.ts`. Never render `error.message`. Pages import `@/lib/auth-client`, never `@/lib/auth` or Prisma.

## 1. Better Auth instance and schema

- [x] Create `src/lib/auth.ts`: `betterAuth` with `prismaAdapter(prisma, { provider: "postgresql" })`, `emailAndPassword: { enabled: true, requireEmailVerification: false }`, `session.expiresIn` 7 days, `plugins: [admin(), nextCookies()]` (`nextCookies` last).
- [x] Add `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` to local `.env`.
- [x] Run `npx @better-auth/cli@latest generate --config src/lib/auth.ts` to regenerate `prisma/schema.prisma`. Keep the existing `datasource`/`generator` blocks. Confirm `User`/`Session`/`Account`/`Verification` with string ids, admin fields (`role`, `banned`, `banReason`, `banExpires`, `impersonatedBy`), and no `Role` enum.
- [x] `npx prisma migrate dev --name better_auth`. Confirm the SQL drops the old `"User"`, `"Session"`, and `"Role"`.
- [x] `npm run prisma:generate`.

## 2. Next integration

- [x] Create `src/app/api/auth/[...all]/route.ts`: `export const { GET, POST } = toNextJsHandler(auth)`.
- [x] Create `src/lib/auth-client.ts` (no `"use client"`): `authClient = createAuthClient({ plugins: [adminClient()] })`, `homePathForRole(role)`, `GENERIC_ERROR`, and `authErrorMessage(error)` mapping `INVALID_EMAIL_OR_PASSWORD`, `PASSWORD_TOO_SHORT`, and `INVALID_EMAIL` to the existing copy, with everything else (including `USER_ALREADY_EXISTS*`) mapped to `GENERIC_ERROR`.

## 3. Test infrastructure

- [x] Move `src/actions/testSetup.ts` → `src/test/testSetup.ts` and `src/actions/testGlobalSetup.ts` → `src/test/testGlobalSetup.ts`.
- [x] In `testSetup.ts`, mock both `"next/headers"` and `"next/headers.js"`: `cookies()` (jar with `get`/`set`/`delete`/`getAll`/`has`) and `headers()` (fresh `Headers` with a `cookie` header built from the jar). Keep the `redirect` mock.
- [x] `beforeEach`: clear the jar and `TRUNCATE "verification", "account", "session", "user" RESTART IDENTITY CASCADE` (the mapped table names).
- [x] Export `setTestCookie`, `getTestCookie`, `clearTestCookies`.
- [x] `vitest.config.ts` actions project: include `src/actions/**/*.test.ts`, `src/lib/**/*.test.ts`, `scripts/**/*.test.ts`; new setup paths; env `BETTER_AUTH_SECRET` (≥32 chars) and `BETTER_AUTH_URL`; remove `ADMIN_EMAIL`.

## 4. Server helpers and backend tests

- [x] Rewrite `getCurrentUser` to wrap `auth.api.getSession({ headers: await headers() })` and return `{ email, name, role: "user" | "admin" } | null`. Keep `"use server"` and keep it read-only.
- [x] Update `listUsers`: admin guard unchanged; `select { id, email, role }`, newest first; map `role` to `"user" | "admin"`.
- [x] Add `src/lib/auth.test.ts`: sign-up success (user + `credential` account row, token/session returned, role `user`, cookie set); duplicate email / short password / invalid email reject with the matching `body.code`; sign-in success; wrong password and unknown email reject with `INVALID_EMAIL_OR_PASSWORD`; sign out removes the session and `getCurrentUser()` becomes `null`.
- [x] Rewrite `getCurrentUser.test.ts`: null with no cookie, null for an unknown cookie, null for a session expired via Prisma, exact `{ email, name, role }` otherwise.
- [x] Rewrite `listUsers.test.ts`: Forbidden signed out, Forbidden for `user`; admin gets `{ id, email, role }` newest first with exact keys.
- [x] Seed with `auth.api.signUpEmail` + Prisma updates (role, `createdAt`, `expiresAt`). No fake timers, and no `vi.mock` of Next modules in test files.

## 5. make-admin script

- [x] Create `scripts/make-admin.mjs`: export `makeAdmin(db, email)`, which trims and lowercases the email, throws on empty input, runs `UPDATE "user" SET role = 'admin', "updatedAt" = now() WHERE email = $1`, throws if no row matched, and returns the normalized email. The CLI entry runs only when executed directly: `pg.Pool` on `DATABASE_URL`, log on success, `console.error` + `process.exitCode = 1` on failure, always `pool.end()`.
- [x] Add `"make-admin": "node scripts/make-admin.mjs"` to `package.json`.
- [x] Add `scripts/make-admin.test.ts`: promotes a signed-up user (mixed-case/padded input), throws for unknown and empty email, leaves the role unchanged on failure. Close the pool in `afterAll`.

## 6. Remove hand-rolled auth

- [x] Delete `src/actions/auth/signUp/`, `signIn/`, `signOut/` (actions + tests).
- [x] Delete `src/actions/auth/helpers.ts` and `helpers.test.ts`.
- [x] Confirm no remaining imports of `hashPassword`, `verifyPassword`, `hashToken`, `createSession`, `SESSION_COOKIE`, `roleForEmail`, `ADMIN_EMAIL`, `unstable_rethrow`, or Prisma `Role`.

## 7. UI

- [x] `SignUpForm`: add a Name field first (`id="sign-up-name"`, `autoComplete="name"`); `onSubmit` gets `{ name, email, password, confirmPassword }`.
- [x] `SignUpPage`: optional `signUp` prop (Better Auth `{ data, error }` shape) defaulting to `authClient.signUp.email`. Client checks `"Enter your name."` and `"Passwords do not match."` before calling. Map `error` with `authErrorMessage`; a throw shows `GENERIC_ERROR`. On success, `router.push(homePathForRole(data.user.role))` + `router.refresh()`.
- [x] `SignInPage`: optional `signIn` prop defaulting to `authClient.signIn.email`; same error and success flow.
- [x] `HomePage`, `ProfilePage`, `AdminPage`: optional `signOut` prop defaulting to `authClient.signOut`. On error or throw, show `GENERIC_ERROR` and rethrow. On success, `router.push("/")` + `router.refresh()`.
- [x] Type `currentUser` inline as `{ email: string; name: string; role: "user" | "admin" }` (`| null` where public) in pages, `PageTemplate`, and `Header`. AdminPage `users[].id` is `string`.
- [x] Remove `unstable_rethrow` and `@/generated/prisma/browser` `Role` imports from UI.

## 8. Routes

- [x] `/`, `/profile`, `/admin`: stop passing `signOut`; keep the redirects and `dynamic = "force-dynamic"`.
- [x] `/login`, `/signup`: render `<SignInPage />` / `<SignUpPage />` with no props; import `homePathForRole` from `@/lib/auth-client`.
- [x] Update the route header comments.

## 9. Component tests and stories

- [x] Page tests: `vi.mock("next/navigation")` with hoisted `push`/`refresh` spies; inject `vi.fn()` callbacks returning `{ data, error }`.
- [x] SignUpPage tests: duplicate-email code → generic copy; throw → generic copy, not `"boom"`; mismatch → `"Passwords do not match."` without calling `signUp`; success called with `{ name, email, password }` and pushes `/`.
- [x] SignInPage tests: `INVALID_EMAIL_OR_PASSWORD` → `"Invalid email or password."`; throw → generic; admin success pushes `/admin`.
- [x] Home/Profile/Admin tests: sign-out failure shows generic copy; success pushes `/`; fixtures include `name` and string ids.
- [x] SignUpForm, Header, PageTemplate tests: fill or add `name`.
- [x] Page stories: `parameters.nextjs.appDirectory: true`; `fn()` callbacks with Better Auth shapes in `args`; `controls.include` lists only data props (or `[]`).
- [x] SignUpPage `Default` play: Name + Email + mismatched passwords → `"Passwords do not match."`. SignInPage `Default` play: mocked `INVALID_EMAIL_OR_PASSWORD` → `"Invalid email or password."`.

## 10. Docs and env

- [x] `.env.example`: remove `ADMIN_EMAIL`; add `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`.
- [x] README: env table, admin section (`npm run make-admin -- <email>`), Scripts list, Stack (Better Auth), file structure.
- [x] AGENTS.md: apply every change listed under "Docs and env" in the plan (better-auth allowed, single auth Route Handler, page injection defaulting to `authClient`, `router.push` + `router.refresh` exception for auth, `vi.mock("next/navigation")` in page tests, `appDirectory` in page stories, backend test setup/env/truncation/seeding, Auth section role/error/`currentUser` rules, canonical examples). Leave the Next.js block unchanged.

## 11. Verify

- [x] `npm run lint`
- [x] `npm run build` (with `BETTER_AUTH_SECRET` set)
- [x] `npm test` (storybook, components, actions all pass)
- [x] Manual: sign up → lands on `/`; sign out; sign in; `npm run make-admin -- <email>`; sign in again → `/admin`; a non-admin visiting `/admin` → `/`; signed-out visitor to `/profile` → `/login`.
