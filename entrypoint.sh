#!/bin/bash
set -e

echo "[INFO] Waiting for database..."
until pg_isready -h babylogdb -U root -d local; do
  echo "⏳ Waiting for DB..."
  sleep 1
done

echo "[INFO] Running custom QR code migration..."
node migrations/run-migration.js || echo "QR code migration failed, but continuing..."

echo "[INFO] Running Drizzle migrations..."
yarn drizzle-kit push --config drizzle.config.ts --force

# echo "[INFO] Seeding database..."
# yarn db:seed:docker

echo "[INFO] Starting app..."
exec node build
