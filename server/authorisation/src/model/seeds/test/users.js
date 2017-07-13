/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:15:04 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-13 09:28:22
 */
const Bcrypt = require('bcryptjs');
const salt = Bcrypt.genSaltSync();
const lindaHash = Bcrypt.hashSync('plan2017', salt);
const anninaHash = Bcrypt.hashSync('plan2017', salt);
const edHash = Bcrypt.hashSync('plan2017', salt);
const carlHash = Bcrypt.hashSync('plan2017', salt);
const euanHash = Bcrypt.hashSync('plan2017', salt);
const ryanHash = Bcrypt.hashSync('plan2017', salt);
const users = [
    {
        email: 'linda@jembi.org',
        username: 'lindataylor',
        password: lindaHash,
        given: 'Linda',
        family: 'Taylor',
        avatar: 'linda-taylor.jpg',
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
        given: 'Annina',
        family: 'Wersun',
        avatar: 'annina-wersun.jpg',
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
        given: 'Ed',
        family: 'Duffus',
        avatar: 'ed-duffus.jpg',
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
        given: 'Carl',
        family: 'Fourie',
        avatar: 'carl-fourie.jpg',
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
        given: 'Euan',
        family: 'Millar',
        avatar: 'euan-millar.jpg',
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
        given: 'Ryan',
        family: 'Crichton',
        avatar: 'ryan-crichton.jpg',
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
