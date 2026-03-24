import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const url = process.env.TEST_DATABASE_URL;
if (!url) {
  throw new Error('TEST_DATABASE_URL must be set to run e2e tests');
}

export const testClient = postgres(url, { idle_timeout: 1 });
export const testDb = drizzle(testClient);
