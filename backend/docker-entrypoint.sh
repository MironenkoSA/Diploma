#!/bin/sh
set -e

echo "⏳ Applying database schema..."
./node_modules/.bin/prisma db push --accept-data-loss

echo "⚙️  Generating Prisma Client..."
./node_modules/.bin/prisma generate

echo "🌱 Running seed..."
./node_modules/.bin/ts-node --transpile-only prisma/seed.ts \
  && echo "✅ Seed done" \
  || echo "⚠️  Seed skipped"

echo "🚀 Starting Ателье Историй API..."
exec ./node_modules/.bin/ts-node --transpile-only src/app.ts
