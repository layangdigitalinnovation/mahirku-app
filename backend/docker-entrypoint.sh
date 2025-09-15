#!/bin/sh
set -e

if [ -f ./wait-for-it.sh ]; then
  echo "Waiting for Postgres to be ready..."
  ./wait-for-it.sh db:5432 --timeout=30 --strict -- echo "✅ Postgres is up!"
fi

# Run database migrations if needed
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  npm run migrate
  
  # Run seeds if needed
  if [ "$RUN_SEEDS" = "true" ]; then
    echo "Running database seeds..."
    npm run seed
  fi
fi

# Jalankan backend
echo "Starting backend..."
exec npm run start:prod