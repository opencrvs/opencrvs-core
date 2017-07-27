/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:15:23 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-26 20:21:02
 */

const Moment = require('moment');



const declarations = [
    {
        uuid: 'f08150eeeeb84dc19ac6456591956489',
        tracking: 'BD-70514629L',
        motherDetails: '2',
        fatherDetails: '3',
        childDetails: '1',
        code: 'birth-declaration',
        status: 'saved',
        created_at: Moment().subtract(1, 'days').utc().format('ddd MMM DD YYYY HH:mm:ss z'),
        locations: [
            {
                placeOfDelivery: 'hospital',
                attendantAtBirth: 'Midwife',
                hospitalName: 'Cape Coast Hospital',
                addressLine1: 'Cape Coast Hospital',
                addressLine2: 'P.O. Box 23',
                addressLine3: 'Kwaman',
                city: 'Kwaman',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: ''
            } 
        ]
    },{
        uuid: 'f9e2525862d34db8b497b48f68471b70',
        tracking: 'BD-15727985L',
        motherDetails: '5',
        fatherDetails: '6',
        childDetails: '4',
        code: 'birth-declaration',
        status: 'saved',
        created_at: Moment().subtract(2, 'days').utc().format('ddd MMM DD YYYY HH:mm:ss z'),
        locations: [
            {
                placeOfDelivery: 'clinic',
                attendantAtBirth: 'Midwife',
                hospitalName: 'Abura Clinic',
                addressLine1: 'P.O. Box 19',
                addressLine2: '',
                addressLine3: 'Mankrong',
                city: 'Mankrong',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: ''
            } 
        ]
    },{
        uuid: '8ac7ca2c58d743988d51677fdd755d3c',
        tracking: 'BD-64747259L',
        motherDetails: '8',
        fatherDetails: '9',
        childDetails: '7',
        code: 'birth-declaration',
        status: 'saved',
        created_at: Moment().subtract(3, 'days').utc().format('ddd MMM DD YYYY HH:mm:ss z'),
        locations: [
            {
                placeOfDelivery: 'home',
                attendantAtBirth: 'none',
                hospitalName: '',
                addressLine1: 'P.O. Box 66',
                addressLine2: '',
                addressLine3: 'Asafo',
                city: 'Asafo',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: ''
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
                    declaration_id: id[0]
                });
        });
};
