/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:16 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-13 11:34:12
 */

const Joi = require('joi');

exports.register = (server, options, next) => {

    server.route({

        path: '/notifications',
        method: 'POST',
        config: {
            auth: 'jwt',
            description: 'Protected route to create a notifications.',
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
                    uuid: Joi.string().required()
                }
            }
        },
        handler: require('./post')
    });

    server.route({

        path: '/notifications',
        method: 'GET',
        config: {
            auth: 'jwt',
            description: 'Protected route to retrieve notifications.',
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

    next();
};

exports.register.attributes = {
    name: 'notifications-routes'
};
