// eslint-disable-next-line @typescript-eslint/no-require-imports
const { makeKyselyHook, kyselyCamelCaseHook } = require('kanel-kysely')

const tablesToIgnore = [
  'pgmigrations',
  'legacy_practitioners',
  'legacy_systems',
  'legacy_users'
]

// Tables come back in Postgres catalog order, which differs between databases.
// Sorting them keeps the generated AppSchema.ts the same everywhere.
/** @type {import('kanel').PreRenderHook} */
const sortTablesByName = (output, instantiatedConfig) => {
  for (const schema of Object.values(instantiatedConfig.schemas)) {
    schema.tables.sort((a, b) =>
      a.name < b.name ? -1 : a.name > b.name ? 1 : 0
    )
  }
  return output
}

/** @type {import('kanel').Config} */
module.exports = {
  connection: {
    connectionString: 'postgres://events_app:app_password@localhost:5432/events'
  },
  preDeleteOutputFolder: true,
  schemas: ['app'],
  outputPath: './src/storage/postgres/events/schema',
  customTypeMap: {
    'pg_catalog.uuid': {
      name: 'UUID',
      typeImports: [
        {
          name: 'UUID',
          path: '@opencrvs/commons',
          isAbsolute: true,
          importAsType: true
        }
      ]
    },
    'pg_catalog.jsonb': 'Record<string, any>',
    'pg_catalog.timestamptz': 'string'
  },
  enumStyle: 'type',
  generateIdentifierType: null, // Kanel creates nominal branded types by default but we're using custom UUID types. This overrides that.
  preRenderHooks: [sortTablesByName, makeKyselyHook(), kyselyCamelCaseHook],
  typeFilter: (type) => !tablesToIgnore.includes(type.name)
}
