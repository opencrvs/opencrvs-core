#!/bin/bash

docker exec -t opencrvs pg_dump \
  -U events_user \
  -d events \
  --schema-only \
  > events_schema.sql
