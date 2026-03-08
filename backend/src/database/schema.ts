import { pgTable, serial, text, integer, timestamp, pgEnum, primaryKey } from 'drizzle-orm/pg-core';
import { relations, InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const roleEnum = pgEnum('role', ['ADMIN', 'TEACHER', 'PARENT']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  googleId: text('google_id').notNull().unique(),
  role: roleEnum('role').notNull(),
  phone: text('phone'),
});

// User Types
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export const groups = pgTable('groups', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  kindergartenName: text('kindergarten_name').notNull(),
});

// Group Types
export type Group = InferSelectModel<typeof groups>;
export type NewGroup = InferInsertModel<typeof groups>;

export const children = pgTable('children', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  groupId: integer('group_id').references(() => groups.id).notNull(),
});

// Children Types
export type Child = InferSelectModel<typeof children>;
export type NewChild = InferInsertModel<typeof children>;

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: integer('author_id').references(() => users.id).notNull(),
  groupId: integer('group_id').references(() => groups.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Post Types
export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').references(() => users.id).notNull(),
  recipientId: integer('recipient_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Message Types
export type Message = InferSelectModel<typeof messages>;
export type NewMessage = InferInsertModel<typeof messages>;

export const parentsToChildren = pgTable('parents_to_children', {
  parentId: integer('parent_id').references(() => users.id).notNull(),
  childId: integer('child_id').references(() => children.id).notNull(),
}, (table) => ({
  pk: primaryKey(table.parentId, table.childId),
}));

// ParentToChild Types
export type ParentToChild = InferSelectModel<typeof parentsToChildren>;
export type NewParentToChild = InferInsertModel<typeof parentsToChildren>;

// Relations
export const usersRelations = relations(users, ({ many }: any) => ({
  posts: many(posts),
  sentMessages: many(messages, { relationName: 'sender' }),
  receivedMessages: many(messages, { relationName: 'recipient' }),
  parentRelations: many(parentsToChildren, { relationName: 'parent' }),
}));

export const groupsRelations = relations(groups, ({ many }: any) => ({
  children: many(children),
  posts: many(posts),
}));

export const childrenRelations = relations(children, ({ one, many }: any) => ({
  group: one(groups, { fields: [children.groupId], references: [groups.id] }),
  parentRelations: many(parentsToChildren, { relationName: 'child' }),
}));

export const postsRelations = relations(posts, ({ one }: any) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
  group: one(groups, { fields: [posts.groupId], references: [groups.id] }),
}));

export const messagesRelations = relations(messages, ({ one }: any) => ({
  sender: one(users, { fields: [messages.senderId], references: [users.id], relationName: 'sender' }),
  recipient: one(users, { fields: [messages.recipientId], references: [users.id], relationName: 'recipient' }),
}));

export const parentsToChildrenRelations = relations(parentsToChildren, ({ one }: any) => ({
  parent: one(users, { fields: [parentsToChildren.parentId], references: [users.id], relationName: 'parent' }),
  child: one(children, { fields: [parentsToChildren.childId], references: [children.id], relationName: 'child' }),
}));
