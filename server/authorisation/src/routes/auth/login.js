// Auth - login

const Boom = require('boom');
const User = require('../../model/user');
const Config = require('../../config/config');
const Jwt = require('jsonwebtoken');

module.exports = (request, reply) => {

    User.forge($or: [
        { email: request.payload.email },
        { username: request.payload.username }
        ]).fetch()
        .then(function (user) {

            if (!user) {
                return res(Boom.badRequest('Incorrect username or email!'));
            }
            bcrypt.compare(password, user.password, (err, isValid) => {

                if (err){
                    return res(Boom.badRequest('Incorrect username or email!'));
                }
                else if (isValid) {
                    const secret = Config.get('/jwtAuth/secret');
                    jwtToken = Jwt.sign({
                        jti: uuid.v4(),
                        roles: user.roles
                    }, secretKey, {
                        subject: user.username,
                        issuer: 'OpenCRVS'
                    },
                    secret, { expiresIn: '14 days' }
                    );
                    return jwtToken;
                }
            });

        })
        .catch(function (err) {

            if (err){
                return res(Boom.badImplementation('terrible implementation'));
            }
        });
};
