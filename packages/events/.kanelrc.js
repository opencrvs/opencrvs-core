// eslint-disable-next-line @typescript-eslint/no-require-imports
const { makeKyselyHook, kyselyCamelCaseHook } = require('kanel-kysely')

/** @type {import('kanel').Config} */
module.exports = {
  connection: {
    connectionString: 'postgres://events_app:app_password@localhost:5432/events'
  },
  preDeleteOutputFolder: true,
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
  preRenderHooks: [makeKyselyHook(), kyselyCamelCaseHook],
  schema: ['app'],
  typeFilter: (type) => type.name !== 'pgmigrations'
}
