#!/bin/sh
# Cleans pg_dump output so it can be executed by the Node.js pg client in tests.
#
# Removes two categories of content that break test setup:
#
# 1. psql meta-commands (\restrict, \unrestrict) — added by pg_dump 17 as
#    security bookmarks; valid only in psql, not in the pg Node.js driver.
#
# 2. mongo_fdw extension, server, user mapping, and foreign tables — a legacy
#    FDW that may be present in a developer's local events DB but is not
#    available in the Testcontainers PostgreSQL instance used during tests.

grep -v '^\\' | sed \
  -e '/CREATE SERVER mongo/,/^);$/d' \
  -e '/CREATE FOREIGN TABLE app\.legacy_/,/^);$/d' \
  -e '/mongo_fdw/d' \
  -e '/-- Name: mongo/d' \
  -e '/-- Name: legacy_/d' \
  -e '/ALTER SERVER mongo/d' \
  -e '/ALTER FOREIGN TABLE app\.legacy_/d' \
  -e '/USER MAPPING.*mongo/d' \
  -e '/CREATE USER MAPPING.*mongo/d'
