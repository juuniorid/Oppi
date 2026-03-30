CREATE TYPE "public"."role" AS ENUM('ADMIN', 'TEACHER', 'PARENT');--> statement-breakpoint
ALTER TYPE "public"."child_present" RENAME TO "child_absence";--> statement-breakpoint
ALTER TYPE "public"."relationship" RENAME TO "relationshipEnum";--> statement-breakpoint
ALTER TABLE "attendance" RENAME TO "absences";--> statement-breakpoint
ALTER TABLE "absences" DROP CONSTRAINT "attendance_child_id_children_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "attendance_child_id_date_unique";--> statement-breakpoint
ALTER TABLE "absences" ADD COLUMN "user_id" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "absences" ADD CONSTRAINT "absences_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "absences" ADD CONSTRAINT "absences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "absences_child_id_date_unique" ON "absences" USING btree ("child_id","date");