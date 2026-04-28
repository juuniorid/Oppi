#!/bin/bash
set -e

echo "🔧 Initializing database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set"
  exit 1
fi

# Run migrations
echo "📦 Running migrations..."
npm run db:migrate

# Seed only on first database creation
echo "🔍 Checking if database is newly created..."
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
    const rows = await sql`select to_regclass('public.__drizzle_migrations') as table_name`;
    const migrationsTableExists = rows?.[0]?.table_name !== null;
    console.log(migrationsTableExists ? 'false' : 'true');
  } catch {
    console.log('false');
  } finally {
    await sql.end();
  }
}

main();
NODE
)

if [ "$SHOULD_SEED" = "true" ]; then
  echo "🌱 Seeding database (new database detected)..."
  npm run db:seed
else
  echo "⏭️ Skipping seed (database already initialized)"
fi

echo "✅ Database initialization complete!"
