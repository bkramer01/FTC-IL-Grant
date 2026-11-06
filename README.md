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
npm run db:seed                   # loads the sample administrator entries
npm run dev                       # http://localhost:3010
```

### Test and production databases

The local site uses its own database on this computer, and a **TEST DATABASE** banner shows at the
top of every page. If the banner ever reads **LIVE DATABASE**, `.env.local` is pointing at production.

Each time you restart the computer, start the test database again before the site:
`npm run db:local` in one terminal (leave it running), then `npm run dev` in another.

The production connection string lives only in `.env.prod-db` (not committed), in this format:

```
PROD_DATABASE_URL=postgresql://postgres.<ref>:<password>@...pooler.supabase.com:5432/postgres
```

- `npm run db:copy-prod` replaces the test database with a fresh copy of production. It only reads
  from production, and it overwrites any local test edits, so it asks first.
- `npm run db:migrate:prod` applies new table changes to production, after you type `production`.
  Run it just before pushing code that needs them. Data stays in place.
- `npm run db:seed` refuses to run against anything but a database on this computer.
- Hostinger needs no change: production keeps its own `DATABASE_URL`.

To test approved changes before release: work against the test database, then run
`npm run db:migrate:prod` if there's a table change, then push to `main`.

Sign in at http://localhost:3010 as **FTCAdmin** with the `ADMIN_PASSWORD` from `.env.local`.
The pages are described in [docs/README.md](docs/README.md).

**How data flows.** **Refresh Data** (Dashboard) reads the grant form responses and the BioBuzz team
list from Google Sheets with a service account (`GOOGLE_SERVICE_ACCOUNT_KEY`, see `src/lib/sheets.ts`)
and saves them in the `sheet_snapshots` table. Everything the Grant Administrator enters (reviews, fundraising and checks, the email log, grant asks) is saved to Postgres
through server actions (`src/app/(admin)/actions.ts` → `src/lib/store.ts`). After `npm run db:migrate`,
`npm run db:seed` loads `src/mock/sample-data.json` (a sample snapshot plus sample entries) for local
development only (`-- --reset` to start over); it refuses to run against production. The grant rules live in
`src/lib/grant.ts` and `src/lib/applications.ts`.

Ports 3010 and 54339 are chosen so this site can run alongside the Event Registration site
(3000 / 54329).

## Scripts

| Command | What it does |
| ------- | ------------ |
| `npm run dev` | Dev server on http://localhost:3010. |
| `npm run db:local` | Embedded Postgres in `.local-pg/`. |
| `npm run db:generate` | Creates a migration in `drizzle/` from `src/db/schema.ts`. |
| `npm run db:migrate` | Applies migrations to `DATABASE_URL` (the test database, locally). |
| `npm run db:migrate:prod` | Applies migrations to production, using `.env.prod-db`. Asks first. |
| `npm run db:copy-prod` | Replaces the test database with a copy of production. Asks first (`-- --yes` skips that). |
| `npm run db:seed` | Loads the sample reviews, emails and grant asks into empty tables (`-- --reset` empties them first). Local databases only. |
| `npm test` | Vitest against a throwaway embedded Postgres. |
| `npm run typecheck` / `npm run lint` | Type check / lint. |
| `npm run build` | Production build into `.next/standalone`. |

## Workflow

1. Work on a branch locally, run `npm test`, `npm run typecheck` and `npm run lint`.
2. Commit and push to GitHub; merge into `main`.
3. Production deploys from `main` (see [DEPLOY.md](DEPLOY.md)).
