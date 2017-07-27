/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:15:23 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-27 18:53:52
 */

const Moment = require('moment');



const declarations = [
    {
        uuid: 'f08150eeeeb84dc19ac6456591956489',
        tracking: 'BD-f08150eeeeKA',
        childDetails: '1',
        motherDetails: '2',
        fatherDetails: '3',
        code: 'birth-notification',
        status: 'new',
        created_at: Moment().subtract(1, 'days').utc().format('ddd MMM DD YYYY HH:mm:ss z'),
        locations: [
            {
                placeOfDelivery: 'hospital',
                attendantAtBirth: 'Midwife',
                hospitalName: 'Glaco Maternity Home',
                addressLine1: 'Glaco Maternity Home',
                addressLine2: 'P.O. Box 23',
                addressLine3: 'Swedru',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: ''
            } 
        ],
        informant: [
            {
                uuid: '396f088a681644cd8007818580b4690a',
                prefix: 'Mr',
                given: 'Michael',
                family: 'Essien',
                relationship: 'father',
                addressLine1: 'P.O. Box 23',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: '',
                personalIDNummber: 'GH98562325',
                email: '@gmail.com',
                phone: '024 555 7655'
            }
        ]
    },{
        uuid: 'f9e2525862d34db8b497b48f68471b70',
        tracking: 'BD-f9e2525862KA',
        childDetails: '4',
        motherDetails: '5',
        fatherDetails: '6',
        code: 'birth-notification',
        status: 'new',
        created_at: Moment().subtract(2, 'days').utc().format('ddd MMM DD YYYY HH:mm:ss z'),
        locations: [
            {
                placeOfDelivery: 'clinic',
                attendantAtBirth: 'Midwife',
                hospitalName: 'Ahamadiyya Hospital',
                addressLine1: 'P.O. Box 19',
                addressLine2: '',
                addressLine3: 'Swedru',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: ''
            } 
        ],
        informant: [
            {
                uuid: 'a866c2796cb44b03b0fe97c0efdfe093',
                prefix: 'Mr',
                given: 'Asamoah',
                family: 'Ghan',
                relationship: 'father',
                addressLine1: 'P.O. Box 23',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: '',
                personalIDNummber: 'GH85263256',
                email: 'asamoah.ghan@gmail.com',
                phone: '024 852 3652'
            }
        ]
    },{
        uuid: '8ac7ca2c58d743988d51677fdd755d3c',
        tracking: 'BD-8ac7ca2c58JA',
        childDetails: '7',
        motherDetails: '8',
        fatherDetails: '9',
        code: 'birth-declaration',
        status: 'new',
        created_at: Moment().subtract(3, 'days').utc().format('ddd MMM DD YYYY HH:mm:ss z'),
        locations: [
            {
                placeOfDelivery: 'home',
                attendantAtBirth: 'none',
                hospitalName: '',
                addressLine1: 'P.O. Box 66',
                addressLine2: '',
                addressLine3: 'Swedru',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: ''
            } 
        ],
        informant: [
            {
                uuid: '1828c6cdb5d34fe49a8b5e1e7d284119',
                prefix: 'Mr',
                given: 'Jerry',
                family: 'Wale',
                relationship: 'father',
                addressLine1: 'P.O. Box 23',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: '',
                personalIDNummber: 'GH68524398',
                email: 'jerry.wale@gmail.com',
                phone: '024 985 2546'
            }
        ]
    },
    /////
    {
        uuid: '3cba389109324880bd6a405fd7744f50',
        tracking: 'BD-3cba3891KA',
        childDetails: '10',
        motherDetails: '11',
        fatherDetails: '12',
        code: 'birth-declaration',
        status: 'new',
        created_at: Moment().subtract(1, 'days').utc().format('ddd MMM DD YYYY HH:mm:ss z'),
        locations: [
            {
                placeOfDelivery: 'hospital',
                attendantAtBirth: 'Midwife',
                hospitalName: 'Glaco Maternity Home',
                addressLine1: 'Glaco Maternity Home',
                addressLine2: 'P.O. Box 23',
                addressLine3: 'Swedru',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: ''
            } 
        ],
        informant: [
            {
                uuid: '4325ba3a09ae4a3e91267d58a875dbb2',
                prefix: 'Mr',
                given: 'John',
                family: 'Mahama',
                relationship: 'father',
                addressLine1: 'P.O. Box 23',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: '',
                personalIDNummber: 'GH95463256',
                email: 'john.mahama@gmail.com',
                phone: '024 125 9867'
            }
        ]
    },{
        uuid: '51643c464e534ba085abff25dd18844a',
        tracking: 'BD-51643c464eKA',
        childDetails: '13',
        motherDetails: '14',
        fatherDetails: '15',
        code: 'birth-declaration',
        status: 'new',
        created_at: Moment().subtract(2, 'days').utc().format('ddd MMM DD YYYY HH:mm:ss z'),
        locations: [
            {
                placeOfDelivery: 'clinic',
                attendantAtBirth: 'Midwife',
                hospitalName: 'Ahamadiyya Hospital',
                addressLine1: 'P.O. Box 19',
                addressLine2: '',
                addressLine3: 'Swedru',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: ''
            } 
        ],
        informant: [
            {
                uuid: '6fd03615f69c4effac12993fac47eef4',
                prefix: 'Mr',
                given: 'Tony',
                family: 'Yeboah',
                relationship: 'father',
                addressLine1: 'P.O. Box 23',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: '',
                personalIDNummber: 'GH54231654',
                email: 'tony.yeboah@gmail.com',
                phone: '024 964 5321'
            }
        ]
    },{
        uuid: 'e9f4356bec5743e3abb484515b8c50c3',
        tracking: 'BD-e9f4356becJA',
        childDetails: '16',
        motherDetails: '17',
        fatherDetails: '18',
        code: 'birth-notification',
        status: 'new',
        created_at: Moment().subtract(3, 'days').utc().format('ddd MMM DD YYYY HH:mm:ss z'),
        locations: [
            {
                placeOfDelivery: 'home',
                attendantAtBirth: 'none',
                hospitalName: '',
                addressLine1: 'P.O. Box 66',
                addressLine2: '',
                addressLine3: 'Swedru',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: ''
            } 
        ],
        informant: [
            {
                uuid: '924bb7bb5fba4b6ca76448e852e21044',
                prefix: 'Mr',
                given: 'Michael',
                family: 'Blackson',
                relationship: 'father',
                addressLine1: 'P.O. Box 23',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: '',
                personalIDNummber: 'GH76458912',
                email: 'michael.blackson@gmail.com',
                phone: '024 964 5321'
            }
        ]
    }
];


exports.seed = function (knex, Promise) {

    const declPromise = [];
    declarations.forEach((declaration) => {

        declPromise.push(createDeclaration(knex, declaration));
    });

    return Promise.all(declPromise);
};
const createDeclaration = function (knex, declaration) {

    let declarationID;
    return knex.table('declarations')
        .returning('id')
        .insert(
            {
                uuid: declaration.uuid,
                tracking: declaration.tracking,
                motherDetails: declaration.motherDetails,
                fatherDetails: declaration.fatherDetails,
                childDetails: declaration.childDetails,
                code: declaration.code,
                status: declaration.status,
                created_at: declaration.created_at
            })
        .then((id) => {

            declarationID = id[0];
            return knex('locations').insert(
                {
                    placeOfDelivery: declaration.locations[0].placeOfDelivery,
                    attendantAtBirth: declaration.locations[0].attendantAtBirth,
                    hospitalName: declaration.locations[0].hospitalName,
                    addressLine1: declaration.locations[0].addressLine1,
                    addressLine2: declaration.locations[0].addressLine2,
                    addressLine3: declaration.locations[0].addressLine3,
                    city: declaration.locations[0].city,
                    county: declaration.locations[0].county,
                    state: declaration.locations[0].state,
                    postalCode: declaration.locations[0].postalCode,
                    declaration_id: declarationID
                }
            );
        })
        .then(() => {

            return knex('informant').insert(
                {
                    uuid: declaration.informant[0].uuid,
                    prefix: declaration.informant[0].prefix,
                    given: declaration.informant[0].given,
                    family: declaration.informant[0].family,
                    relationship: declaration.informant[0].relationship,
                    addressLine1: declaration.informant[0].addressLine1,
                    addressLine2: declaration.informant[0].addressLine2,
                    addressLine3: declaration.informant[0].addressLine3,
                    city: declaration.informant[0].city,
                    county: declaration.informant[0].county,
                    state: declaration.informant[0].state,
                    postalCode: declaration.informant[0].postalCode,
                    personalIDNummber: declaration.informant[0].personalIDNummber,
                    email: declaration.informant[0].email,
                    phone: declaration.informant[0].phone,
                    declaration_id: declarationID
                }
            );
        });
};
