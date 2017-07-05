/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:15:47 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-05 09:23:37
 */
// App Registrations

const Config = require('./config');

const internals = {
    registrations: [
        // Vision Plugin
        {
            plugin: 'vision'
        },
        // Inert Plugin
        {
            plugin: 'inert'
        },
        // Logging Plugin
        {
            plugin: {
                register: 'good',
                options: {
                    ops: {
                        interval: 1000
                    },
                    reporters: {
                        console: [{
                            module: 'good-squeeze',
                            name: 'Squeeze',
                            args: [{ log: '*', response: '*' }]
                        }, {
                            module: 'good-console'
                        }, 'stdout']
                    }
                }
            }
        },
        // Swagger Plugin
        {
            plugin: {
                register: 'hapi-swagger',
                options: {
                    info: {
                        title: 'OpenCRVS Auth Gateway Documentation',
                        version: '1.0.0'
                    },
                    documentationPath: '/docs',
                    basePath: '/',
                    pathPrefixSize: 2,
                    jsonPath: '/docs/swagger.json',
                    sortPaths: 'path-method',
                    lang: 'en',
                    tags: [
                        { name: 'api' }
                    ],
                    securityDefinitions: []
                }
            }
        },
        // JWT Auth Plugin
        {
            plugin: {
                register: './lib/auth',
                options: Config.get('/jwtAuth')
            },
            options: {
                select: ['api']
            }
        },
        // Auth Routes
        {
            plugin: './routes/auth',
            options: {
                select: ['api'],
                routes: {
                    prefix: '/auth'
                }
            }
        },
        // Protected routes
        {
            plugin: './routes/declarations',
            options: {
                select: ['api'],
                routes: {
                    prefix: '/api'
                }
            }
        }
    ]
};

module.exports = internals.registrations;
