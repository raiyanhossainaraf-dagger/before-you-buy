CREATE TABLE "search_interest" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"normalized_query" text NOT NULL,
	"query_type" text NOT NULL,
	"matched_demo" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "search_interest_query_type_check" CHECK ("search_interest"."query_type" IN ('name', 'url'))
);
