/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:15:59 
 * @Last Modified by:   Euan Millar 
 * @Last Modified time: 2017-07-05 01:15:59 
 */

const Confidence = require('confidence');
require('dotenv').config();

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
                user:     process.env.DB_USER,
                password: process.env.DB_PASS
            },
            migrations: {
                directory: './src/model/migrations'
            },
            seeds: {
                directory: './src/model/seeds/test'
            },
            debug: true
        },
        production: {
            client: 'pg',
            connection: {
                database: 'authorisation_prod',
                user:     process.env.DB_USER,
                password: process.env.DB_PASS
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
                user:     process.env.DB_USER,
                password: process.env.DB_PASS
            },
            migrations: {
                directory: './src/model/migrations'
            },
            seeds: {
                directory: './src/model/seeds/development'
            }
        }

    },
    //
    // JWT Auth
    //
    jwtAuth: {
        secret: process.env.JWT_SECRET
    }
};

internals.store = new Confidence.Store(internals.config);

exports.get = function (key) {

    return internals.store.get(key, internals.criteria);
};

exports.meta = function (key) {

    return internals.store.meta(key, internals.criteria);
};

