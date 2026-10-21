# Deploying: Supabase + Hostinger

The site is a plain Node.js app (`next build --webpack` with `output: "standalone"`) talking to a Supabase
Postgres database and sending mail through Hostinger SMTP. Same setup as the Event Registration site,
but with its **own** Supabase project, mailbox and Hostinger website.

## 1. Create the Supabase project

1. The project is **FTC IL Grant Project** (ref `uyyighbxmkhoussrleug`, us-west-2), separate from Event
   Registration's. Keep its database password in your password manager.
2. **Project Settings → Database → Connection string → URI.** Use the **Session pooler** string
   (port 5432; works over IPv4).
3. From this project folder, point a temporary env at Supabase and create the tables:

   ```bash
   # .env.local
   DATABASE_URL=postgresql://postgres.<ref>:<password>@...pooler.supabase.com:5432/postgres
   DATABASE_SSL=true

   npm run db:migrate
   npm run db:seed       # loads the sample entries; skip for a clean start
   ```

   The site saves through this server-side connection only. Every table has row-level security on
   with no policies, so Supabase's public API (and the publishable key) can't read or change data.

4. Optional: add a `.mcp.json` pointing Claude Code's Supabase MCP at the new project ref, as in the
   Event Registration project.

## 2. Set up the Hostinger mailbox (if the site sends email)

hPanel → **Emails** → create a mailbox. SMTP: host `smtp.hostinger.com`, port `465`, SSL, username =
full email address. Check SPF/DKIM in hPanel → Emails → DNS settings.

## 3. Deploy the app on Hostinger (Node.js Web App)

1. hPanel → **Websites → Add website → Node.js Web App**. Connect the GitHub repo
   `bkramer01/FTC-IL-Grant`, branch `main`.
2. Settings:
   - Node.js version: **22 LTS** (20 or newer)
   - Install command: `npm ci`
   - Build command: `npm run build`
   - Start command: `node .next/standalone/server.js`
   - Port: whatever Hostinger assigns (the server reads `PORT`; set `HOSTNAME=0.0.0.0` if asked)
3. Environment variables (from `.env.example`):

   ```
   NODE_ENV=production
   DATABASE_URL=<Supabase session pooler URI>   # required: the site loads and saves entries here
   DATABASE_SSL=true
   SESSION_SECRET=<64 random hex chars>
   GOOGLE_SERVICE_ACCOUNT_KEY=<service account key, base64; see below>
   EMAIL_TRANSPORT=smtp
   SMTP_HOST=smtp.hostinger.com
   SMTP_PORT=465
   SMTP_USER=<mailbox>
   SMTP_PASSWORD=<mailbox password>
   EMAIL_FROM=FTC Illinois Grants <mailbox>
   APP_URL=https://<your grant domain>
   ```

   Generate secrets with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
4. Deploy, attach the domain or subdomain, and turn on the free SSL certificate.

## Notes

- Schema changes: edit `src/db/schema.ts`, run `npm run db:generate`, commit the new file in
  `drizzle/`, and run `npm run db:migrate` against Supabase **before** deploying the new code.

## Google Sheets access (Refresh Data)

Refresh Data reads both Google Sheets as the service account
`ftc-grant-sheets-reader@project-115d3a43-e62e-443b-8d5.iam.gserviceaccount.com` (Google Cloud project
`project-115d3a43-e62e-443b-8d5`, Google Sheets API enabled). Both sheets must be shared with that
email as **Viewer**.

The key file `google-service-account.json` lives only in the project folder (git-ignored). For
Hostinger, copy it as one line of base64 and paste it as `GOOGLE_SERVICE_ACCOUNT_KEY`:

```bash
node -e "process.stdout.write(Buffer.from(require('fs').readFileSync('google-service-account.json')).toString('base64'))" | clip
```

(`clip` copies to the Windows clipboard; on a Mac use `pbcopy`.)
