#!/bin/sh

# Run migrations before starting the application
npm run db:migrate-latest

# continue
exec "$@"
