#!/bin/bash
# Script untuk setup database production

echo "🔄 Generating Prisma Client..."
npx prisma generate

echo "🔄 Pushing schema to database..."
npx prisma db push --accept-data-loss

echo "✅ Database setup complete!"
