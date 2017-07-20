/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:16 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-20 22:11:47
 */

const Joi = require('joi');

exports.register = (server, options, next) => {

    server.route({

        path: '/patient',
        method: 'POST',
        config: {
            auth: 'jwt',
            description: 'Protected route to create a patients.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            },
            payload: {
                allow: 'multipart/form-data',
                parse: true
            },
            validate: {
                payload: {
                    uuid: Joi.string().required(),
                    prefix: Joi.string().required(),
                    given: Joi.string().required(),
                    family: Joi.string().required(),
                    birthDate: Joi.string().required(),
                    gender: Joi.string().required(),
                    maritalStatus: Joi.string().required(),
                    nationality: Joi.string().required()
                }
            }
        },
        handler: require('./post')
    });

    server.route({

        path: '/patient/{id}',
        method: 'PUT',
        config: {
            auth: 'jwt',
            description: 'Protected route to update a patient.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            },
            payload: {
                allow: 'multipart/form-data',
                parse: true
            },
            validate: {
                payload: {
                    id: Joi.number().required(),
                    given: Joi.string().required(),
                    family: Joi.string().required(),
                    birthDate: Joi.string().required(),
                    gender: Joi.string().required(),
                    maritalStatus: Joi.string().required(),
                    nationality: Joi.string().required()
                }
            }
        },
        handler: require('./put')
    });

    server.route({

        path: '/patient/{id}',
        method: 'GET',
        config: {
            auth: 'jwt',
            description: 'Protected route to retrieve patient.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            },
            validate: {
                params: {
                    id: Joi.number()
                }
            }
        },
        handler: require('./get')
    });

    next();
};

exports.register.attributes = {
    name: 'patient-routes'
};
