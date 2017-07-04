exports.register = (server, options, next) => {

    server.route({

        path: '/declarations',
        method: 'GET',
        config: {
            auth: 'jwt',
            description: 'Protected gateway endpoint.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        },
        handler: require('./get')
    });

    server.route({

        path: '/declarations',
        method: 'POST',
        config: {
            auth: 'jwt',
            description: 'Protected gateway endpoint.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            },
            validate: {
                // How do I include the above Schema here as an either/or payload?
                payload: authenticateUserSchema
            }
        },
        handler: require('./get')
    });

    next();
};

exports.register.attributes = {
    name: 'protected-routes'
};
