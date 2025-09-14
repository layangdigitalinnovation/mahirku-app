#!/bin/sh

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

# Start the application
exec "$@"