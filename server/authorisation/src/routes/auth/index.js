
const Joi = require('joi');

// accepts either or, and errors if neither
const authenticateUserSchema = Joi.alternatives().try(
    Joi.object({
        username: Joi.string().alphanum().min(2).max(30).required(),
        password: Joi.string().required()
    }),
    Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    })
);

exports.register = (server, options, next) => {

    server.route({

        path: '/login',
        method: 'POST',
        config: {
            auth: false,
            description: 'User login',
            notes: 'Login with email or username and password.',
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
        handler: require('./login')
    });

    next();
};

exports.register.attributes = {
    name: 'auth-routes'
};
