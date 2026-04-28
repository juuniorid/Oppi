#!/bin/sh

set -e

echo "⏳ Waiting for database to be ready..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done

echo "✅ Database is ready"

echo "🔄 Generating migrations..."
pnpm run db:generate

echo "🔄 Running migrations..."
pnpm run db:migrate

echo "🔍 Checking if database already has data..."
SHOULD_SEED=$(node - <<'NODE'
const postgres = require('postgres');

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log('false');
    return;
  }

  const sql = postgres(url, { max: 1, connect_timeout: 5, onnotice: () => {} });
  try {
    const rows = await sql`select count(*) as cnt from users`;
    const hasData = parseInt(rows?.[0]?.cnt ?? '0', 10) > 0;
    console.log(hasData ? 'false' : 'true');
  } catch {
    // Table doesn't exist yet or query failed — safe to seed.
    console.log('true');
  } finally {
    await sql.end();
  }
}

main();
NODE
)

if [ "$SHOULD_SEED" = "true" ]; then
  echo "🌱 Seeding database (new database detected)..."
  pnpm run db:seed
else
  echo "⏭️ Skipping seed (database already initialized)"
fi

echo "🧹 Clearing build artifacts..."
rm -rf dist
find . -name '*.tsbuildinfo' -delete

if [ "$NODE_ENV" = "production" ]; then
  echo "🔨 Building application..."
  pnpm run build

  echo "🚀 Starting application..."
  node dist/src/main
else
  echo "🚀 Starting application in watch mode..."
  pnpm run start:dev
fi
