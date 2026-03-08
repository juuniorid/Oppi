import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import { appConfig } from '../config';

const connectionString = appConfig.database.url;

// Use require for postgres to avoid ESM/CommonJS issues
const postgres = require('postgres');
const client = postgres(connectionString);

export const db = drizzle(client, { schema });
export type Database = typeof db;
export { client };
