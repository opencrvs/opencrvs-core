/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:15:04 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-12 15:52:25
 */
const Bcrypt = require('bcryptjs');
const salt = Bcrypt.genSaltSync();
const lindaHash = Bcrypt.hashSync('plan2017', salt);
const anninaHash = Bcrypt.hashSync('plan2017', salt);
const edHash = Bcrypt.hashSync('plan2017', salt);
const carlHash = Bcrypt.hashSync('plan2017', salt);
const euanHash = Bcrypt.hashSync('plan2017', salt);
const ryanHash = Bcrypt.hashSync('plan2017', salt);
const freddyHash = Bcrypt.hashSync('plan2017', salt);
const kokoHash = Bcrypt.hashSync('plan2017', salt);
const sallyHash = Bcrypt.hashSync('plan2017', salt);
const akuaHash = Bcrypt.hashSync('plan2017', salt);
const users = [
    {
        email: 'freddy@mills.com',
        username: 'freddymills',
        password: freddyHash,
        role: 'field officer',
        given: 'Freddy',
        family: 'Mills',
        avatar: 'african-male-2.jpg',
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
        email: 'koko@jembi.org',
        username: 'kokorawlings',
        password: kokoHash,
        role: 'admin',
        given: 'Koko',
        family: 'Rawlings',
        avatar: 'african-male-1.jpg',
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
        email: 'akua@jembi.org',
        username: 'akuatettey',
        password: akuaHash,
        role: 'certification clerk',
        given: 'Akua',
        family: 'Tettey',
        avatar: 'african-female-1.jpg',
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
        email: 'sally@jembi.org',
        username: 'sallydansua',
        password: sallyHash,
        role: 'registrar',
        given: 'Sally',
        family: 'Dansua',
        avatar: 'african-female-2.jpg',
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
        email: 'linda@jembi.org',
        username: 'lindataylor',
        password: lindaHash,
        role: 'registrar',
        given: 'Linda',
        family: 'Taylor',
        avatar: 'linda-taylor.jpg',
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
        role: 'certification clerk',
        given: 'Annina',
        family: 'Wersun',
        avatar: 'annina-wersun.jpg',
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
        given: 'Ed',
        family: 'Duffus',
        avatar: 'ed-duffus.jpg',
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
        given: 'Carl',
        family: 'Fourie',
        avatar: 'carl-fourie.jpg',
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
        role: 'field officer',
        given: 'Euan',
        family: 'Millar',
        avatar: 'euan-millar.jpg',
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
        given: 'Ryan',
        family: 'Crichton',
        avatar: 'ryan-crichton.jpg',
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
                username: user.username,
                given: user.given,
                family: user.family,
                avatar: user.avatar
            })
        .then((userIds) => {

            const claims = user.claims;
            claims.forEach((userClaims) => {

                userClaims.user_id = userIds[0];
            });
            return knex('claims').insert(claims);
        });
};
