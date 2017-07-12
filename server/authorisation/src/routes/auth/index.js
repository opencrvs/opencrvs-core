/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:32 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-06 08:55:57
 */

const Joi = require('joi');

// accepts either or, and errors if neither
const authenticateUserSchema = Joi.object().keys({
    username: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(6).max(200).required()
}).xor('username', 'email');

exports.register = (server, options, next) => {

    server.route({

        path: '/login',
        method: 'POST',
        config: {
            auth: false,
            description: 'User login',
            notes: 'Login with email or username and password.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            },
            validate: {
                // How do I include the above Schema here as an either/or payload?
                payload: authenticateUserSchema
            }
        },
        handler: require('./login')
    });

    next();
};

exports.register.attributes = {
    name: 'auth-routes'
};
