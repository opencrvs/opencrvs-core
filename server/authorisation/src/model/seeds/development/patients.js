/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:15:16 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-10 15:49:01
 */


const Moment = require('moment');
const Uuid = require('node-uuid');

const patients = [
    {
        uuid: Uuid.v4(),
        prefix: 'ch',
        given: 'Kojo, Emmanuel',
        family: 'Adjei',
        birthDate: Moment().subtract(1, 'days').utc().format('ddd MMM DD YYYY HH:mm:ss z'),
        gender: 'male',
        nationality: 'Ghana',
        maritalStatus: '',
        address: [
            {
                addressLine1: 'P.O. Box 5555',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
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
                marriageDate: '',
                typeOfBirth: ''
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'Mrs',
        given: 'Nana, Enam',
        family: 'Adjei',
        birthDate: '1985-02-02',
        gender: 'female',
        nationality: 'Ghana',
        maritalStatus: 'Married',
        address: [
            {
                addressLine1: 'P.O. Box 5555',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: ''
            }
        ],
        telecom: [
            {
                email: 'nana.e.Adjei@gmail.com',
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
                personalIDNummber: 'G120603',
                maidenName: 'Ayittey',
                marriageDate: '2007-09-23',
                typeOfBirth: ''
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'Mr',
        given: 'Kobena, Dommie',
        family: 'Adjei',
        birthDate: '1985-07-15',
        gender: 'male',
        nationality: 'Ghana',
        maritalStatus: 'Married',
        address: [
            {
                addressLine1: 'P.O. Box 5555',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: ''
            }
        ],
        telecom: [
            {
                email: 'kobena.d.Adjei@gmail.com',
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
                marriageDate: '2007-09-23',
                typeOfBirth: ''
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'ch',
        given: 'Kwasi, Kwarfo',
        family: 'Adarkwa',
        birthDate: Moment().subtract(2, 'days').utc().format('ddd MMM DD YYYY HH:mm:ss z'),
        gender: 'male',
        nationality: 'Ghana',
        maritalStatus: '',
        address: [
            {
                addressLine1: 'P.O. Box 78',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
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
                marriageDate: '',
                typeOfBirth: ''
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
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
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
                marriageDate: '2006-06-15',
                typeOfBirth: ''
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
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
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
                marriageDate: '2006-06-15',
                typeOfBirth: ''
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'ch',
        given: 'Nana, Oforiatta',
        family: 'Ayim',
        birthDate: Moment().subtract(3, 'days').utc().format('ddd MMM DD YYYY HH:mm:ss z'),
        gender: 'female',
        nationality: 'Ghana',
        maritalStatus: '',
        address: [
            {
                addressLine1: 'P.O. Box 66',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
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
                marriageDate: '',
                typeOfBirth: ''
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
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
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
                marriageDate: '',
                typeOfBirth: ''
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
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
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
                marriageDate: '',
                typeOfBirth: ''
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'ch',
        given: 'John, Peter',
        family: 'Dansua',
        birthDate: Moment().subtract(1, 'days').utc().format('ddd MMM DD YYYY HH:mm:ss z'),
        gender: 'male',
        nationality: 'Ghana',
        maritalStatus: '',
        address: [
            {
                addressLine1: 'P.O. Box 879',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
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
                marriageDate: '',
                typeOfBirth: ''
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'Mrs',
        given: 'Abam, Esther',
        family: 'Dansua',
        birthDate: '1985-02-02',
        gender: 'female',
        nationality: 'Ghana',
        maritalStatus: 'Married',
        address: [
            {
                addressLine1: 'P.O. Box 879',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: ''
            }
        ],
        telecom: [
            {
                email: 'abam.e.dansua@gmail.com',
                phone: '024 789 3655',
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
                personalIDNummber: 'GH12587965',
                maidenName: 'Adu',
                marriageDate: '2007-09-23',
                typeOfBirth: ''
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'Mr',
        given: 'Frederick, Jerry',
        family: 'Dansua',
        birthDate: '1985-07-15',
        gender: 'male',
        nationality: 'Ghana',
        maritalStatus: 'Married',
        address: [
            {
                addressLine1: 'P.O. Box 879',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: ''
            }
        ],
        telecom: [
            {
                email: 'freddy.j.dansua@gmail.com',
                phone: '024 654 4489',
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
                personalIDNummber: 'GH49652387',
                maidenName: '',
                marriageDate: '2007-09-23',
                typeOfBirth: ''
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'ch',
        given: 'Sally, Hilda',
        family: 'Akufo-Addo',
        birthDate: Moment().subtract(2, 'days').utc().format('ddd MMM DD YYYY HH:mm:ss z'),
        gender: 'female',
        nationality: 'Ghana',
        maritalStatus: '',
        address: [
            {
                addressLine1: 'P.O. Box 1365',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
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
                marriageDate: '',
                typeOfBirth: ''
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'Mrs',
        given: 'Samia, Coffie',
        family: 'Akufo-Addo',
        birthDate: '1985-02-02',
        gender: 'female',
        nationality: 'Ghana',
        maritalStatus: 'Married',
        address: [
            {
                addressLine1: 'P.O. Box 1365',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: ''
            }
        ],
        telecom: [
            {
                email: 'samia.c.akufo-addo@gmail.com',
                phone: '024 458 7923',
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
                personalIDNummber: 'GH37379465',
                maidenName: 'Nikrumah',
                marriageDate: '2007-09-23',
                typeOfBirth: ''
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'Mr',
        given: 'Isaac, Kaldezi',
        family: 'Akufo-Addo',
        birthDate: '1985-07-15',
        gender: 'male',
        nationality: 'Ghana',
        maritalStatus: 'Married',
        address: [
            {
                addressLine1: 'P.O. Box 1365',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: ''
            }
        ],
        telecom: [
            {
                email: 'isaac.akufo-addo@gmail.com',
                phone: '024 145 1122',
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
                personalIDNummber: 'GH1398563',
                maidenName: '',
                marriageDate: '2007-09-23',
                typeOfBirth: ''
            }
        ]
    },
    /////
    {
        uuid: Uuid.v4(),
        prefix: 'ch',
        given: 'Pearl, Hilda',
        family: 'Kaledzi',
        birthDate: Moment().subtract(3, 'days').utc().format('ddd MMM DD YYYY HH:mm:ss z'),
        gender: 'female',
        nationality: 'Ghana',
        maritalStatus: '',
        address: [
            {
                addressLine1: 'P.O. Box 9615',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
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
                marriageDate: '',
                typeOfBirth: ''
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'Mrs',
        given: 'Samihah, Riham',
        family: 'Kaledzi',
        birthDate: '1985-02-02',
        gender: 'female',
        nationality: 'Ghana',
        maritalStatus: 'Married',
        address: [
            {
                addressLine1: 'P.O. Box 9615',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: ''
            }
        ],
        telecom: [
            {
                email: 'samihah.r.kaledzi@gmail.com',
                phone: '024 913 6789',
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
                personalIDNummber: 'GH39136587',
                maidenName: 'Dumor',
                marriageDate: '2007-09-23',
                typeOfBirth: ''
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'Mr',
        given: 'Cameron, Nathaniel',
        family: 'Kaledzi',
        birthDate: '1985-07-15',
        gender: 'male',
        nationality: 'Ghana',
        maritalStatus: 'Married',
        address: [
            {
                addressLine1: 'P.O. Box 9615',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: ''
            }
        ],
        telecom: [
            {
                email: 'cameron.kaledzi@gmail.com',
                phone: '024 897 1365',
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
                personalIDNummber: 'GH13659877',
                maidenName: '',
                marriageDate: '2007-09-23',
                typeOfBirth: ''
            }
        ]
    },
    /////
    {
        uuid: Uuid.v4(),
        prefix: 'ch',
        given: 'Shafiq, Kent',
        family: 'Ampofo',
        birthDate: Moment().subtract(1, 'days').utc().format('ddd MMM DD YYYY HH:mm:ss z'),
        gender: 'male',
        nationality: 'Ghana',
        maritalStatus: '',
        address: [
            {
                addressLine1: 'P.O. Box 9764',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
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
                marriageDate: '',
                typeOfBirth: ''
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'Mrs',
        given: 'Yaa, Abeena',
        family: 'Ampofo',
        birthDate: '1985-02-02',
        gender: 'female',
        nationality: 'Ghana',
        maritalStatus: 'Married',
        address: [
            {
                addressLine1: 'P.O. Box 9764',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: ''
            }
        ],
        telecom: [
            {
                email: 'yaa.a.Ampofo@gmail.com',
                phone: '024 649 1987',
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
                personalIDNummber: 'GH36562567',
                maidenName: 'Mensa',
                marriageDate: '2007-09-23',
                typeOfBirth: ''
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'Mr',
        given: 'Aban, Adeben',
        family: 'Ampofo',
        birthDate: '1985-07-15',
        gender: 'male',
        nationality: 'Ghana',
        maritalStatus: 'Married',
        address: [
            {
                addressLine1: 'P.O. Box 9764',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: ''
            }
        ],
        telecom: [
            {
                email: 'aban.ampofo@gmail.com',
                phone: '024 975 8698',
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
                personalIDNummber: 'GH13956264',
                maidenName: '',
                marriageDate: '2007-09-23',
                typeOfBirth: ''
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'ch',
        given: 'Coujoe, Gamal',
        family: 'Nkrumah',
        birthDate: Moment().subtract(2, 'days').utc().format('ddd MMM DD YYYY HH:mm:ss z'),
        gender: 'male',
        nationality: 'Ghana',
        maritalStatus: '',
        address: [
            {
                addressLine1: 'P.O. Box 7986',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
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
                marriageDate: '',
                typeOfBirth: ''
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'Mrs',
        given: 'Bashirah, Awo',
        family: 'Nkrumah',
        birthDate: '1985-02-02',
        gender: 'female',
        nationality: 'Ghana',
        maritalStatus: 'Married',
        address: [
            {
                addressLine1: 'P.O. Box 7986',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: ''
            }
        ],
        telecom: [
            {
                email: 'Bashirah.a.Nkrumah@gmail.com',
                phone: '024 965 1365',
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
                personalIDNummber: 'GH99856325',
                maidenName: 'Attoh',
                marriageDate: '2007-09-23',
                typeOfBirth: ''
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'Mr',
        given: 'Afua, Hirsch',
        family: 'Nkrumah',
        birthDate: '1985-07-15',
        gender: 'male',
        nationality: 'Ghana',
        maritalStatus: 'Married',
        address: [
            {
                addressLine1: 'P.O. Box 7986',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: ''
            }
        ],
        telecom: [
            {
                email: 'Afua.Nkrumah@gmail.com',
                phone: '024 123 3568',
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
                personalIDNummber: 'GH1968576',
                maidenName: '',
                marriageDate: '2007-09-23',
                typeOfBirth: ''
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'ch',
        given: 'Baba, Awusi',
        family: 'Konadu',
        birthDate: Moment().subtract(3, 'days').utc().format('ddd MMM DD YYYY HH:mm:ss z'),
        gender: 'male',
        nationality: 'Ghana',
        maritalStatus: '',
        address: [
            {
                addressLine1: 'P.O. Box 9875',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
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
                marriageDate: '',
                typeOfBirth: ''
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'Mrs',
        given: 'Yaba, Christina',
        family: 'Konadu',
        birthDate: '1985-02-02',
        gender: 'female',
        nationality: 'Ghana',
        maritalStatus: 'Married',
        address: [
            {
                addressLine1: 'P.O. Box 9875',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: ''
            }
        ],
        telecom: [
            {
                email: 'Yaba.c.Konadu@gmail.com',
                phone: '024 645 1958',
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
                personalIDNummber: 'GH99658745',
                maidenName: 'Afrira',
                marriageDate: '2007-09-23',
                typeOfBirth: ''
            }
        ]
    },
    {
        uuid: Uuid.v4(),
        prefix: 'Mr',
        given: 'Gamal, Roland',
        family: 'Konadu',
        birthDate: '1985-07-15',
        gender: 'male',
        nationality: 'Ghana',
        maritalStatus: 'Married',
        address: [
            {
                addressLine1: 'P.O. Box 9875',
                addressLine2: '',
                addressLine3: '',
                city: 'Swedru',
                county: 'Agona West Municipal',
                state: 'Central Region',
                postalCode: ''
            }
        ],
        telecom: [
            {
                email: 'Gamal.Konadu@gmail.com',
                phone: '024 987 6585',
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
                personalIDNummber: 'GH65487965',
                maidenName: '',
                marriageDate: '2007-09-23',
                typeOfBirth: ''
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
            typeOfBirth: patient.extra[0].typeOfBirth,
            patient_id: patientID
        });


};

