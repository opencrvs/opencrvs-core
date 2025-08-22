# Migrations

This package migrates data and database schemas between versions.

> [!NOTE]
> Requires `mongodb` and `postgres` dependencies to be running.

## Usage

- #### `yarn start`

This will run all the pending migrations.

- #### `yarn create:<package> migration-name`

e.g. `yarn create:user-mgnt migration-name`

This will create a new migration named `migration-name` prepended with the current
timestamp in the migrations/<package> folder.

With **Mongo**, the created scripts will have 2 functions exported, `up` and
`down`. We need to write the new migration procedure in the `up` function and a
procedure to revert those changes in `down`.

With **Postgres**, it's similar but the migrations are written in SQL instead of TypeScript and they are separated with `-- Up Migration` and `-- Down Migration`.

- #### `yarn status:<package>`

e.g. `yarn status:user-mgnt`

This will show status for the migration scripts defined in the migrations/<package> folder.
