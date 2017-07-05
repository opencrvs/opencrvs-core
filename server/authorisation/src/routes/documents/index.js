/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:16 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-05 14:20:22
 */

const Joi = require('joi');

const documentsSchema = Joi.object().keys({
    uuid: Joi.string(),
    contentType: Joi.string(),
    content: Joi.any(),
    declaration_id: Joi.number()
});

exports.register = (server, options, next) => {

    server.route({

        path: '/documents',
        method: 'POST',
        config: {
            auth: 'jwt',
            description: 'Protected route to create a documents.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            },
            validate: {
                params: {
                    data: documentsSchema
                }
            }
        },
        handler: require('./post')
    });

    server.route({

        path: '/documents/{id}',
        method: 'PUT',
        config: {
            auth: 'jwt',
            description: 'Protected route to update a documents.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            },
            validate: {
                params: {
                    data: documentsSchema,
                    id: Joi.number()
                }
            }
        },
        handler: require('./put')
    });

    next();
};

exports.register.attributes = {
    name: 'documents-routes'
};
