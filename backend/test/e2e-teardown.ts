import * as path from 'path';
import * as dotenv from 'dotenv';
import { clearDatabase } from './helpers/clear-database';

dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

export default async function globalTeardown(): Promise<void> {
  await clearDatabase();
}

