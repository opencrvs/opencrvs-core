/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:16 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-08-02 13:02:21
 */

const Joi = require('joi');

exports.register = (server, options, next) => {

    server.route({

        path: '/manager',
        method: 'GET',
        config: {
            auth: 'jwt',
            description: 'Protected route to retrieve manager location view stub.',
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
    name: 'manager-routes'
};
