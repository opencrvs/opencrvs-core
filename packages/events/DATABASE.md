# Events database

Events use [PostgreSQL](https://www.postgresql.org/about/) as a open-source relational SQL database. If you're unfamiliar with SQL databases, you want to skim through the [PostgreSQL official tutorial](https://www.postgresql.org/docs/17/tutorial.html).

The key concepts you need to understand are

- tables
- schemas
- relationships (via foreign keys)
- SQL language

## Schema overview

To help understand the concepts, visualizing the current schema helps a ton.

Install [PostgreSQL for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-ossdata.vscode-pgsql) or another tool like [pgAdmin](https://www.pgadmin.org/). After you have started OpenCRVS and migrations have ran successfully, you can connect the database using the following roles.

## Roles

Login with the connection string `postgres://<user>:<password>@localhost:5432/events`. Always default to the role with the least priviledges - meaning `events_app`. In production the passwords are rotated and the postgres-user password is a random constant.

| User              | Password            | Purpose                      |
| ----------------- | ------------------- | ---------------------------- |
| `postgres`        | `postgres`          | superuser                    |
| `events_migrator` | `migrator_password` | creates tables, edits schema |
| `events_app`      | `app_password`      | reads and writes to tables   |

## Migrations

Unlike MongoDB and other NoSQL databases, PostgreSQL **requires** writing migrations to create tables where data is written into. This structure is called a schema.

Before migrations are run, the database is initialized using an [init script](../migration/src/migrations/postgres/0001_init.sql). This initialization is ran in the root `docker-compose.dev-deps.yml` file.

See [@opencrvs/migration](/packages/migration/README.md) for more information around the migrations. See the first migration to understand the format. If you run migrations, see `## Tests` to update the test migration file.

## Directory structure

```
/src
  /storage
    /postgres
      /events
        # TypeScript types for Kysely (see `## Application tooling`)
        /schema
          /app
            <table or enum>.ts
          Database.ts
        # queries for features/concepts under events
        drafts.ts
        events.ts
        locations.ts
        import.ts
      # Database client and type configuration
      events.ts
# `yarn generate-db-types` configuration
.kanelrc.js

```

## Application tooling

We're using [Kysely](https://kysely.dev/) to interact with PostgreSQL. It provides TypeScript IntelliSense through [Kanel](https://kristiandupont.github.io/kanel/) and `kanel-kysely`.

The schema directory is generated with `yarn generate-db-types`, but runs automatically when @opencrvs/migration runs.

## Tests

Tests use a migration file that is essentially a dump of the database schema. You can create it with `yarn generate-db-schema`, requires a running Postgres instance. The tests spin up a testcontainer for Postgres and create a new database for each test.
