CREATE TABLE "application_reviews" (
	"response_timestamp" text PRIMARY KEY NOT NULL,
	"title1" text,
	"letter_received" text,
	"volunteering" text,
	"qualified_purchase" text,
	"vrs_completed" text,
	"approved" text,
	"notes" text DEFAULT '' NOT NULL,
	"raised" integer,
	"raised_updated_on" date,
	"check_amount" integer,
	"check_number" text,
	"check_mailed_on" date,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "application_reviews_title1_check" CHECK ("title1" in ('Yes', 'No')),
	CONSTRAINT "application_reviews_letter_received_check" CHECK ("letter_received" in ('Yes', 'No')),
	CONSTRAINT "application_reviews_volunteering_check" CHECK ("volunteering" in ('Yes', 'No')),
	CONSTRAINT "application_reviews_qualified_purchase_check" CHECK ("qualified_purchase" in ('Yes', 'No')),
	CONSTRAINT "application_reviews_vrs_completed_check" CHECK ("application_reviews"."vrs_completed" in ('Yes', 'In Progress', 'No')),
	CONSTRAINT "application_reviews_approved_check" CHECK ("application_reviews"."approved" in ('Yes', 'Under Review', 'No')),
	CONSTRAINT "application_reviews_amounts_check" CHECK ("application_reviews"."raised" >= 0 and "application_reviews"."check_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "email_log" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "email_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"email_date" date NOT NULL,
	"team_number" integer NOT NULL,
	"recipient" text NOT NULL,
	"purpose" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "email_log_purpose_check" CHECK ("email_log"."purpose" in ('Additional Info Needed', 'Grant Award', 'Other'))
);
--> statement-breakpoint
CREATE TABLE "grant_asks" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "grant_asks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"position" integer NOT NULL,
	"name" text NOT NULL,
	"start_date" date,
	"end_date" date,
	"cumulative" integer,
	"ask" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "grant_asks_amounts_check" CHECK ("grant_asks"."cumulative" >= 0 and "grant_asks"."ask" >= 0)
);
--> statement-breakpoint
CREATE INDEX "email_log_team_purpose_idx" ON "email_log" USING btree ("team_number","purpose");--> statement-breakpoint
ALTER TABLE "application_reviews" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "email_log" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "grant_asks" ENABLE ROW LEVEL SECURITY;
