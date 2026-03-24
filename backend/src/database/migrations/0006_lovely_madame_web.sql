DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'child_users'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_children'
  ) THEN
    ALTER TABLE "child_users" RENAME TO "user_children";
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "user_children" DROP CONSTRAINT IF EXISTS "parents_to_children_child_id_children_id_fk";
--> statement-breakpoint
ALTER TABLE "user_children" DROP CONSTRAINT IF EXISTS "child_users_child_id_children_id_fk";
--> statement-breakpoint
ALTER TABLE "user_children" DROP CONSTRAINT IF EXISTS "user_children_child_id_children_id_fk";
--> statement-breakpoint
ALTER TABLE "user_children" DROP CONSTRAINT IF EXISTS "parents_to_children_parent_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_children" DROP CONSTRAINT IF EXISTS "child_users_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_children" DROP CONSTRAINT IF EXISTS "user_children_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_children" DROP CONSTRAINT IF EXISTS "parents_to_children_parent_id_child_id_pk";
--> statement-breakpoint
ALTER TABLE "user_children" DROP CONSTRAINT IF EXISTS "child_users_child_id_user_id_pk";
--> statement-breakpoint
ALTER TABLE "user_children" DROP CONSTRAINT IF EXISTS "user_children_child_id_user_id_pk";--> statement-breakpoint
ALTER TABLE "user_children" ADD CONSTRAINT "user_children_child_id_user_id_pk" PRIMARY KEY("child_id","user_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_children" ADD CONSTRAINT "user_children_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_children" ADD CONSTRAINT "user_children_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "public"."user_children" ALTER COLUMN "relationship" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."relationship";--> statement-breakpoint
CREATE TYPE "public"."relationship" AS ENUM('MOTHER', 'FATHER', 'GUARDIAN');--> statement-breakpoint
ALTER TABLE "public"."user_children" ALTER COLUMN "relationship" SET DATA TYPE "public"."relationship" USING CASE
  WHEN "relationship" IS NULL THEN NULL
  ELSE TRIM("relationship")::"public"."relationship"
END;
