ALTER TABLE "child_users" DROP CONSTRAINT IF EXISTS "child_users_child_id_children_id_fk";
--> statement-breakpoint
ALTER TABLE "child_users" DROP CONSTRAINT IF EXISTS "parents_to_children_child_id_children_id_fk";
--> statement-breakpoint
ALTER TABLE "child_users" DROP CONSTRAINT IF EXISTS "child_users_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "child_users" DROP CONSTRAINT IF EXISTS "parents_to_children_parent_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "group_message_recipients" DROP CONSTRAINT IF EXISTS "group_message_recipients_group_message_id_group_messages_id_fk";
--> statement-breakpoint
ALTER TABLE "group_message_recipients" DROP CONSTRAINT IF EXISTS "group_message_recipients_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "group_users" DROP CONSTRAINT IF EXISTS "group_users_group_id_groups_id_fk";
--> statement-breakpoint
ALTER TABLE "group_users" DROP CONSTRAINT IF EXISTS "group_users_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "post_media" DROP CONSTRAINT IF EXISTS "post_media_group_post_id_group_posts_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "child_users" ADD CONSTRAINT "child_users_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "child_users" ADD CONSTRAINT "child_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_message_recipients" ADD CONSTRAINT "group_message_recipients_group_message_id_group_messages_id_fk" FOREIGN KEY ("group_message_id") REFERENCES "public"."group_messages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_message_recipients" ADD CONSTRAINT "group_message_recipients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_users" ADD CONSTRAINT "group_users_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_users" ADD CONSTRAINT "group_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_media" ADD CONSTRAINT "post_media_group_post_id_group_posts_id_fk" FOREIGN KEY ("group_post_id") REFERENCES "public"."group_posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
