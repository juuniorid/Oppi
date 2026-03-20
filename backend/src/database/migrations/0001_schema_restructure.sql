DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role')
     AND NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    ALTER TYPE "role" RENAME TO "user_role";
  END IF;
END $$;
--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'teacher_role') THEN
    CREATE TYPE "teacher_role" AS ENUM ('PEA', 'TAVA', 'ABI');
  END IF;
END $$;
--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'child_present') THEN
    CREATE TYPE "child_present" AS ENUM ('KOHAL', 'PUUDUB');
  END IF;
END $$;
--> statement-breakpoint

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'posts'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'group_posts'
  ) THEN
    ALTER TABLE "posts" RENAME TO "group_posts";
  END IF;
END $$;
--> statement-breakpoint

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'parents_to_children'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'child_users'
  ) THEN
    ALTER TABLE "parents_to_children" RENAME TO "child_users";
  END IF;
END $$;
--> statement-breakpoint

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'group_posts' AND column_name = 'content'
  ) THEN
    ALTER TABLE "group_posts" RENAME COLUMN "content" TO "message";
  END IF;
END $$;
--> statement-breakpoint

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'group_posts' AND column_name = 'author_id'
  ) THEN
    ALTER TABLE "group_posts" RENAME COLUMN "author_id" TO "created_by_user_id";
  END IF;
END $$;
--> statement-breakpoint

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'sender_id'
  ) THEN
    ALTER TABLE "messages" RENAME COLUMN "sender_id" TO "sender_user_id";
  END IF;
END $$;
--> statement-breakpoint

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'recipient_id'
  ) THEN
    ALTER TABLE "messages" RENAME COLUMN "recipient_id" TO "recipient_user_id";
  END IF;
END $$;
--> statement-breakpoint

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'content'
  ) THEN
    ALTER TABLE "messages" RENAME COLUMN "content" TO "body";
  END IF;
END $$;
--> statement-breakpoint

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'child_users' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE "child_users" RENAME COLUMN "parent_id" TO "user_id";
  END IF;
END $$;
--> statement-breakpoint

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "first_name" text,
  ADD COLUMN IF NOT EXISTS "last_name" text,
  ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz,
  ADD COLUMN IF NOT EXISTS "created_at" timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT now();
--> statement-breakpoint

ALTER TABLE "groups"
  ADD COLUMN IF NOT EXISTS "description" text,
  ADD COLUMN IF NOT EXISTS "age_min" integer,
  ADD COLUMN IF NOT EXISTS "age_max" integer,
  ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz,
  ADD COLUMN IF NOT EXISTS "created_at" timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT now();
--> statement-breakpoint

ALTER TABLE "children"
  ADD COLUMN IF NOT EXISTS "date_of_birth" date DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS "notes" text,
  ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz,
  ADD COLUMN IF NOT EXISTS "created_at" timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT now();
--> statement-breakpoint

ALTER TABLE "group_posts"
  ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz,
  ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT now();
--> statement-breakpoint

ALTER TABLE "messages"
  ADD COLUMN IF NOT EXISTS "subject" text,
  ADD COLUMN IF NOT EXISTS "read_at" timestamptz,
  ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz,
  ADD COLUMN IF NOT EXISTS "created_at" timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT now();
--> statement-breakpoint

ALTER TABLE "child_users"
  ADD COLUMN IF NOT EXISTS "relationship" text,
  ADD COLUMN IF NOT EXISTS "is_primary" boolean;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "group_users" (
  "group_id" integer NOT NULL,
  "user_id" integer NOT NULL,
  "role" "teacher_role",
  CONSTRAINT "group_users_group_id_user_id_pk" PRIMARY KEY ("group_id", "user_id")
);
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "group_users" ADD CONSTRAINT "group_users_group_id_groups_id_fk"
 FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "group_users" ADD CONSTRAINT "group_users_user_id_users_id_fk"
 FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "attendance" (
  "id" serial PRIMARY KEY NOT NULL,
  "child_id" integer NOT NULL,
  "date" date NOT NULL,
  "status" "child_present" NOT NULL,
  "note" text,
  "deleted_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "attendance" ADD CONSTRAINT "attendance_child_id_children_id_fk"
 FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "attendance_child_id_date_unique"
  ON "attendance" ("child_id", "date");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "enrollments" (
  "id" serial PRIMARY KEY NOT NULL,
  "child_id" integer NOT NULL,
  "group_id" integer NOT NULL,
  "start_date" date,
  "end_date" date,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_child_id_children_id_fk"
 FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_group_id_groups_id_fk"
 FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "post_media" (
  "id" serial PRIMARY KEY NOT NULL,
  "group_post_id" integer NOT NULL,
  "s3_key" text,
  "content_type" text,
  "deleted_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "post_media" ADD CONSTRAINT "post_media_group_post_id_group_posts_id_fk"
 FOREIGN KEY ("group_post_id") REFERENCES "public"."group_posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "group_messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "sender_user_id" integer NOT NULL,
  "subject" text,
  "body" text,
  "deleted_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "group_messages" ADD CONSTRAINT "group_messages_sender_user_id_users_id_fk"
 FOREIGN KEY ("sender_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "group_message_recipients" (
  "group_message_id" integer NOT NULL,
  "user_id" integer NOT NULL,
  "read_at" timestamptz,
  CONSTRAINT "group_message_recipients_group_message_id_user_id_pk"
    PRIMARY KEY ("group_message_id", "user_id")
);
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "group_message_recipients" ADD CONSTRAINT "group_message_recipients_group_message_id_group_messages_id_fk"
 FOREIGN KEY ("group_message_id") REFERENCES "public"."group_messages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "group_message_recipients" ADD CONSTRAINT "group_message_recipients_user_id_users_id_fk"
 FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

UPDATE "users"
SET
  "first_name" = CASE
    WHEN "first_name" IS NULL AND "name" LIKE '% %' THEN split_part("name", ' ', 1)
    WHEN "first_name" IS NULL THEN "name"
    ELSE "first_name"
  END,
  "last_name" = CASE
    WHEN "last_name" IS NULL AND "name" LIKE '% %'
      THEN substring("name" from position(' ' in "name") + 1)
    ELSE "last_name"
  END
WHERE EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'name'
);
--> statement-breakpoint

UPDATE "messages"
SET
  "created_at" = COALESCE("created_at", "timestamp" AT TIME ZONE 'UTC'),
  "updated_at" = COALESCE("updated_at", "timestamp" AT TIME ZONE 'UTC')
WHERE EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'timestamp'
);
--> statement-breakpoint

UPDATE "users"
SET
  "created_at" = COALESCE("created_at", now()),
  "updated_at" = COALESCE("updated_at", now());
--> statement-breakpoint

UPDATE "groups"
SET
  "created_at" = COALESCE("created_at", now()),
  "updated_at" = COALESCE("updated_at", now());
--> statement-breakpoint

UPDATE "children"
SET
  "date_of_birth" = COALESCE("date_of_birth", CURRENT_DATE),
  "created_at" = COALESCE("created_at", now()),
  "updated_at" = COALESCE("updated_at", now());
--> statement-breakpoint

UPDATE "group_posts"
SET
  "updated_at" = COALESCE("updated_at", now());
--> statement-breakpoint

INSERT INTO "enrollments" ("child_id", "group_id", "start_date", "created_at", "updated_at")
SELECT c."id", c."group_id", CURRENT_DATE, now(), now()
FROM "children" c
WHERE EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'children' AND column_name = 'group_id'
)
AND c."group_id" IS NOT NULL
AND NOT EXISTS (
  SELECT 1
  FROM "enrollments" e
  WHERE e."child_id" = c."id" AND e."group_id" = c."group_id"
);
--> statement-breakpoint

ALTER TABLE "users"
  ALTER COLUMN "created_at" SET NOT NULL,
  ALTER COLUMN "updated_at" SET NOT NULL;
--> statement-breakpoint

ALTER TABLE "groups"
  ALTER COLUMN "created_at" SET NOT NULL,
  ALTER COLUMN "updated_at" SET NOT NULL;
--> statement-breakpoint

ALTER TABLE "children"
  ALTER COLUMN "date_of_birth" SET NOT NULL,
  ALTER COLUMN "created_at" SET NOT NULL,
  ALTER COLUMN "updated_at" SET NOT NULL;
--> statement-breakpoint

ALTER TABLE "group_posts"
  ALTER COLUMN "updated_at" SET NOT NULL;
--> statement-breakpoint

ALTER TABLE "messages"
  ALTER COLUMN "created_at" SET NOT NULL,
  ALTER COLUMN "updated_at" SET NOT NULL;
--> statement-breakpoint

ALTER TABLE "children" DROP CONSTRAINT IF EXISTS "children_group_id_groups_id_fk";
--> statement-breakpoint

ALTER TABLE "users" DROP COLUMN IF EXISTS "name";
--> statement-breakpoint

ALTER TABLE "groups" DROP COLUMN IF EXISTS "kindergarten_name";
--> statement-breakpoint

ALTER TABLE "children" DROP COLUMN IF EXISTS "group_id";
--> statement-breakpoint

ALTER TABLE "messages" DROP COLUMN IF EXISTS "timestamp";
--> statement-breakpoint

ALTER TABLE "children" ALTER COLUMN "date_of_birth" DROP DEFAULT;
