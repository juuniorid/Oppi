// Set required env vars for unit tests so config.loader.ts doesn't throw at import time.
// The DB is never actually connected to in unit tests (services are mocked).
process.env['DATABASE_URL'] =
  process.env['DATABASE_URL'] ?? 'postgresql://oppi:oppi@localhost:5432/oppi';
process.env['JWT_SECRET'] = process.env['JWT_SECRET'] ?? 'test-secret';
