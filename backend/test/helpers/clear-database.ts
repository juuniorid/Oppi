import { is, getTableName } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';
import * as schema from '../../src/database/schema';
import { testClient } from './test-db';

const tables = (Object.values(schema) as unknown[])
  .filter((v: unknown): v is PgTable => is(v, PgTable))
  .map((t) => getTableName(t))
  .join(', ');

export async function clearDatabase(): Promise<void> {
  await testClient.unsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`);
}
