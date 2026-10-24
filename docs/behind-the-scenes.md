# Behind the Scenes

> **Applies to:** the whole site · **Last updated:** October 23, 2026

The technical setup, for whoever maintains the site. Step-by-step deployment instructions are in [DEPLOY.md](../DEPLOY.md); local development is in the project [README](../README.md).

## The pieces

```
 Grant Administrator's browser
            │  HTTPS
            ▼
 Hostinger Node.js web app  ── reads ──►  Google Sheets API
 (Next.js site, from GitHub `main`)         (service account, read-only)
            │
            │  Postgres connection (DATABASE_URL, SSL)
            ▼
 Supabase Postgres  ("FTC IL Grant Project")
```

| Piece | What it is |
|---|---|
| **Code** | GitHub repository [bkramer01/FTC-IL-Grant](https://github.com/bkramer01/FTC-IL-Grant). Production runs the `main` branch. |
| **Hosting** | Hostinger Node.js Web App, built with `npm run build` and started with `node .next/standalone/server.js`. |
| **Database** | Supabase project **FTC IL Grant Project** (ref `uyyighbxmkhoussrleug`, us-west-2), separate from the Event Registration site's. The site connects through the Session pooler. |
| **Google** | Google Cloud project `project-115d3a43-e62e-443b-8d5` with the Google Sheets API on. Its service account `ftc-grant-sheets-reader@…` has read-only access to the two sheets. |
| **Software** | Next.js 16.4.3 (App Router, Server Actions), TypeScript, Tailwind CSS 4, Drizzle ORM, Zod, exceljs (the two Excel files), google-auth-library, Vitest (tests). |

## Database tables

Everything the Grant Administrator enters, plus the saved copy of the Google Sheets. Defined in `src/db/schema.ts`; changes are made with migrations in `drizzle/`.

| Table | One row per | Holds |
|---|---|---|
| `application_reviews` | Form response (keyed by its Timestamp) | Title 1, Fundraising Letter Rec'd, VRS Task Completed, Grant Approved, Review Notes, Raised by Team (+ Last Update date, and whether it's been set), Amount of Check (+ the Possible Grant Award it was typed against), Check #, Date Check Mailed, Ask Period (`ask_id`, linked to `grant_asks`; removing the ask clears it). Also the hidden Event Volunteering? and Qualified Purchase? answers. A row is created the first time anything is entered for a response. |
| `email_log` | Logged email | Date, team #, recipient, purpose (Additional Info Needed / Grant Award / Other), notes. |
| `grant_asks` | Grant ask | Name, start and end dates, list order. Its `cumulative` and `ask` columns hold amounts typed before Oct 23, 2026 and are no longer used: both are now calculated. |
| `sheet_snapshots` | Google Sheet tab (2 rows: `responses`, `biobuzz`) | The headings and rows from the last Refresh Data, and when it ran. |
| `settings` | — | Reserved; not used yet. |

The database also checks the allowed answers itself (for example, Grant Approved must be Yes, Under Review or No, and amounts can't be negative), so a bad value can't be saved even by mistake.

## Security

- **Sign in:** one shared account, **FTCAdmin**, with the password in the server's `ADMIN_PASSWORD` setting. After 5 wrong passwords from the same internet address, sign-in is blocked for 15 minutes. The counter resets if the server restarts.
- **Sessions:** a signed cookie (signed with `SESSION_SECRET`) that lasts 12 hours. Changing `SESSION_SECRET` signs everyone out.
- **Every page and every save** checks the session on the server. Only the sign-in page is open without it.
- **Database:** only the site's server talks to the database, through `DATABASE_URL`. Every table has Supabase row-level security turned on with no access rules, so Supabase's public API (and the publishable key) can't read or change anything.
- **Google:** the service account can only read, and only the sheets shared with it.
- **Secrets** (database password, `ADMIN_PASSWORD`, `SESSION_SECRET`, the Google key file `google-service-account.json`) live only in Hostinger's environment variables and the local `.env.local`. They're never committed to GitHub.

## Server settings (environment variables)

| Setting | Purpose |
|---|---|
| `DATABASE_URL` | Supabase connection string (Session pooler). |
| `DATABASE_SSL` | `true` for Supabase. |
| `ADMIN_PASSWORD` | Password for FTCAdmin. |
| `SESSION_SECRET` | 64 random characters used to sign sign-in cookies. |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | The service account's key file, base64-encoded, for Refresh Data. |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public Supabase project values. Not used by the pages today. |
| `EMAIL_TRANSPORT`, `SMTP_*`, `EMAIL_FROM`, `APP_URL` | Hostinger mailbox settings, ready for sending emails later. The site doesn't send email yet: the Email Log is a manual record. |

## Making changes

1. Change and test locally (`npm run dev`, against a local database or Supabase). Run `npm test`, `npm run typecheck` and `npm run lint`.
2. Update the page documents in `docs/` in the same change (see [AGENTS.md](../AGENTS.md)).
3. **Database changes:** edit `src/db/schema.ts`, run `npm run db:generate`, and apply the new migration to Supabase with `npm run db:migrate` **before** deploying the code that needs it. Migrations so far:
   - `0000` the first tables
   - `0001` Grant Administrator entries
   - `0002` sheet snapshots
   - `0003` Raised by Team "set" flag and check-amount tracking
   - `0004` Ask Period link from reviews to asks
4. Commit, then fast-forward `main` and push to GitHub. Hostinger deploys from `main`.

## Where the logic lives

| Topic | File |
|---|---|
| Grant rules (age thresholds, categories, multipliers, awards) | `src/lib/grant.ts` |
| Building each application row, totals, check amount, HQ amount parsing | `src/lib/applications.ts` |
| Reading the Google Sheets and the column checks | `src/lib/sheets.ts` |
| Saving and loading database entries, Refresh Data's HQ copy | `src/lib/store.ts` |
| Server actions behind every save (with input checks) | `src/app/(admin)/actions.ts` |
| Exports: Applications CSV and the Fundraising Status table's contents / the Excel files (Grant Matching Report, Fundraising Status) | `src/lib/export.ts` / `src/lib/report.ts` |
| Ask Period subtotals (shared by the page and the Fundraising Status export) | `fundBreakdown` in `src/lib/applications.ts` |
| Subtotal rows below a scroll box, lined up with its columns | `src/components/AlignedFooter.tsx` |
| Sign in and sessions | `src/lib/auth.ts`, `src/lib/session.ts`, `src/proxy.ts` |
| Pages | `src/app/(admin)/…` |

## Keeping the software up to date

Run `npm audit --omit=dev` from time to time to check the site's software for known security problems. On Oct 23, 2026 Next.js was upgraded from 16.4.0 to 16.4.3 because of critical security advisories (GHSA-2464-fhr4-w9xw, GHSA-p3m5-59mp-jv5r, GHSA-673q-mjm6-r5xr). Next.js may also stop a build to warn about such an advisory. Three moderate advisories remain in the `uuid` package inside exceljs and Google's login library; they only matter when uuid is given a buffer to write into, which this site never does, and the only fix today would be a much older exceljs.

## Tests

`npm test` runs automated checks against a throwaway local database: the grant rules, totals against the spreadsheet mockup, ask periods (filter, amounts, removing an ask), the Grant Matching Report, the Applications CSV and the Fundraising Status Excel file (including subtotals and a Team Number that isn't one number), check-amount rules, HQ amount copying, saving and loading, and the sheet column checks.

## Change history

- **Oct 23, 2026:** Next.js 16.4.3 security upgrade and how to check for advisories; where the Ask Period subtotals, aligned subtotal rows and Excel files live; test list updated.
- **Oct 23, 2026:** Ask Period link (migration 0004); Grant Ask Tracker amounts no longer stored.
- **Oct 22, 2026:** Document created.
