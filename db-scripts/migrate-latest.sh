#!/bin/sh

# Run migrations before starting the application
npm run db:migrate-latest

# Cleanup expired tokens before starting the application
npm run db-cleanup:expired-tokens

# continue
exec "$@"
