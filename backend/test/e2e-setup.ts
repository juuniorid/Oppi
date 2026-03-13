import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

export default async function globalSetup(): Promise<void> {
  const url = process.env['TEST_DATABASE_URL'];
  if (!url) {
    throw new Error('TEST_DATABASE_URL must be set to run e2e tests');
  }

   
  const client = postgres(url, { max: 1, onnotice: () => {} });
  const db = drizzle(client);

  await migrate(db, {
    migrationsFolder: path.join(__dirname, '../src/database/migrations'),
  });

  await client.end();
}
