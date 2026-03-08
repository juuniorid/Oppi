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

# Seed database
echo "🌱 Seeding database..."
npm run db:seed

echo "✅ Database initialization complete!"
