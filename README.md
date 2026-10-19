# FTC Illinois Grant Site

A Next.js site for FIRST Tech Challenge Illinois team grants. It's set up the same way as the
FTC IL Event Registration site: develop locally, push to GitHub
([bkramer01/FTC-IL-Grant](https://github.com/bkramer01/FTC-IL-Grant)), deploy to Hostinger with
Supabase Postgres (see [DEPLOY.md](DEPLOY.md)).

**Stack:** Next.js 16 (App Router, Server Actions, `output: "standalone"`), TypeScript, Tailwind CSS 4,
Postgres (Supabase in production) through Drizzle ORM, Nodemailer over Hostinger SMTP, Zod, Vitest.

## Local setup

Requires Node.js 20.9 or newer. No Docker needed: the project includes a self-contained Postgres
that runs from npm.

```bash
npm install
cp .env.example .env.local        # then edit ADMIN_PASSWORD and SESSION_SECRET
npm run db:local                  # terminal 1: starts Postgres on localhost:54339 (leave running)
npm run db:migrate                # terminal 2: creates the tables
npm run dev                       # http://localhost:3010
```

Sign in at http://localhost:3010 as **FTCAdmin** with the `ADMIN_PASSWORD` from `.env.local`.
The pages are described in [docs/README.md](docs/README.md).

**Current stage: mockup.** The pages run on sample data copied from `FTC IL Grant Status.xlsx`
into `src/mock/sample-data.json` (loaded by `src/lib/data.ts`). Edits aren't saved and Refresh Data
doesn't contact Google yet. The grant rules live in `src/lib/grant.ts` and `src/lib/applications.ts`.

Ports 3010 and 54339 are chosen so this site can run alongside the Event Registration site
(3000 / 54329).

## Scripts

| Command | What it does |
| ------- | ------------ |
| `npm run dev` | Dev server on http://localhost:3010. |
| `npm run db:local` | Embedded Postgres in `.local-pg/`. |
| `npm run db:generate` | Creates a migration in `drizzle/` from `src/db/schema.ts`. |
| `npm run db:migrate` | Applies migrations to `DATABASE_URL`. |
| `npm test` | Vitest against a throwaway embedded Postgres. |
| `npm run typecheck` / `npm run lint` | Type check / lint. |
| `npm run build` | Production build into `.next/standalone`. |

## Workflow

1. Work on a branch locally, run `npm test`, `npm run typecheck` and `npm run lint`.
2. Commit and push to GitHub; merge into `main`.
3. Production deploys from `main` (see [DEPLOY.md](DEPLOY.md)).
