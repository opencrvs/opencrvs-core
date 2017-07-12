/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:16 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-05 19:51:46
 */

const Joi = require('joi');

exports.register = (server, options, next) => {

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
