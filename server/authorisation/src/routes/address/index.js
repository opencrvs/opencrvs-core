/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:16 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-05 13:57:23
 */

const Joi = require('joi');

const addressSchema = Joi.object().keys({
    addressLine1: Joi.string(),
    addressLine2: Joi.string(),
    addressLine3: Joi.string(),
    city: Joi.string(),
    county: Joi.string(),
    state: Joi.string(),
    postalCode: Joi.string(),
    patient_id: Joi.number()
});

exports.register = (server, options, next) => {

    server.route({

        path: '/address',
        method: 'POST',
        config: {
            auth: 'jwt',
            description: 'Protected route to create a address.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            },
            validate: {
                params: {
                    data: addressSchema
                }
            }
        },
        handler: require('./post')
    });

    server.route({

        path: '/address/{id}',
        method: 'PUT',
        config: {
            auth: 'jwt',
            description: 'Protected route to update a address.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            },
            validate: {
                params: {
                    data: addressSchema,
                    id: Joi.number()
                }
            }
        },
        handler: require('./put')
    });

    next();
};

exports.register.attributes = {
    name: 'address-routes'
};
