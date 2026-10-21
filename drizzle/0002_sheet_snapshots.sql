CREATE TABLE "sheet_snapshots" (
	"source" text PRIMARY KEY NOT NULL,
	"headers" jsonb NOT NULL,
	"rows" jsonb NOT NULL,
	"refreshed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sheet_snapshots_source_check" CHECK ("sheet_snapshots"."source" in ('responses', 'biobuzz'))
);
--> statement-breakpoint
ALTER TABLE "sheet_snapshots" ENABLE ROW LEVEL SECURITY;
