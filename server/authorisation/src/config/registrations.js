// App Registrations

const Config = require('./config');

const internals = {
    registrations: [
        // Swagger Plugin
        {
            plugin: {
                register: 'hapi-swagger',
                options: {
                    info: {
                        title: 'App API Documentation',
                        version: '1.0.0'
                    },
                    documentationPath: './docs'
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
                select: ['web-app']
            }
        },
        // Auth Routes
        {
            plugin: './routes/auth',
            options: {
                select: ['web-app'],
                routes: {
                    prefix: '/auth'
                }
            }
        }
        // User Routes
        /*{
              plugin: './routes/user',
              options: {
                  select: ['web-app'],
                  routes: {
                      prefix: '/user'
                  }
              }
          }*/
    ]
};

module.exports = internals.registrations;