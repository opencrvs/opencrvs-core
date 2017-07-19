/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:16 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-19 11:13:35
 */

const Joi = require('joi');

const patientSchema = Joi.object().keys({
    uuid: Joi.string(),
    prefix: Joi.string(),
    given: Joi.string(),
    family: Joi.string(),
    birthDate: Joi.string(),
    gender: Joi.string(),
    maritalStatus: Joi.string()
});

exports.register = (server, options, next) => {

    server.route({

        path: '/patients',
        method: 'GET',
        config: {
            auth: 'jwt',
            description: 'Protected route to retrieve patients.',
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
    name: 'patients-routes'
};
