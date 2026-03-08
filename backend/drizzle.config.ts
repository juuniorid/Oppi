/// <reference types="node" />
import type { Config } from 'drizzle-kit';

export default {
  dialect: 'postgresql',
  schema: './src/database/schema.ts',
  out: './src/database/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://oppi:oppi@localhost:5432/oppi',
  } as any,
} as Config;
