ALTER TABLE "child_users" RENAME TO "user_children";--> statement-breakpoint
ALTER TABLE "user_children" DROP CONSTRAINT "child_users_child_id_children_id_fk";
--> statement-breakpoint
ALTER TABLE "user_children" DROP CONSTRAINT "child_users_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_children" DROP CONSTRAINT "child_users_child_id_user_id_pk";--> statement-breakpoint
ALTER TABLE "user_children" ALTER COLUMN "relationship" SET DATA TYPE relationship;--> statement-breakpoint
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
DROP TYPE "public"."relationship";--> statement-breakpoint
CREATE TYPE "public"."relationship" AS ENUM('MOTHER', 'FATHER', 'GUARDIAN');--> statement-breakpoint
ALTER TABLE "public"."user_children" ALTER COLUMN "relationship" SET DATA TYPE "public"."relationship" USING "relationship"::"public"."relationship";