# Next, Postgres, SDD boilerplate

This repo is a Next.js boilerplate used as a starting point for new applications. You can quickly spin-up a [Postgres instance](https://www.prisma.io/postgres), update your .env and have a basic next app with conventions, testing and basic auth already in place so, you can get started with the fun stuff immediately (building your idea).

The repo comes with basic skills for agentic development using spec-driven development and conventions and standards document in [`AGENTS.md`](./AGENTS.md).

Basic auth with email/password and roles `user` and `admin`. Storybook for component previews, and Vitest for testing.

Existing routes: public `/`, `/signup` and `/login`; `/profile` for signed-in users; and `/admin` for admins only.

## Stack

- [React 19](https://react.dev/) — UI library; `src/components/`
- [Next.js](https://nextjs.org/) — App Router; `src/app/`
- [Prisma](https://www.prisma.io/) — ORM for hosted Prisma Postgres; `prisma/schema.prisma`, `src/prisma/prismaClient.ts`
- [Storybook](https://storybook.js.org/) — UI in isolation; `.storybook/`, colocated `*.stories.tsx`
- [Atomic Design](https://atomicdesign.bradfrost.com/chapter-2/) — UI folder map; `src/components/{atoms,molecules,organisms,templates,pages}`
- [Tailwind CSS](https://tailwindcss.com/) — utility classes; `src/app/globals.css`
- [Vite](https://vite.dev/) — Storybook and Vitest toolchain, not the Next.js bundler; `.storybook/main.ts`, `vitest.config.ts`
- [Vitest](https://vitest.dev/) — component and story tests in the browser (colocated `*.test.tsx`) and backend Server Action tests in Node (colocated `*.test.ts` in `src/actions/`)

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

| Variable            | Required          | Purpose                                                                                                          |
| ------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`      | Yes               | Direct Prisma Postgres connection string (`db.prisma.io`, not the pooled host).                                  |
| `TEST_DATABASE_URL` | For backend tests | Separate Prisma Postgres database for backend tests. Must differ from `DATABASE_URL`. Unset skips backend tests. |
| `ADMIN_EMAIL`       | No                | Email of the admin account. Leave it unset or empty and nobody is admin.                                         |

### Admin user

Every account has a role: `user` (the default) or `admin`. The role is set once, at sign-up:

1. Set `ADMIN_EMAIL` in `.env` (for example `ADMIN_EMAIL="you@example.com"`) and restart `npm run dev`.
2. Sign up at [/signup](http://localhost:3000/signup) with that email. Case and surrounding spaces are ignored.
3. The header shows an **Admin** link to [/admin](http://localhost:3000/admin).

Signing in never changes a role. Accounts created before `ADMIN_EMAIL` was set, or under a different email, stay `user`; to make one of them admin, update its `role` in the database (for example with `npx prisma studio`).

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
- `test:actions` — backend Server Action tests only

### Backend tests

Set `TEST_DATABASE_URL` to a separate database, then run `npm test` or `npm run test:actions`. Conventions are in [`AGENTS.md`](./AGENTS.md).

## File structure

```
.
├── src/
│   ├── app/                    # routes
│   │   ├── page.tsx            # /         public home
│   │   ├── login/page.tsx      # /login
│   │   ├── signup/page.tsx     # /signup
│   │   ├── profile/page.tsx    # /profile  signed-in users
│   │   ├── admin/page.tsx      # /admin    admins only
│   │   ├── layout.tsx          # root layout and metadata
│   │   └── globals.css         # Tailwind entry
│   ├── components/             # atoms, molecules, organisms, templates, pages
│   ├── actions/
│   │   ├── auth/               # signUp, signIn, signOut, getCurrentUser, helpers
│   │   ├── user/               # listUsers
│   │   ├── testSetup.ts        # backend test mocks and DB reset
│   │   └── testGlobalSetup.ts  # migrates the test database
│   ├── prisma/prismaClient.ts  # Prisma client for actions
│   └── generated/prisma/       # generated client; do not edit
├── prisma/                     # schema.prisma and migrations
├── .storybook/                 # Storybook config
├── specs/                      # SDD specs
├── vitest.config.ts            # Vitest projects
└── AGENTS.md                   # conventions
```

## Adding a feature (spec-driven development)

Features are built with four agent skills, run in order and each invoked explicitly: `/spec-init` → `/spec-grill-me` → `/spec-plan` → `/spec-execute`. Each spec lives in `specs/NNN-kebab-slug/` as `spec.md`, `plan.md` and `task.md`. The skills are installed in `.agents/skills/` and `.claude/skills/`. See [danpaul/agent_skills_sdd](https://github.com/danpaul/agent_skills_sdd) for details.
