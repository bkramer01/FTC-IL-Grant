ALTER TABLE "application_reviews" ADD COLUMN "ask_id" bigint;--> statement-breakpoint
ALTER TABLE "application_reviews" ADD CONSTRAINT "application_reviews_ask_id_grant_asks_id_fk" FOREIGN KEY ("ask_id") REFERENCES "public"."grant_asks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "application_reviews_ask_idx" ON "application_reviews" USING btree ("ask_id");