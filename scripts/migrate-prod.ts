// Applies any new migrations in drizzle/ to the PRODUCTION database. Run this just before
// pushing code that needs them. Migrations only make the approved table changes; data stays.
//   npm run db:migrate:prod
import { runMigrations } from "./migrate";
import { confirm, productionDatabaseUrl } from "./prod-db";

async function main() {
  const url = productionDatabaseUrl();
  await confirm(`This changes the PRODUCTION database's tables (${new URL(url).hostname}).`, "production");
  await runMigrations(url);
  console.log("Migrations applied to production.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
