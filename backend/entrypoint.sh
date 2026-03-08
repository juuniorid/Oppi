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

echo "🌱 Seeding database..."
pnpm run db:seed

echo "🔨 Building application..."
pnpm run build

echo "🚀 Starting application..."
node dist/src/main
