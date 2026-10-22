ALTER TABLE "application_reviews" ADD COLUMN "raised_set" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "application_reviews" ADD COLUMN "check_amount_for" integer;--> statement-breakpoint
-- The Raised by Team and Amount of Check values entered so far were test data: clear them so
-- the next refresh copies each team's HQ grant amount and checks follow Possible Grant Award.
UPDATE "application_reviews" SET "raised" = NULL, "raised_updated_on" = NULL, "check_amount" = NULL;
