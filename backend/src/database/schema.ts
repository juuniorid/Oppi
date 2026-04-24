import {
  pgEnum,
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  date,
  boolean,
  primaryKey,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations, InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'TEACHER', 'PARENT']);
export const teacherRoleEnum = pgEnum('teacher_role', [
  'HEAD',
  'GENERAL',
  'ASSISTANT',
]);
export type TeacherRoleType = (typeof teacherRoleEnum.enumValues)[number];
export const TEACHER_ROLE: Record<string, TeacherRoleType> = {
  Head: 'HEAD',
  General: 'GENERAL',
  Assistant: 'ASSISTANT',
};
export const absenceEnum = pgEnum('child_absence', ['PRESENT', 'ABSENT']);
export type AbsenceEnum = (typeof absenceEnum.enumValues)[number];
export const ABSENCE_ENUM: Record<string, AbsenceEnum> = {
  Present: 'PRESENT',
  Absent: 'ABSENT',
};
export const notificationAudienceEnum = pgEnum('notification_audience', [
  'DIRECT',
  'GROUP',
]);
export const relationshipEnum = pgEnum('relationshipEnum', ['MOTHER', 'FATHER', 'GUARDIAN']);
export type RelationshipEnum = (typeof relationshipEnum.enumValues)[number];
export const RELATIONSHIP_ENUM: Record<string, RelationshipEnum> = {
  Mother: 'MOTHER',
  Father: 'FATHER',
  Guardian: 'GUARDIAN',
};

export const roleEnum = pgEnum('role', ['ADMIN', 'TEACHER', 'PARENT']);
export type RoleType = (typeof roleEnum.enumValues)[number];
export const ROLE: Record<string, RoleType> = {
  Admin: 'ADMIN',
  Teacher: 'TEACHER',
  Parent: 'PARENT',
};

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  role: userRoleEnum('role').notNull(),
  phone: text('phone'),
  email: text('email').notNull().unique(),
  googleId: text('google_id').unique(),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
});

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export const children = pgTable('children', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  dateOfBirth: date('date_of_birth', { mode: 'date' }).notNull(),
  notes: text('notes'),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
});

export type Child = InferSelectModel<typeof children>;
export type NewChild = InferInsertModel<typeof children>;

export const groups = pgTable('groups', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  ageMin: text('age_min'),
  ageMax: text('age_max'),
  kindergartenName: text('kindergarten_name'),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
});

export type Group = InferSelectModel<typeof groups>;
export type NewGroup = InferInsertModel<typeof groups>;

export const groupUsers = pgTable(
  'group_users',
  {
    groupId: integer('group_id')
      .references(() => groups.id, { onDelete: 'cascade' })
      .notNull(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    role: teacherRoleEnum('role'),
  },
  (table) => [primaryKey({ columns: [table.groupId, table.userId] })]
);

export type GroupUser = InferSelectModel<typeof groupUsers>;
export type NewGroupUser = InferInsertModel<typeof groupUsers>;

export const absences = pgTable(
  'absences',
  {
    id: serial('id').primaryKey(),
    childId: integer('child_id')
      .references(() => children.id)
      .notNull(),
    date: date('date', { mode: 'date' }).notNull(),
    status: absenceEnum('status').notNull(),
    note: text('note'),
    userId: integer('user_id')
      .references(() => users.id)
      .notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('absences_child_id_date_unique').on(
      table.childId,
      table.date
    ),
  ]
);

export type Absence = InferSelectModel<typeof absences>;
export type NewAbsence = InferInsertModel<typeof absences>;

export const userChildren = pgTable(
  'user_children',
  {
    childId: integer('child_id')
      .references(() => children.id, { onDelete: 'cascade' })
      .notNull(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    relationship: relationshipEnum('relationship'),
    isPrimary: boolean('is_primary'),
  },
  (table) => [primaryKey({ columns: [table.childId, table.userId] })]
);

export type ChildUser = InferSelectModel<typeof userChildren>;
export type NewUserChildren = InferInsertModel<typeof userChildren>;

export const enrollments = pgTable('enrollments', {
  id: serial('id').primaryKey(),
  childId: integer('child_id')
    .references(() => children.id)
    .notNull(),
  groupId: integer('group_id')
    .references(() => groups.id)
    .notNull(),
  startDate: date('start_date', { mode: 'date' }),
  endDate: date('end_date', { mode: 'date' }),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
});

export type Enrollment = InferSelectModel<typeof enrollments>;
export type NewEnrollment = InferInsertModel<typeof enrollments>;

// Announcements / posts for a group
export const posts = pgTable('group_posts', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id')
    .references(() => groups.id)
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
});

export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;

export const postMedia = pgTable('post_media', {
  id: serial('id').primaryKey(),
  groupPostId: integer('group_post_id')
    .references(() => posts.id, { onDelete: 'cascade' })
    .notNull(),
  s3Key: text('s3_key'),
  contentType: text('content_type'),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
});

export type PostMedia = InferSelectModel<typeof postMedia>;
export type NewPostMedia = InferInsertModel<typeof postMedia>;

// Shared notification envelope for direct and group notifications
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  targetGroupId: integer('target_group_id').references(() => groups.id),
  audience: notificationAudienceEnum('audience').default('DIRECT').notNull(),
  subject: text('subject'),
  body: text('body'),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
});

export type Notification = InferSelectModel<typeof notifications>;
export type NewNotification = InferInsertModel<typeof notifications>;

// Per-recipient delivery and read state for all notifications
export const notificationRecipients = pgTable(
  'notification_recipients',
  {
    notificationId: integer('notification_id')
      .references(() => notifications.id, { onDelete: 'cascade' })
      .notNull(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    readAt: timestamp('read_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [primaryKey({ columns: [table.notificationId, table.userId] })]
);

export type NotificationRecipient = InferSelectModel<typeof notificationRecipients>;
export type NewNotificationRecipient = InferInsertModel<typeof notificationRecipients>;

// Chat Conversations
export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  name: text('name'),
  isGroup: boolean('is_group').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
});

export type Conversation = InferSelectModel<typeof conversations>;
export type NewConversation = InferInsertModel<typeof conversations>;

export const conversationParticipants = pgTable(
  'conversation_participants',
  {
    conversationId: integer('conversation_id')
      .references(() => conversations.id, { onDelete: 'cascade' })
      .notNull(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    joinedAt: timestamp('joined_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    lastReadAt: timestamp('last_read_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [primaryKey({ columns: [table.conversationId, table.userId] })]
);

export type ConversationParticipant = InferSelectModel<typeof conversationParticipants>;
export type NewConversationParticipant = InferInsertModel<typeof conversationParticipants>;

// Chat Messages
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id')
    .references(() => conversations.id, { onDelete: 'cascade' })
    .notNull(),
  senderId: integer('sender_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
});

export type Message = InferSelectModel<typeof messages>;
export type NewMessage = InferInsertModel<typeof messages>;



export const usersRelations = relations(users, ({ many }) => ({
  childLinks: many(userChildren),
  groupLinks: many(groupUsers),
  groupPosts: many(posts),
  sentNotifications: many(notifications, { relationName: 'notification_sender' }),
  notificationRecipients: many(notificationRecipients),
  conversationLinks: many(conversationParticipants),
  sentMessages: many(messages, { relationName: 'message_sender' }),
}));

export const childrenRelations = relations(children, ({ many }) => ({
  absences: many(absences),
  userLinks: many(userChildren),
  enrollments: many(enrollments),
}));

export const groupsRelations = relations(groups, ({ many }) => ({
  userLinks: many(groupUsers),
  enrollments: many(enrollments),
  posts: many(posts),
  notifications: many(notifications),
}));

export const groupUsersRelations = relations(groupUsers, ({ one }) => ({
  group: one(groups, {
    fields: [groupUsers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupUsers.userId],
    references: [users.id],
  }),
}));

export const absencesRelations = relations(absences, ({ one }) => ({
  child: one(children, {
    fields: [absences.childId],
    references: [children.id],
  }),
}));

export const userChildrenRelations = relations(userChildren, ({ one }) => ({
  child: one(children, {
    fields: [userChildren.childId],
    references: [children.id],
  }),
  user: one(users, {
    fields: [userChildren.userId],
    references: [users.id],
  }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  child: one(children, {
    fields: [enrollments.childId],
    references: [children.id],
  }),
  group: one(groups, {
    fields: [enrollments.groupId],
    references: [groups.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  group: one(groups, {
    fields: [posts.groupId],
    references: [groups.id],
  }),
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  media: many(postMedia),
}));

export const postMediaRelations = relations(postMedia, ({ one }) => ({
  post: one(posts, {
    fields: [postMedia.groupPostId],
    references: [posts.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one, many }) => ({
  sender: one(users, {
    fields: [notifications.userId],
    references: [users.id],
    relationName: 'notification_sender',
  }),
  targetGroup: one(groups, {
    fields: [notifications.targetGroupId],
    references: [groups.id],
  }),
  recipients: many(notificationRecipients),
}));

export const notificationRecipientsRelations = relations(
  notificationRecipients,
  ({ one }) => ({
    notification: one(notifications, {
      fields: [notificationRecipients.notificationId],
      references: [notifications.id],
    }),
    user: one(users, {
      fields: [notificationRecipients.userId],
      references: [users.id],
    }),
  })
);

export const conversationsRelations = relations(conversations, ({ many }) => ({
  participants: many(conversationParticipants),
  messages: many(messages),
}));

export const conversationParticipantsRelations = relations(
  conversationParticipants,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [conversationParticipants.conversationId],
      references: [conversations.id],
    }),
    user: one(users, {
      fields: [conversationParticipants.userId],
      references: [users.id],
    }),
  })
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: 'message_sender',
  }),
}));
