
const Confidence = require('confidence');

const internals = {
    criteria: {
        env: process.env.NODE_ENV
    }
};

internals.config = {
    //
    $meta: 'App configuration file',
    //
    // Knex Connector
    //
    knex: {
        $filter: 'env',
        test: {
            client: 'pg',
            connection: {
                database: 'authorisation_test',
                user:     'opencrvs',
                password: '8d3db93cf3832222992b6351a19b4de43a5b0fd1b01a0a6b10634bcc83780785'
            },
            migrations: {
                directory: './src/model/migrations'
            },
            seeds: {
                directory: './src/model/seeds/test'
            }
        },
        prod: {
            client: 'pg',
            connection: {
                database: 'authorisation',
                user:     '',
                password: ''
            },
            migrations: {
                directory: './src/model/migrations'
            },
            seeds: {
                directory: './src/model/seeds/production'
            }
        },
        $default: {
            client: 'pg',
            connection: {
                database: 'authorisation',
                user:     'opencrvs',
                password: '8d3db93cf3832222992b6351a19b4de43a5b0fd1b01a0a6b10634bcc83780785'
            },
            migrations: {
                directory: './src/model/migrations'
            },
            seeds: {
                directory: './src/model/seeds/development'
            },
            debug: true
        }

    },
    //
    // JWT Auth
    //
    jwtAuth: {
        secret: '38c565b35098797461bf3582897fef10da80178fc0a07c7fbc0ade3214b150d2'
    }
};

internals.store = new Confidence.Store(internals.config);

exports.get = function (key) {

    return internals.store.get(key, internals.criteria);
};

exports.meta = function (key) {

    return internals.store.meta(key, internals.criteria);
};

