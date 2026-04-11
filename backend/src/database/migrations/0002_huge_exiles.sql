-- 1. Rename existing notification-related entities
ALTER TYPE "public"."message_audience" RENAME TO "notification_audience";--> statement-breakpoint
ALTER TABLE "messages" RENAME TO "notifications";--> statement-breakpoint
ALTER TABLE "message_recipients" RENAME TO "notification_recipients";--> statement-breakpoint

-- 2. Update Constraints and Columns for renamed tables
ALTER TABLE "notification_recipients" RENAME CONSTRAINT "message_recipients_message_id_messages_id_fk" TO "notification_recipients_notification_id_notifications_id_fk";--> statement-breakpoint
ALTER TABLE "notification_recipients" RENAME CONSTRAINT "message_recipients_user_id_users_id_fk" TO "notification_recipients_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "notification_recipients" RENAME COLUMN "message_id" TO "notification_id";--> statement-breakpoint

ALTER TABLE "notifications" RENAME CONSTRAINT "messages_user_id_users_id_fk" TO "notifications_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "notifications" RENAME CONSTRAINT "messages_target_group_id_groups_id_fk" TO "notifications_target_group_id_groups_id_fk";--> statement-breakpoint

-- 3. Create NEW Chat Tables
CREATE TABLE IF NOT EXISTS "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"is_group" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversation_participants" (
	"conversation_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversation_participants_conversation_id_user_id_pk" PRIMARY KEY("conversation_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint

-- 4. Add Foreign Keys for NEW Chat Tables
DO $$ BEGIN
 ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;