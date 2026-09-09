#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

set -e

echo "🧹 Clearing all development data..."

# Default PostgreSQL connection parameters for development
POSTGRES_HOST=${POSTGRES_HOST:-localhost}
POSTGRES_PORT=${POSTGRES_PORT:-5432}
POSTGRES_USER=${POSTGRES_USER:-postgres}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres}
ANALYTICS_POSTGRES_USER=${ANALYTICS_POSTGRES_USER:-events_analytics}

print_usage_and_exit() {
  echo 'Usage: ./clear-all-data-dev.sh'
  echo ""
  echo "Environment variables (with defaults for development):"
  echo "POSTGRES_HOST=${POSTGRES_HOST}"
  echo "POSTGRES_PORT=${POSTGRES_PORT}"
  echo "POSTGRES_USER=${POSTGRES_USER}"
  echo "POSTGRES_PASSWORD=${POSTGRES_PASSWORD}"
  echo "ANALYTICS_POSTGRES_USER=${ANALYTICS_POSTGRES_USER}"
  echo ""
  echo "This script clears all development databases including:"
  echo "- PostgreSQL analytics schema and data"
  echo "- Metabase configuration database (H2)"
  echo "- Any additional custom databases (can be extended by country configurations)"
  exit 1
}

# Check if PostgreSQL is accessible
if ! PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d postgres -c '\q' 2>/dev/null; then
  echo "❌ Cannot connect to PostgreSQL at ${POSTGRES_HOST}:${POSTGRES_PORT}"
  echo "   Make sure PostgreSQL is running and credentials are correct."
  print_usage_and_exit
fi

# Clear PostgreSQL analytics schema
echo "🗑️  Clearing PostgreSQL analytics schema..."
PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d events -v ON_ERROR_STOP=1 <<EOSQL || echo "⚠️  Analytics schema may not exist yet"
-- Drop analytics schema and recreate it
DROP SCHEMA IF EXISTS analytics CASCADE;
CREATE SCHEMA analytics;

-- Drop and recreate analytics user
DROP ROLE IF EXISTS "$ANALYTICS_POSTGRES_USER";
EOSQL

echo "✅ PostgreSQL analytics data cleared"

echo ""
echo "🎉 All development data cleared successfully!"
echo ""
