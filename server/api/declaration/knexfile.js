// Update with your config settings.

module.exports = {

  test: {
    client: 'pg',
    connection: 'postgres://localhost/declarations_test',
    migrations: {
      directory: __dirname + '/src/model/migrations'
    },
    seeds: {
      directory: __dirname + '/src/model/seeds/test'
    }
  },
  development: {
    client: 'pg',
    connection: 'postgres://localhost/declarations',
    migrations: {
      directory: __dirname + '/src/model/migrations'
    },
    seeds: {
      directory: __dirname + '/src/model/seeds/development'
    }
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: __dirname + '/src/model/migrations'
    },
    seeds: {
      directory: __dirname + '/src/model/seeds/production'
    }
  }

};
