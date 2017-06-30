const Bcrypt = require('bcryptjs');
const salt = Bcrypt.genSaltSync();
const lindaHash = Bcrypt.hashSync('2675KC2903tD80E', salt);
const anninaHash = Bcrypt.hashSync('4WM88f5Jm0OB94M', salt);
const edHash = Bcrypt.hashSync('plan2017', salt);
const carlHash = Bcrypt.hashSync('3VV4m89F2e4cZpc', salt);
const euanHash = Bcrypt.hashSync('4x11dFcm10h7h0a', salt);
const ryanHash = Bcrypt.hashSync('M6ksxscibnWeNqW', salt);
const users = [
    {
        email: 'linda@jembi.org',
        username: 'lindataylor',
        password: lindaHash,
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
        email: 'Annina.Wersun@plan-international.org',
        username: 'anninawersun',
        password: anninaHash,
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
        email: 'edward.duffus@plan-international.org',
        username: 'edduffus',
        password: edHash,
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
        email: 'carl@jembi.org', 
        username: 'carlfourie',
        password: carlHash,
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
        email: 'euan@yumeteki.io',
        username: 'euanmillar',
        password: euanHash,
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
    },
    {
        email: 'ryan@jembi.org',
        username: 'ryancrichton',
        password: ryanHash,
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
