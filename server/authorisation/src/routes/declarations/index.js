const location = Joi.object().keys({
    placeOfDelivery: Joi.string(),
    attendantAtBirth: Joi.string(),
    hospitalName: Joi.string(),
    addressLine1: Joi.string(),
    addressLine2: Joi.string(),
    addressLine3: Joi.string(),
    city: Joi.string(),
    county: Joi.string(),
    state: Joi.string(),
    postalCode: Joi.string()
});

const declarationSchema = Joi.object().keys({
    motherDetails: Joi.string(),
    uuid: Joi.string(),
    motherDetails: Joi.number(),
    fatherDetails: Joi.number(),
    childDetails: Joi.number(),
    status: Joi.string(),
    locations: Joi.array().items(location)
});

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
                payload: declarationSchema
            }
        },
        handler: require('./post')
    });

    server.route({

        path: '/declarations/{id}',
        method: 'PUT',
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
                payload: declarationSchema
            }
        },
        handler: require('./put')
    });

    server.route({

        path: '/declarations/{id}',
        method: 'DELETE',
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
        handler: require('./delete')
    });

    next();
};

exports.register.attributes = {
    name: 'protected-routes'
};
