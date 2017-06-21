// Auth Module

const JwtPlugin = require('hapi-auth-jwt2');

exports.register = (server, options, next) => {

    server.register(JwtPlugin);
    server.auth.strategy('jwt', 'jwt', {
        key: options.secret,
        verifyOptions: { algorithms: ['HS256'] }
    });
    next();
};

exports.register.attributes = {
    name: 'jwt-auth'
};
