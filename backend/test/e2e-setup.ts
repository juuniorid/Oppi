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

   
  const client = postgres(url, { max: 1, connect_timeout: 5, onnotice: () => {} });
  const db = drizzle(client);

  // Wait for DB to be ready (tmpfs container may still be initializing)
  let lastError: unknown;
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      await migrate(db, {
        migrationsFolder: path.join(__dirname, '../src/database/migrations'),
      });
      lastError = undefined;
      break;
    } catch (err) {
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  await client.end();

  if (lastError) throw lastError;
}
