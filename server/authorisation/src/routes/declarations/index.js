exports.register = (server, options, next) => {

    server.route({

        path: '/protected',
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
        handler: require('./declaration')
    });

    next();
};

exports.register.attributes = {
    name: 'protected-routes'
};
