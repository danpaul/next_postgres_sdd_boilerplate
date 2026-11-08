# Next, Postgres, SDD boilerplate

This repo is a Next.js boilerplate used as a starting point for new applications. You can quickly spin-up a [Postgres instance](https://www.prisma.io/postgres), update your .env and have a basic next app with conventions, testing and basic auth already in place so, you can get started with the fun stuff immediately (building your idea).

The repo comes with basic skills for agentic development using spec-driven development and conventions and standards document in [`AGENTS.md`](./AGENTS.md).

Email/password auth with [Better Auth](https://better-auth.com/) and roles `user` and `admin`. Storybook for component previews, and Vitest for testing.

Existing routes: public `/`, `/signup` and `/login`; `/profile` for signed-in users; and `/admin` for admins only.

## Stack

- [React 19](https://react.dev/) — UI library; `src/components/`
- [Next.js](https://nextjs.org/) — App Router; `src/app/`
- [Better Auth](https://better-auth.com/) — email/password auth and the admin plugin for roles; `src/lib/auth.ts` (server), `src/lib/auth-client.ts` (client), `src/app/api/auth/[...all]/route.ts`
- [Prisma](https://www.prisma.io/) — ORM for hosted Prisma Postgres; `prisma/schema.prisma`, `src/prisma/prismaClient.ts`
- [Storybook](https://storybook.js.org/) — UI in isolation; `.storybook/`, colocated `*.stories.tsx`
- [Atomic Design](https://atomicdesign.bradfrost.com/chapter-2/) — UI folder map; `src/components/{ui,atoms,molecules,organisms,templates,pages}`
- [Tailwind CSS](https://tailwindcss.com/) — utility classes and the shadcn light theme tokens; `src/app/globals.css`
- [shadcn/ui](https://ui.shadcn.com/) — Radix-based primitives copied into the repo; `src/components/ui/`, `components.json`
- [Vite](https://vite.dev/) — Storybook and Vitest toolchain, not the Next.js bundler; `.storybook/main.ts`, `vitest.config.ts`
- [Vitest](https://vitest.dev/) — component and story tests in the browser (colocated `*.test.tsx`) and backend tests in Node (colocated `*.test.ts` in `src/actions/`, `src/lib/`, and `scripts/`)

## Setup

1. Install Node.js and npm. Clone this repo.
2. `npm install`
3. Create a Prisma Postgres database (Console or `npx create-db`)
4. Copy `.env.example` to `.env` and fill in the variables below. Do not commit `.env`.
5. `npm run prisma:generate`
6. `npm run prisma:migrate`
7. `npm run dev` → [http://localhost:3000/](http://localhost:3000/)
8. Optional: create a second database for `TEST_DATABASE_URL` (see [Backend tests](#backend-tests)).

### Environment variables

| Variable             | Required          | Purpose                                                                                                          |
| -------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`       | Yes               | Direct Prisma Postgres connection string (`db.prisma.io`, not the pooled host).                                  |
| `TEST_DATABASE_URL`  | For backend tests | Separate Prisma Postgres database for backend tests. Must differ from `DATABASE_URL`. Unset skips backend tests. |
| `BETTER_AUTH_SECRET` | Yes               | Secret Better Auth uses to sign sessions (at least 32 characters). Generate with `openssl rand -base64 32`.      |
| `BETTER_AUTH_URL`    | Yes               | Base URL of the app, e.g. `http://localhost:3000`.                                                               |

### Admin user

Every account has a role: `user` (the default) or `admin`. To make an account admin:

1. Sign up at [/signup](http://localhost:3000/signup).
2. Run `npm run make-admin -- you@example.com`. Case and surrounding spaces are ignored.
3. Sign out and sign in again. You land on [/admin](http://localhost:3000/admin), and the header shows an **Admin** link.

## Scripts

Run with `npm run <name>`.

- `dev` — Next.js dev server at http://localhost:3000/
- `build` — production build
- `start` — serve the production build
- `lint` — ESLint
- `prisma:migrate` — apply committed migrations (`prisma migrate deploy`)
- `prisma:generate` — generate the Prisma client
- `storybook` — Storybook on port 6006
- `build-storybook` — static Storybook build
- `test` — all Vitest projects (storybook, components, actions)
- `test:actions` — backend tests only
- `make-admin` — promote a user to admin: `npm run make-admin -- <email>`

### Backend tests

Set `TEST_DATABASE_URL` to a separate database, then run `npm test` or `npm run test:actions`. Conventions are in [`AGENTS.md`](./AGENTS.md).

## File structure

```
.
├── src/
│   ├── app/                    # routes
│   │   ├── api/auth/[...all]/  # Better Auth handler (the only Route Handler)
│   │   ├── page.tsx            # /         public home
│   │   ├── login/page.tsx      # /login
│   │   ├── signup/page.tsx     # /signup
│   │   ├── profile/page.tsx    # /profile  signed-in users
│   │   ├── admin/page.tsx      # /admin    admins only
│   │   ├── layout.tsx          # root layout and metadata
│   │   └── globals.css         # Tailwind entry and theme tokens
│   ├── components/             # ui, atoms, molecules, organisms, templates, pages
│   │   └── ui/                 # shadcn primitives (generated)
│   ├── actions/
│   │   ├── auth/               # getCurrentUser
│   │   └── user/               # listUsers
│   ├── lib/
│   │   ├── auth.ts             # Better Auth server instance
│   │   ├── auth-client.ts      # Better Auth client and auth UI helpers
│   │   └── utils.ts            # cn helper
│   ├── test/
│   │   ├── testSetup.ts        # backend test mocks and DB reset
│   │   └── testGlobalSetup.ts  # migrates the test database
│   ├── prisma/prismaClient.ts  # Prisma client for actions
│   └── generated/prisma/       # generated client; do not edit
├── prisma/                     # schema.prisma and migrations
├── scripts/make-admin.mjs      # npm run make-admin -- <email>
├── .storybook/                 # Storybook config
├── components.json             # shadcn config
├── specs/                      # SDD specs
├── vitest.config.ts            # Vitest projects
└── AGENTS.md                   # conventions
```

## Adding a shadcn component

1. `npx shadcn@latest add <name>` (writes `src/components/ui/<name>.tsx` and installs its deps).
2. Add `src/components/ui/<name>.stories.tsx` titled `UI/<Name>`, following the story rules in [`AGENTS.md`](./AGENTS.md). No unit test.
3. Import from `@/components/ui/<name>`. See [`AGENTS.md`](./AGENTS.md) for conventions.

## Adding a feature (spec-driven development)

Features are built with four agent skills, run in order and each invoked explicitly: `/spec-init` → `/spec-grill-me` → `/spec-plan` → `/spec-execute`. Each spec lives in `specs/NNN-kebab-slug/` as `spec.md`, `plan.md` and `task.md`. The skills are installed in `.agents/skills/` and `.claude/skills/`. See [danpaul/agent_skills_sdd](https://github.com/danpaul/agent_skills_sdd) for details.
