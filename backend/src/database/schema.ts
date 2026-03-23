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
export const childPresentEnum = pgEnum('child_present', ['PRESENT', 'ABSENT']);
export const messageAudienceEnum = pgEnum('message_audience', [
  'DIRECT',
  'GROUP',
]);
export const relationshipEnum = pgEnum('relationship', [
  'MOTHER',
  'FATHER',
  'GUARDIAN',
]);

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

export const attendance = pgTable(
  'attendance',
  {
    id: serial('id').primaryKey(),
    childId: integer('child_id')
      .references(() => children.id)
      .notNull(),
    date: date('date', { mode: 'date' }).notNull(),
    status: childPresentEnum('status').notNull(),
    note: text('note'),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('attendance_child_id_date_unique').on(
      table.childId,
      table.date
    ),
  ]
);

export type Attendance = InferSelectModel<typeof attendance>;
export type NewAttendance = InferInsertModel<typeof attendance>;

export const userChildren = pgTable(
  'child_users',
  {
    childId: integer('child_id')
      .references(() => children.id, { onDelete: 'cascade' })
      .notNull(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    relationship: text('relationship'),
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

// Shared message envelope for direct and group messages
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  targetGroupId: integer('target_group_id').references(() => groups.id),
  audience: messageAudienceEnum('audience').default('DIRECT').notNull(),
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

export type Message = InferSelectModel<typeof messages>;
export type NewMessage = InferInsertModel<typeof messages>;

// Per-recipient delivery and read state for all messages
export const messageRecipients = pgTable(
  'message_recipients',
  {
    messageId: integer('message_id')
      .references(() => messages.id, { onDelete: 'cascade' })
      .notNull(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    readAt: timestamp('read_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [primaryKey({ columns: [table.messageId, table.userId] })]
);

export type MessageRecipient = InferSelectModel<typeof messageRecipients>;
export type NewMessageRecipient = InferInsertModel<typeof messageRecipients>;

export const usersRelations = relations(users, ({ many }) => ({
  childLinks: many(userChildren),
  groupLinks: many(groupUsers),
  groupPosts: many(posts),
  sentMessages: many(messages, { relationName: 'message_sender' }),
  messageRecipients: many(messageRecipients),
}));

export const childrenRelations = relations(children, ({ many }) => ({
  attendance: many(attendance),
  userLinks: many(userChildren),
  enrollments: many(enrollments),
}));

export const groupsRelations = relations(groups, ({ many }) => ({
  userLinks: many(groupUsers),
  enrollments: many(enrollments),
  posts: many(posts),
  messages: many(messages),
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

export const attendanceRelations = relations(attendance, ({ one }) => ({
  child: one(children, {
    fields: [attendance.childId],
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

export const messagesRelations = relations(messages, ({ one, many }) => ({
  sender: one(users, {
    fields: [messages.userId],
    references: [users.id],
    relationName: 'message_sender',
  }),
  targetGroup: one(groups, {
    fields: [messages.targetGroupId],
    references: [groups.id],
  }),
  recipients: many(messageRecipients),
}));

export const messageRecipientsRelations = relations(
  messageRecipients,
  ({ one }) => ({
    message: one(messages, {
      fields: [messageRecipients.messageId],
      references: [messages.id],
    }),
    user: one(users, {
      fields: [messageRecipients.userId],
      references: [users.id],
    }),
  })
);
