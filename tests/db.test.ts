import { eq } from "drizzle-orm";
import { afterAll, expect, test } from "vitest";
import { inject } from "vitest";
import { createDb, createPool } from "@/db";
import { settings } from "@/db/schema";

const pool = createPool(inject("databaseUrl"), 2);
const db = createDb(pool);
afterAll(() => pool.end());

test("migrations create the settings table", async () => {
  await db.insert(settings).values({ key: "smoke", value: "ok" });
  const [row] = await db.select().from(settings).where(eq(settings.key, "smoke"));
  expect(row.value).toBe("ok");
});
