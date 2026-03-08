#!/bin/bash
set -e

echo "🗑️  Dropping database..."

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set"
  exit 1
fi

# Extract database name from DATABASE_URL
# Format: postgresql://user:password@host:port/dbname
DB_NAME=$(echo $DATABASE_URL | sed 's/.*\///')
DB_USER=$(echo $DATABASE_URL | sed 's/.*:\/\/\([^:]*\).*/\1/')
DB_HOST=$(echo $DATABASE_URL | sed 's/.*@\([^:]*\).*/\1/')

# Drop and recreate database
psql -h $DB_HOST -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;" || true
psql -h $DB_HOST -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

echo "✅ Database reset complete!"
