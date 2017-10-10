/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:16 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-10 16:22:05
 */

const Joi = require('joi');

const extraSchema = Joi.object().keys({
    childrenBornAlive: Joi.string(),
    childrenBornLiving: Joi.string(),
    foetalDeaths: Joi.string(),
    birthDateLast: Joi.string(),
    formalEducation: Joi.string(),
    occupation: Joi.string(),
    religion: Joi.string(),
    employment: Joi.string(),
    personalIDNummber: Joi.string(),
    maidenName: Joi.string(),
    marriageDate: Joi.string(),
    typeOfBirth: Joi.string(),
    patient_id: Joi.number()
});

exports.register = (server, options, next) => {

    server.route({

        path: '/extra',
        method: 'POST',
        config: {
            auth: 'jwt',
            description: 'Protected route to create a extra.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            },
            validate: {
                params: {
                    data: extraSchema
                }
            }
        },
        handler: require('./post')
    });

    server.route({

        path: '/extra/{id}',
        method: 'PUT',
        config: {
            auth: 'jwt',
            description: 'Protected route to update a extra.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            },
            validate: {
                params: {
                    data: extraSchema,
                    id: Joi.number()
                }
            }
        },
        handler: require('./put')
    });

    next();
};

exports.register.attributes = {
    name: 'extra-routes'
};
