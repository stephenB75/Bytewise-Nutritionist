#!/bin/bash

# Construct DATABASE_URL from PostgreSQL environment variables
export DATABASE_URL="postgres://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/$PGDATABASE?sslmode=require"

# Start the development server
NODE_ENV=development tsx server/index.ts