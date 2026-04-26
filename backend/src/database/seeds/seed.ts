import { db, client } from '../db';
import {
  users,
  groups,
  children,
  userChildren,
  notifications,
  notificationRecipients,
  ROLE,
} from '../schema';
import { and, eq } from 'drizzle-orm';

async function seed(): Promise<void> {
  try {
    console.warn('🌱 Starting database seed...');

    // 1. Insert groups (using onConflictDoNothing on the ID or just checking)
    // Note: If your schema doesn't have a unique constraint on 'name',
    // it's safer to check first to avoid duplicates.
    let allGroups = await db.select().from(groups);
    if (allGroups.length === 0) {
      allGroups = await db
        .insert(groups)
        .values([
          { name: 'Bumblebees', kindergartenName: 'Sunshine Kindergarten' },
          { name: 'Butterflies', kindergartenName: 'Sunshine Kindergarten' },
        ])
        .returning();
      console.warn(`✅ Inserted ${allGroups.length} groups`);
    } else {
      console.warn('ℹ️ Groups already exist, skipping group insert');
    }

    // 2. Insert users (teachers and parents)
    // We use onConflictDoNothing on the email column
    const insertedUsers = await db
      .insert(users)
      .values([
        {
          email: 'teacher1@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          googleId: 'google-teacher-1',
          role: ROLE.Teacher,
          phone: '+372 5123 4567',
        },
        {
          email: 'parent1@example.com',
          firstName: 'John',
          lastName: 'Doe',
          googleId: 'google-parent-1',
          role: ROLE.Parent,
          phone: '+372 5123 4568',
        },
        {
          email: 'parent2@example.com',
          firstName: 'Sarah',
          lastName: 'Doe',
          googleId: 'google-parent-2',
          role: ROLE.Parent,
          phone: '+372 5123 4569',
        },
      ])
      .onConflictDoNothing({ target: users.email })
      .returning();

    // FALLBACK: If insertedUsers is empty, fetch them from the DB so we have the IDs
    const allUsers =
      insertedUsers.length > 0 ? insertedUsers : await db.select().from(users);

    console.warn(`✅ Users ready (Total: ${allUsers.length})`);

    // 3. Insert children
    // Link to the IDs we just got
    const insertedChildren = await db
      .insert(children)
      .values([
        {
          firstName: 'Emma',
          lastName: 'Doe',
          dateOfBirth: new Date('2020-05-14'),
          notes: 'Allergic to strawberries',
        },
        {
          firstName: 'Oliver',
          lastName: 'Smith',
          dateOfBirth: new Date('2020-01-22'),
        },
        {
          firstName: 'Ava',
          lastName: 'Johnson',
          dateOfBirth: new Date('2019-10-03'),
        },
      ])

      .onConflictDoNothing()
      .returning();

    const allChildren =
      insertedChildren.length > 0
        ? insertedChildren
        : await db.select().from(children);

    console.warn(`✅ Children ready (Total: ${allChildren.length})`);

    // 4. Link parents to children
    // We find the specific parents in our 'allUsers' list
    const parent1 = allUsers.find((u) => u.email === 'parent1@example.com');
    const parent2 = allUsers.find((u) => u.email === 'parent2@example.com');
    const emma = allChildren.find((c) => c.firstName === 'Emma');

    if (parent1 && parent2 && emma) {
      await db
        .insert(userChildren)
        .values([
          { userId: parent1.id, childId: emma.id },
          { userId: parent2.id, childId: emma.id },
        ])
        .onConflictDoNothing();
      console.warn('✅ Linked parents to children');
    }

    // 5. Seed example notifications for admin so bell/feed behavior is visible.
    const adminUser = allUsers.find(
      (u) => u.email.toLowerCase() === 'vikationu@gmail.com'
    );

    if (adminUser) {
      const existingAdminSeedNotification = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, adminUser.id),
            eq(
              notifications.subject,
              'System test: unread notification for admin'
            )
          )
        )
        .limit(1);

      if (existingAdminSeedNotification.length === 0) {
        const createdNotifications = await db
          .insert(notifications)
          .values([
            {
              userId: adminUser.id,
              audience: 'DIRECT',
              subject: 'System test: unread notification for admin',
              body: 'This seeded unread notification helps verify the header bell badge.',
            },
            {
              userId: adminUser.id,
              audience: 'DIRECT',
              subject: 'System test: read notification for admin',
              body: 'This seeded read notification helps verify read/unread UI states.',
            },
          ])
          .returning();

        if (createdNotifications.length > 0) {
          await db.insert(notificationRecipients).values(
            createdNotifications.map((item, index) => ({
              notificationId: item.id,
              userId: adminUser.id,
              readAt: index === 0 ? null : new Date(),
            }))
          );
        }

        console.warn('✅ Seeded admin test notifications');
      } else {
        console.warn('ℹ️ Admin test notifications already exist, skipping insert');
      }
    } else {
      console.warn('ℹ️ Admin user not found, skipping admin notification seed');
    }

    console.warn('🌱 Seed process finished!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seed().catch((error) => {
  console.error('Seed execution failed:', error);
  process.exit(1);
});
