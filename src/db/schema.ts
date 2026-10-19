import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Starter table so the migration workflow is in place. Add the grant tables here, then
// run `npm run db:generate` and commit the new file in drizzle/.
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
