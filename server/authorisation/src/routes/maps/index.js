
const Joi = require('joi');

exports.register = (server, options, next) => {

    server.route({

        path: '/maps/ghana',
        method: 'GET',
        config: {
            auth: 'jwt',
            description: 'Protected route to retrieve map.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        },
        handler: require('./ghana')
    });

    server.route({

        path: '/maps/ghana/volta',
        method: 'GET',
        config: {
            auth: 'jwt',
            description: 'Protected route to retrieve map.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        },
        handler: require('./volta')
    });
    next();
};

exports.register.attributes = {
    name: 'map-routes'
};
