const config = {
  outFile: 'src/storage/postgres/events/types.ts',
  dialect: 'postgres',
  url: 'postgres://events_app:app_password@localhost:5432/events',
  singularize: true,
  camelCase: true,
  defaultSchemas: ['app'],
  excludePattern: 'app.pgmigrations',
  dateParser: 'string'
}

export default config
