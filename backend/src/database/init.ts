import { db, client } from './db';

export async function initializeDatabase(): Promise<void> {
  try {
    console.log('Testing database connection...');
    const result = await db.execute(`SELECT 1 as id`);
    console.log('✅ Database connection successful');
    return;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  initializeDatabase().catch((error) => {
    console.error('Initialization failed:', error);
    process.exit(1);
  });
}

export default initializeDatabase;
