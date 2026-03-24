// Runs before any module is imported in e2e tests.
// Points DATABASE_URL to the test DB so db.ts connects to the right instance.
if (!process.env['TEST_DATABASE_URL']) {
  throw new Error('TEST_DATABASE_URL must be set to run e2e tests');
}

process.env['DATABASE_URL'] = process.env['TEST_DATABASE_URL'];
process.env['NODE_ENV'] = 'test';
