# Migrations

This package migrates data and database schemas between versions.

> [!NOTE]
> Requires the `postgres` dependency to be running.

## Usage

- #### `yarn start`

This will run all the pending migrations.

- #### `yarn create:<package> migration-name`

e.g. `yarn create:events migration-name`

This will create a new migration named `migration-name` prepended with the current
timestamp in the migrations/<package> folder.

With **Postgres**, the migrations are written in SQL and separated with `-- Up Migration` and `-- Down Migration`. Write the new migration procedure under `-- Up Migration` and a procedure to revert those changes under `-- Down Migration`.

- #### `yarn revert`

This will revert all the events migrations one step at a time.
