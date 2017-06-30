// Auth - login

const Boom = require('boom');
const User = require('../../model/user');
const Token = require('../../model/token');
const Config = require('../../config/config');
const Jwt = require('jsonwebtoken');
const Bcrypt = require('bcryptjs');
const Uuid = require('node-uuid');

module.exports = (request, reply) => {

    let queryObj = {};
    if (request.payload.username){
        queryObj = { username: request.payload.username };
    }
    else if (request.payload.email){
        queryObj = { email: request.payload.email };
    }
    User.where(queryObj).fetch({ withRelated:['claims'] })
        .then((user) => {

            if (!user) {
                reply(Boom.badRequest('Incorrect username or email!'));
            }
            Bcrypt.compare(request.payload.password, user.get('password'), (err, isValid) => {

                if (err){
                    reply(Boom.badRequest('Invalid username or email!'));
                }
                else if (isValid) {
                    const userClaims = user.related('claims').toJSON();
                    const scopes = userClaims.map((item) => item.claim)
                        .filter((value, index, self) => self.indexOf(value) === index);
                    const secret = Config.get('/jwtAuth/secret');
                    const jti = Uuid.v4();
                    const jwtToken = Jwt.sign({
                        jti,
                        email: user.get('email'),
                        username: user.get('username'),
                        user_id: user.get('id'),
                        role: user.get('role'),
                        scopes,
                        issuer: 'OpenCRVS'
                    },
                    secret, { expiresIn: '1h' }
                    );
                    Token.forge({
                        jti,
                        'token': jwtToken
                    }).save()
                        .then((model) => {

                            const data = {
                                token: jwtToken
                            };
                            reply(data);
                        }).catch((err) => {

                            reply(Boom.badImplementation('terrible implementation on token: ' + err));
                        });
                }
            });
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on user ' + err));
            }
        });
};
