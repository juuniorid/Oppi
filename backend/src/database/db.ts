import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { appConfig } from '../config';

const connectionString = appConfig.database.url;

const client = postgres(connectionString, {
  idle_timeout: process.env.NODE_ENV === 'test' ? 1 : undefined,
});

export const db = drizzle(client, { schema });
export type Database = typeof db;
export { client };
