/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:16 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-20 22:11:47
 */

const Joi = require('joi');

exports.register = (server, options, next) => {

    server.route({

        path: '/clear',
        method: 'GET',
        config: {
            auth: 'jwt',
            description: 'Protected route to delete data.',
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
    name: 'clear-routes'
};
