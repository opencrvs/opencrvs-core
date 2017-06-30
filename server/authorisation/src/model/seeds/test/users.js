

const Bcrypt = require('bcryptjs');
const salt = Bcrypt.genSaltSync();
const passHash = Bcrypt.hashSync('plan2017', salt);
const users = [
    {
        email: 'tester1@yumeteki.io',
        username: 'validator',
        password: passHash,
        role: 'validator',
        claims: [
            {
                claim: 'post:verifyCredentials'
            },
            {
                claim: 'post:login'
            },
            {
                claim: 'post:declaration'
            },
            {
                claim: 'store:image'
            },
            {
                claim: 'notification:search'
            }]
    },
    {
        email: 'tester2@yumeteki.io',
        username: 'registrar',
        password: passHash,
        role: 'registrar',
        claims: [
            {
                claim: 'post:verifyCredentials'
            },
            {
                claim: 'post:login'
            },
            {
                claim: 'post:declaration'
            },
            {
                claim: 'store:image'
            },
            {
                claim: 'notification:search'
            }]
    },
    {
        email: 'tester3@yumeteki.io',
        username: 'admin',
        password: passHash,
        role: 'admin',
        claims: [
            {
                claim: 'post:verifyCredentials'
            },
            {
                claim: 'post:login'
            },
            {
                claim: 'post:declaration'
            },
            {
                claim: 'store:image'
            },
            {
                claim: 'notification:search'
            }]
    },
    {
        email: 'tester4@yumeteki.io',
        username: 'manager',
        password: passHash,
        role: 'manager',
        claims: [
            {
                claim: 'post:verifyCredentials'
            },
            {
                claim: 'post:login'
            },
            {
                claim: 'post:declaration'
            },
            {
                claim: 'store:image'
            },
            {
                claim: 'notification:search'
            }]
    },
    {
        email: 'tester5@yumeteki.io',
        username: 'clerk',
        password: passHash,
        role: 'clerk',
        claims: [
            {
                claim: 'post:verifyCredentials'
            },
            {
                claim: 'post:login'
            },
            {
                claim: 'post:notification'
            }]
    }
];


exports.seed = function (knex, Promise) {

    const userPromises = [];
    users.forEach((user) => {

        userPromises.push(createUser(knex, user));
    });

    return Promise.all(userPromises);
};

const createUser = function (knex, user) {

    return knex.table('users')
        .returning('id')
        .insert(
            {
                email: user.email,
                password: user.password,
                role: user.role,
                username: user.username
            })
        .then((userIds) => {

            const claims = user.claims;
            claims.forEach((userClaims) => {

                userClaims.user_id = userIds[0];
            });
            return knex('claims').insert(claims);
        });
};
