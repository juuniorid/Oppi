import { clearDatabase } from './helpers/clear-database';

afterEach(async () => {
  await clearDatabase();
});

