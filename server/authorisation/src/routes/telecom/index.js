/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:16 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-05 14:10:26
 */

const Joi = require('joi');

const telecomSchema = Joi.object().keys({
    phone: Joi.string(),
    use: Joi.string(),
    patient_id: Joi.number()
});

exports.register = (server, options, next) => {

    server.route({

        path: '/telecom',
        method: 'POST',
        config: {
            auth: 'jwt',
            description: 'Protected route to create a telecom.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            },
            validate: {
                params: {
                    data: telecomSchema
                }
            }
        },
        handler: require('./post')
    });

    server.route({

        path: '/telecom/{id}',
        method: 'PUT',
        config: {
            auth: 'jwt',
            description: 'Protected route to update a telecom.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            },
            validate: {
                params: {
                    data: telecomSchema,
                    id: Joi.number()
                }
            }
        },
        handler: require('./put')
    });

    next();
};

exports.register.attributes = {
    name: 'telecom-routes'
};
