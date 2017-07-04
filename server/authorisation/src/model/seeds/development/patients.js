

const Uuid = require('node-uuid');

const patients = [
    {
        uuid: Uuid.v4(),
        prefix: 'ch',
        given: 'Kojo, Emmanuel',
        family: 'Abraham',
        birthDate: '2017-06-25',
        gender: 'male',
        nationality: 'Ghana',
        maritalStatus: '',
        address: [
            {
                addressLine1: 'P.O. Box 5555',
                addressLine2: '',
                addressLine3: 'Cape Coast',
                city: 'Cape Coast',
                county: 'Cape Coast Metropolitan',
                state: 'Central Region',
                postalCode: ''
            }
        ],
        telecom: [
            {
                email: '',
                phone: '',
                use: ''
            }
        ],
        extra: [
            {
                childrenBornAlive: '',
                childrenBornLiving: '',
                foetalDeaths: '',
                birthDateLast: '',
                formalEducation: '',
                occupation: '',
                religion: '',
                employment: '',
                personalIDNummber: '',
                maidenName: '',
                marriageDate: ''
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'Mrs',
        given: 'Adzo, Enam',
        family: 'Abraham',
        birthDate: '1985-02-02',
        gender: 'female',
        nationality: 'Ghana',
        maritalStatus: 'Married',
        address: [
            {
                addressLine1: 'P.O. Box 5555',
                addressLine2: '',
                addressLine3: 'Cape Coast',
                city: 'Cape Coast',
                county: 'Cape Coast Metropolitan',
                state: 'Central Region',
                postalCode: ''
            }
        ],
        telecom: [
            {
                email: 'adzo.e.abraham@gmail.com',
                phone: '024 222 3344',
                use: 'phone'
            }
        ],
        extra: [
            {
                childrenBornAlive: '3',
                childrenBornLiving: '3',
                foetalDeaths: '0',
                birthDateLast: '2005-12-23',
                formalEducation: 'University',
                occupation: 'Teacher',
                religion: 'Catholic',
                employment: 'full-time',
                personalIDNummber: 'GH37494872',
                maidenName: 'Ayittey',
                marriageDate: '2007-09-23'
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'Mr',
        given: 'Kobena, Dommie',
        family: 'Abraham',
        birthDate: '1985-07-15',
        gender: 'male',
        nationality: 'Ghana',
        maritalStatus: 'Married',
        address: [
            {
                addressLine1: 'P.O. Box 5555',
                addressLine2: '',
                addressLine3: 'Cape Coast',
                city: 'Cape Coast',
                county: 'Cape Coast Metropolitan',
                state: 'Central Region',
                postalCode: ''
            }
        ],
        telecom: [
            {
                email: 'kobena.d.abraham@gmail.com',
                phone: '024 222 3344',
                use: 'phone'
            }
        ],
        extra: [
            {
                childrenBornAlive: '',
                childrenBornLiving: '',
                foetalDeaths: '',
                birthDateLast: '',
                formalEducation: 'University',
                occupation: 'Civil Servant',
                religion: 'Catholic',
                employment: 'full-time',
                personalIDNummber: 'GH37874872',
                maidenName: '',
                marriageDate: '2007-09-23'
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'ch',
        given: 'Kwasi, Kwarfo',
        family: 'Adarkwa',
        birthDate: '2017-06-25',
        gender: 'male',
        nationality: 'Ghana',
        maritalStatus: '',
        address: [
            {
                addressLine1: 'P.O. Box 78',
                addressLine2: '',
                addressLine3: 'Abura',
                city: 'Abura',
                county: 'Abura/Asebu/Kwamankese',
                state: 'Central Region',
                postalCode: ''
            }
        ],
        telecom: [
            {
                email: '',
                phone: '',
                use: ''
            }
        ],
        extra: [
            {
                childrenBornAlive: '',
                childrenBornLiving: '',
                foetalDeaths: '',
                birthDateLast: '',
                formalEducation: '',
                occupation: '',
                religion: '',
                employment: '',
                personalIDNummber: '',
                maidenName: '',
                marriageDate: ''
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'Mrs',
        given: 'Jane, Naana',
        family: 'Adarkwa',
        birthDate: '1982-12-02',
        gender: 'female',
        nationality: 'Ghana',
        maritalStatus: 'Married',
        address: [
            {
                addressLine1: 'P.O. Box 78',
                addressLine2: '',
                addressLine3: 'Abura',
                city: 'Abura',
                county: 'Abura/Asebu/Kwamankese',
                state: 'Central Region',
                postalCode: ''
            }
        ],
        telecom: [
            {
                email: 'jane.adarkwa@gmail.com',
                phone: '024 239 6756',
                use: 'phone'
            }
        ],
        extra: [
            {
                childrenBornAlive: '1',
                childrenBornLiving: '1',
                foetalDeaths: '0',
                birthDateLast: '',
                formalEducation: 'High School',
                occupation: 'Market Trader',
                religion: 'Catholic',
                employment: 'part-time',
                personalIDNummber: 'GH37494872',
                maidenName: 'Jackson',
                marriageDate: '2006-06-15'
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'Mr',
        given: 'Kweku, Joseph',
        family: 'Adarkwa',
        birthDate: '1980-01-20',
        gender: 'male',
        nationality: 'Ghana',
        maritalStatus: 'Married',
        address: [
            {
                addressLine1: 'P.O. Box 78',
                addressLine2: '',
                addressLine3: 'Abura',
                city: 'Abura',
                county: 'Abura/Asebu/Kwamankese',
                state: 'Central Region',
                postalCode: ''
            }
        ],
        telecom: [
            {
                email: 'kweku.j.adarkwa@gmail.com',
                phone: '024 239 5431',
                use: 'phone'
            }
        ],
        extra: [
            {
                childrenBornAlive: '',
                childrenBornLiving: '',
                foetalDeaths: '',
                birthDateLast: '',
                formalEducation: 'University',
                occupation: 'Doctor',
                religion: 'Catholic',
                employment: 'full-time',
                personalIDNummber: 'GH37826031',
                maidenName: '',
                marriageDate: '2006-06-15'
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'ch',
        given: 'Nana, Oforiatta',
        family: 'Ayim',
        birthDate: '2017-06-26',
        gender: 'female',
        nationality: 'Ghana',
        maritalStatus: '',
        address: [
            {
                addressLine1: 'P.O. Box 66',
                addressLine2: '',
                addressLine3: 'Ekroful',
                city: 'Ekroful',
                county: 'Gomoa East',
                state: 'Central Region',
                postalCode: ''
            }
        ],
        telecom: [
            {
                email: '',
                phone: '',
                use: ''
            }
        ],
        extra: [
            {
                childrenBornAlive: '',
                childrenBornLiving: '',
                foetalDeaths: '',
                birthDateLast: '',
                formalEducation: '',
                occupation: '',
                religion: '',
                employment: '',
                personalIDNummber: '',
                maidenName: '',
                marriageDate: ''
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'Mrs',
        given: 'Kisi, Huda',
        family: 'Ayim',
        birthDate: '1999-04-02',
        gender: 'female',
        nationality: 'Ghana',
        maritalStatus: 'Single',
        address: [
            {
                addressLine1: 'P.O. Box 66',
                addressLine2: '',
                addressLine3: 'Ekroful',
                city: 'Ekroful',
                county: 'Gomoa East',
                state: 'Central Region',
                postalCode: ''
            }
        ],
        telecom: [
            {
                email: '',
                phone: '024 221 3378',
                use: 'phone'
            }
        ],
        extra: [
            {
                childrenBornAlive: '1',
                childrenBornLiving: '1',
                foetalDeaths: '0',
                birthDateLast: '',
                formalEducation: 'High School',
                occupation: 'Weaver',
                religion: 'Catholic',
                employment: 'full-time',
                personalIDNummber: 'GH37888795',
                maidenName: '',
                marriageDate: ''
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'Mr',
        given: 'Donkor, Fram',
        family: 'Agyapong',
        birthDate: '1998-06-04',
        gender: 'male',
        nationality: 'Ghana',
        maritalStatus: 'Single',
        address: [
            {
                addressLine1: 'P.O. Box 66',
                addressLine2: '',
                addressLine3: 'Ekroful',
                city: 'Ekroful',
                county: 'Gomoa East',
                state: 'Central Region',
                postalCode: ''
            }
        ],
        telecom: [
            {
                email: '',
                phone: '024 989 7845',
                use: 'phone'
            }
        ],
        extra: [
            {
                childrenBornAlive: '',
                childrenBornLiving: '',
                foetalDeaths: '',
                birthDateLast: '',
                formalEducation: 'High School',
                occupation: 'Market Trader',
                religion: 'Catholic',
                employment: 'full-time',
                personalIDNummber: 'GH50025698',
                maidenName: '',
                marriageDate: ''
            }
        ]
    }
];


exports.seed = function (knex, Promise) {

    const patientPromises = [];
    let nextID = 0;
    patients.forEach((patient) => {

        patientPromises.push(createPatient(knex, patient));
        nextID++;
        patientPromises.push(createTelecom(knex, patient, nextID));
        patientPromises.push(createExtra(knex, patient, nextID));
        console.log(JSON.stringify(nextID));
    });

    return Promise.all(patientPromises);
};
const createPatient = function (knex, patient) {

    return knex.table('patients')
        .returning('id')
        .insert(
            {
                uuid: patient.uuid,
                prefix: patient.prefix,
                given: patient.given,
                family: patient.family,
                birthDate: patient.birthDate,
                gender: patient.gender,
                maritalStatus: patient.maritalStatus,
                nationality: patient.nationality
            })
        .then((id) => {

            console.log('ID: ' + id[0]);
            return knex('address').insert(
                {
                    addressLine1: patient.address[0].addressLine1,
                    addressLine2: patient.address[0].addressLine2,
                    addressLine3: patient.address[0].addressLine3,
                    city: patient.address[0].city,
                    county: patient.address[0].county,
                    state: patient.address[0].state,
                    postalCode: patient.address[0].postalCode,
                    patient_id: id[0]
                });
        });
};

const createTelecom = function (knex, patient, patientID) {

    console.log('patient.telecom[0]: ' + patient.telecom[0]);
    console.log('patientID: ' + patientID);
    if (patient.telecom[0]){
        return knex('telecom').insert(
            {
                email: patient.telecom[0].email,
                phone: patient.telecom[0].phone,
                use: patient.telecom[0].use,
                patient_id: patientID
            });
    }
    
};

const createExtra = function (knex, patient, patientID) {


    console.log('patientID: ' + patientID);

    return knex('extra').insert(
        {
            childrenBornAlive: patient.extra[0].childrenBornAlive,
            childrenBornLiving: patient.extra[0].childrenBornLiving,
            foetalDeaths: patient.extra[0].foetalDeaths,
            birthDateLast: patient.extra[0].birthDateLast,
            formalEducation: patient.extra[0].formalEducation,
            occupation: patient.extra[0].occupation,
            religion: patient.extra[0].religion,
            employment: patient.extra[0].employment,
            personalIDNummber: patient.extra[0].personalIDNummber,
            maidenName: patient.extra[0].maidenName,
            marriageDate: patient.extra[0].marriageDate,
            patient_id: patientID
        });


};

