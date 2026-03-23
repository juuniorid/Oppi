DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_audience') THEN
    CREATE TYPE "public"."message_audience" AS ENUM ('DIRECT', 'GROUP');
  END IF;
END $$;
--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relationship') THEN
    CREATE TYPE "public"."relationship" AS ENUM ('MOTHER ', 'FATHER', 'GUARDIAN');
  END IF;
END $$;
--> statement-breakpoint

ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_sender_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_sender_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_recipient_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "group_posts" DROP CONSTRAINT IF EXISTS "group_posts_created_by_user_id_users_id_fk";
--> statement-breakpoint

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'messages'
      AND column_name = 'sender_user_id'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'messages'
      AND column_name = 'user_id'
  ) THEN
    ALTER TABLE "messages" RENAME COLUMN "sender_user_id" TO "user_id";
  END IF;
END $$;
--> statement-breakpoint

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'group_posts'
      AND column_name = 'created_by_user_id'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'group_posts'
      AND column_name = 'user_id'
  ) THEN
    ALTER TABLE "group_posts" RENAME COLUMN "created_by_user_id" TO "user_id";
  END IF;
END $$;
--> statement-breakpoint

ALTER TABLE "groups" ALTER COLUMN "age_min" SET DATA TYPE text;
--> statement-breakpoint
ALTER TABLE "groups" ALTER COLUMN "age_max" SET DATA TYPE text;
--> statement-breakpoint

ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "target_group_id" integer;
--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "audience" "message_audience" DEFAULT 'DIRECT' NOT NULL;
--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "body" DROP NOT NULL;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "message_recipients" (
  "message_id" integer NOT NULL,
  "user_id" integer NOT NULL,
  "read_at" timestamptz,
  CONSTRAINT "message_recipients_message_id_user_id_pk"
    PRIMARY KEY ("message_id", "user_id")
);
--> statement-breakpoint

INSERT INTO "message_recipients" ("message_id", "user_id", "read_at")
SELECT "id", "recipient_user_id", "read_at"
FROM "messages"
WHERE "recipient_user_id" IS NOT NULL
ON CONFLICT ("message_id", "user_id") DO NOTHING;
--> statement-breakpoint

DROP TABLE IF EXISTS "group_message_recipients";
--> statement-breakpoint
DROP TABLE IF EXISTS "group_messages";
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "message_recipients" ADD CONSTRAINT "message_recipients_message_id_messages_id_fk"
 FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "message_recipients" ADD CONSTRAINT "message_recipients_user_id_users_id_fk"
 FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_users_id_fk"
 FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_target_group_id_groups_id_fk"
 FOREIGN KEY ("target_group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "group_posts" ADD CONSTRAINT "group_posts_user_id_users_id_fk"
 FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

ALTER TABLE "messages" DROP COLUMN IF EXISTS "recipient_user_id";
--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN IF EXISTS "read_at";
--> statement-breakpoint

ALTER TABLE "public"."attendance" ALTER COLUMN "status" SET DATA TYPE text;
--> statement-breakpoint
DROP TYPE "public"."child_present";
--> statement-breakpoint
CREATE TYPE "public"."child_present" AS ENUM('PRESENT', 'ABSENT');
--> statement-breakpoint
ALTER TABLE "public"."attendance" ALTER COLUMN "status" SET DATA TYPE "public"."child_present" USING "status"::"public"."child_present";
--> statement-breakpoint
ALTER TABLE "public"."group_users" ALTER COLUMN "role" SET DATA TYPE text;
--> statement-breakpoint
DROP TYPE "public"."teacher_role";
--> statement-breakpoint
CREATE TYPE "public"."teacher_role" AS ENUM('HEAD', 'GENERAL', 'ASSISTANT');
--> statement-breakpoint
ALTER TABLE "public"."group_users" ALTER COLUMN "role" SET DATA TYPE "public"."teacher_role" USING "role"::"public"."teacher_role";
