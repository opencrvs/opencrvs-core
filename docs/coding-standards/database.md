# Database

Read this page when a change adds a migration or a database query. [Coding standards](README.md) has the rules for all code. The [migration STYLEGUIDE](../../packages/migration/STYLEGUIDE.md) has the names of migrations.

Write every migration for a live environment with real data. Write every query for millions of rows.

## Add a new migration instead of an edit

A deployed database does not run a migration again after it has run. Add a new migration, with a timestamp later than the latest one. A migration keeps its file name. After a schema change, run `generate-db-types` in `packages/events`.

## Write data migrations for the data of a whole country

- Work in batches, so that the rows are never all in memory.
- Put the schema change and the data copy in separate steps.
- Join on indexed columns.
- Plain SQL is often shorter and faster than code.
- Make the migration work in any order. A migration that ships in a patch release can run before migrations on `develop` that have earlier timestamps. The comment in `packages/migration/run-migrations.sh` explains this. For example, use `IF NOT EXISTS` when you create a table or an index.

## Let Postgres do the work

- Filter in the query, not in memory after you fetch the rows.
- Use one query for many items instead of `Promise.all` over a list of queries.
- Add indexes and foreign keys.
- Keep `jsonb` columns as blobs of data. Queries read columns, not the inside of a `jsonb` value.
- Put writes that belong together in one transaction.

## Store each fact once

A new field gives new information. For example, an audit log entry does not repeat values that are already in its `requestData`. Some copies are part of the design: each action keeps the data as it was when the action happened, and the search index is built from the events. Give the reason for any new copy of data in the PR.
