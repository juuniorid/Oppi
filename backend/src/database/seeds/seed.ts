import { db, client } from '../db';
import { users, groups, children, parentsToChildren } from '../schema';

async function seed(): Promise<void> {
  try {
    console.log('🌱 Starting database seed...');

    // Insert groups
    const insertedGroups = await db.insert(groups).values([
      { name: 'Bumblebees', kindergartenName: 'Sunshine Kindergarten' },
      { name: 'Butterflies', kindergartenName: 'Sunshine Kindergarten' },
    ]).returning();

    console.log(`✅ Inserted ${insertedGroups.length} groups`);

    // Insert users (teachers and parents)
    const insertedUsers = await db.insert(users).values([
      {
        email: 'teacher1@example.com',
        name: 'Jane Smith',
        googleId: 'google-teacher-1',
        role: 'TEACHER',
        phone: '+372 5123 4567',
      },
      {
        email: 'parent1@example.com',
        name: 'John Doe',
        googleId: 'google-parent-1',
        role: 'PARENT',
        phone: '+372 5123 4568',
      },
      {
        email: 'parent2@example.com',
        name: 'Sarah Doe',
        googleId: 'google-parent-2',
        role: 'PARENT',
        phone: '+372 5123 4569',
      },
    ]).returning();

    console.log(`✅ Inserted ${insertedUsers.length} users`);

    // Insert children
    const insertedChildren = await db.insert(children).values([
      {
        firstName: 'Emma',
        lastName: 'Doe',
        groupId: insertedGroups[0]!.id,
      },
      {
        firstName: 'Oliver',
        lastName: 'Smith',
        groupId: insertedGroups[0]!.id,
      },
      {
        firstName: 'Ava',
        lastName: 'Johnson',
        groupId: insertedGroups[1]!.id,
      },
    ]).returning();

    console.log(`✅ Inserted ${insertedChildren.length} children`);

    // Link parents to children
    await db.insert(parentsToChildren).values([
      { parentId: insertedUsers[1]!.id, childId: insertedChildren[0]!.id },
      { parentId: insertedUsers[2]!.id, childId: insertedChildren[0]!.id },
    ]);

    console.log('✅ Linked parents to children');
    console.log('🌱 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
