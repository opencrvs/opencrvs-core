/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:15:23 
 * @Last Modified by:   Euan Millar 
 * @Last Modified time: 2017-07-05 01:15:23 
 */
const Uuid = require('node-uuid');

const declarations = [
    {
        uuid: Uuid.v4(),
        motherDetails: '2',
        fatherDetails: '3',
        childDetails: '1',
        status: 'declaration',
        locations: [
            {
                placeOfDelivery: 'Cape Coast Hospital',
                attendantAtBirth: 'Midwife',
                hospitalName: 'Cape Coast Hospital',
                addressLine1: 'Cape Coast Hospital',
                addressLine2: 'P.O. Box 23',
                addressLine3: 'Cape Coast',
                city: 'Cape Coast',
                county: 'Cape Coast Metropolitan',
                state: 'Central Region',
                postalCode: ''
            } 
        ]
    },{
        uuid: Uuid.v4(),
        motherDetails: '5',
        fatherDetails: '6',
        childDetails: '4',
        status: 'declaration',
        locations: [
            {
                placeOfDelivery: 'Abura Clinic',
                attendantAtBirth: 'Midwife',
                hospitalName: 'Abura Clinic',
                addressLine1: 'P.O. Box 19',
                addressLine2: '',
                addressLine3: 'Abura',
                city: 'Abura',
                county: 'Abura/Asebu/Kwamankese',
                state: 'Central Region',
                postalCode: ''
            } 
        ]
    },{
        uuid: Uuid.v4(),
        motherDetails: '8',
        fatherDetails: '9',
        childDetails: '7',
        status: 'declaration',
        locations: [
            {
                placeOfDelivery: 'home',
                attendantAtBirth: 'none',
                hospitalName: '',
                addressLine1: 'P.O. Box 66',
                addressLine2: '',
                addressLine3: 'Ekroful',
                city: 'Ekroful',
                county: 'Gomoa East',
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
                motherDetails: declaration.motherDetails,
                fatherDetails: declaration.fatherDetails,
                childDetails: declaration.childDetails,
                status: declaration.status
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
