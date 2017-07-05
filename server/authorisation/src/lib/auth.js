/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:15:42 
 * @Last Modified by:   Euan Millar 
 * @Last Modified time: 2017-07-05 01:15:42 
 */
// Auth Module

const JwtPlugin = require('hapi-auth-jwt2');
const User = require('../model/user');

exports.register = (server, options, next) => {

    server.register(JwtPlugin);
    server.auth.strategy('jwt', 'jwt', {
        key: options.secret,
        validateFunc: (decoded, request, callback) => {

            if (User.where({ id: decoded.user_id }).fetch()) {
                return callback(null, true);
            }
            return callback(null, false);
        },
        verifyOptions: { algorithms: ['HS256'] }
    });
    next();
};

exports.register.attributes = {
    name: 'jwt-auth'
};
