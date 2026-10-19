// Starts a self-contained local Postgres (no Docker needed) for development.
// Data lives in ./.local-pg. Leave this running in its own terminal.
// Port 54339 so it can run alongside the Event Registration site's local Postgres (54329).
import EmbeddedPostgres from "embedded-postgres";
import fs from "node:fs";
import path from "node:path";

const dir = path.resolve(".local-pg");
const port = Number(process.env.LOCAL_PG_PORT ?? 54339);

async function main() {
  const pg = new EmbeddedPostgres({
    databaseDir: dir,
    user: "postgres",
    password: "postgres",
    port,
    persistent: true,
    onLog: () => {},
  });
  const fresh = !fs.existsSync(path.join(dir, "PG_VERSION"));
  if (fresh) await pg.initialise();
  await pg.start();
  if (fresh) await pg.createDatabase("ftc_grant");
  console.log(`Local Postgres running: postgres://postgres:postgres@localhost:${port}/ftc_grant`);
  console.log("Press Ctrl+C to stop.");
  const stop = async () => {
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
