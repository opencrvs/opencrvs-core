/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:16 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-27 22:20:02
 */

const Joi = require('joi');

const informantSchema = Joi.object().keys({

    given: Joi.string(),
    uuid: Joi.string(),
    family: Joi.string(),
    relationship: Joi.string(), 
    addressLine1: Joi.string(), 
    addressLine2: Joi.string(), 
    addressLine3: Joi.string(), 
    city: Joi.string(), 
    county: Joi.string(), 
    state: Joi.string(), 
    postalCode: Joi.string(), 
    personalIDNummber: Joi.string(), 
    email: Joi.string(), 
    phone: Joi.string(), 

    declaration_id: Joi.number()
});

exports.register = (server, options, next) => {

    server.route({

        path: '/informant',
        method: 'POST',
        config: {
            auth: 'jwt',
            description: 'Protected route to create a informant.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            },
            validate: {
                params: {
                    data: informantSchema
                }
            }
        },
        handler: require('./post')
    });

    server.route({

        path: '/informant/{id}',
        method: 'PUT',
        config: {
            auth: 'jwt',
            description: 'Protected route to update a informant.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            },
            validate: {
                params: {
                    data: informantSchema,
                    id: Joi.number()
                }
            }
        },
        handler: require('./put')
    });

    next();
};

exports.register.attributes = {
    name: 'informant-routes'
};
