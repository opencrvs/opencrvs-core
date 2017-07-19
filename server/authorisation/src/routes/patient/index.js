/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:16 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-19 12:15:29
 */

const Joi = require('joi');

const patientsSchema = Joi.object().keys({
    prefix: Joi.string(),
    given: Joi.string(),
    family: Joi.string(),
    birthDate: Joi.string(),
    gender: Joi.string(),
    maritalStatus: Joi.string(),
    nationality: Joi.string()
});

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
            }
        },
        handler: require('./post')
    });

    server.route({

        path: '/patient/{id}',
        method: 'PUT',
        config: {
            auth: 'jwt',
            description: 'Protected route to update a patients.',
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
