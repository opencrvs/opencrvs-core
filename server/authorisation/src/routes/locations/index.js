/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:16 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-05 14:16:41
 */

const Joi = require('joi');

const locationsSchema = Joi.object().keys({

    placeOfDelivery: Joi.string(),
    attendantAtBirth: Joi.string(),
    hospitalName: Joi.string(),

    addressLine1: Joi.string(),
    addressLine2: Joi.string(),
    addressLine3: Joi.string(),
    city: Joi.string(),
    county: Joi.string(),
    state: Joi.string(),
    postalCode: Joi.string(),

    declaration_id: Joi.number()
});

exports.register = (server, options, next) => {

    server.route({

        path: '/locations',
        method: 'POST',
        config: {
            auth: 'jwt',
            description: 'Protected route to create a locations.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            },
            validate: {
                params: {
                    data: locationsSchema
                }
            }
        },
        handler: require('./post')
    });

    server.route({

        path: '/locations/{id}',
        method: 'PUT',
        config: {
            auth: 'jwt',
            description: 'Protected route to update a locations.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            },
            validate: {
                params: {
                    data: locationsSchema,
                    id: Joi.number()
                }
            }
        },
        handler: require('./put')
    });

    next();
};

exports.register.attributes = {
    name: 'locations-routes'
};
