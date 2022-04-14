/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
const childDetails = {
  firstNamesEng: 'Harry',
  familyNameEng: 'Kane',
  gender: 'male',
  childBirthDate: '2020-02-02',
  attendantAtBirth: 'NURSE',
  birthType: 'SINGLE',
  multipleBirth: 1,
  weightAtBirth: 5,
  placeOfBirthTitle: '',
  placeOfBirth: 'HEALTH_FACILITY',
  birthLocation: 'ecc82ed2-960d-4a92-9c42-67cace118a02',
  country: 'FAR',
  state: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
  district: '852b103f-2fe0-4871-a323-51e51c6d9198',
  ruralOrUrban: 'URBAN',
  addressChief: '',
  addressLine4CityOption: '',
  addressLine3CityOption: '',
  addressLine2CityOption: '',
  numberOption: '',
  addressLine1: '',
  internationalState: '',
  internationalDistrict: '',
  internationalCity: '',
  internationalAddressLine1: '',
  internationalAddressLine2: '',
  internationalAddressLine3: '',
  internationalPostcode: ''
}

const fatherDetailsForBirth = {
  fathersDetailsExist: true,
  iD: '654654654',
  socialSecurityNo: '65454984',
  nationality: 'FAR',
  firstNamesEng: 'Frank',
  familyNameEng: 'Kane',
  fatherBirthDate: '1990-12-23',
  seperator: '',
  maritalStatus: 'MARRIED',
  occupation: 'Teacher',
  educationalAttainment: 'FIRST_STAGE_TERTIARY_ISCED_5',
  permanentAddressSameAsMother: true,
  permanentAddress: '',
  countryPermanent: 'FAR',
  statePermanent: '',
  districtPermanent: '',
  ruralOrUrbanPermanent: 'URBAN',
  addressChiefPermanent: '',
  addressLine4CityOptionPermanent: '',
  addressLine3CityOptionPermanent: '',
  addressLine2CityOptionPermanent: '',
  numberOptionPermanent: '',
  addressLine1Permanent: '',
  internationalStatePermanent: '',
  internationalDistrictPermanent: '',
  internationalCityPermanent: '',
  internationalAddressLine1Permanent: '',
  internationalAddressLine2Permanent: '',
  internationalAddressLine3Permanent: '',
  internationalPostcodePermanent: ''
}

const motherDetailsForBirth = {
  nationality: 'FAR',
  iD: '987987987',
  socialSecurityNo: 'aferf',
  firstNamesEng: 'Sally',
  familyNameEng: 'Kane',
  motherBirthDate: '1990-02-02',
  seperator: '',
  maritalStatus: 'MARRIED',
  occupation: 'Teacher',
  educationalAttainment: 'FIRST_STAGE_TERTIARY_ISCED_5',
  placeOfHeritage: '',
  countryPlaceOfHeritage: 'FAR',
  statePlaceOfHeritage: 'f050a94e-4e61-4cfb-a9ac-b3e96096e267',
  districtPlaceOfHeritage: 'dfe133d1-1aed-41b3-8a9d-c525f8bf19b9',
  addressChiefPlaceOfHeritage: 'My cheif',
  addressLine1PlaceOfHeritage: 'My village',
  internationalStatePlaceOfHeritage: '',
  internationalDistrictPlaceOfHeritage: '',
  internationalCityPlaceOfHeritage: '',
  internationalAddressLine1PlaceOfHeritage: '',
  internationalAddressLine2PlaceOfHeritage: '',
  internationalAddressLine3PlaceOfHeritage: '',
  internationalPostcodePlaceOfHeritage: '',
  permanentAddress: '',
  countryPermanent: 'FAR',
  statePermanent: '169981c1-89af-44f9-906a-bf783028ed14',
  districtPermanent: '3bde1e85-59fc-4b92-9477-95c9564b377d',
  ruralOrUrbanPermanent: 'URBAN',
  addressChiefPermanent: '',
  addressLine4CityOptionPermanent: 'My town',
  addressLine3CityOptionPermanent: 'My residential area',
  addressLine2CityOptionPermanent: 'My street',
  numberOptionPermanent: 19,
  addressLine1Permanent: '',
  internationalStatePermanent: '',
  internationalDistrictPermanent: '',
  internationalCityPermanent: '',
  internationalAddressLine1Permanent: '',
  internationalAddressLine2Permanent: '',
  internationalAddressLine3Permanent: '',
  internationalPostcodePermanent: '',
  currentAddressSameAsPermanent: true,
  currentAddress: '',
  country: 'FAR',
  state: '',
  district: '',
  ruralOrUrban: 'URBAN',
  addressChief: '',
  addressLine4CityOption: '',
  addressLine3CityOption: '',
  addressLine2CityOption: '',
  numberOption: '',
  addressLine1: '',
  internationalState: '',
  internationalDistrict: '',
  internationalCity: '',
  internationalAddressLine1: '',
  internationalAddressLine2: '',
  internationalAddressLine3: '',
  internationalPostcode: ''
}

const registrationDetailsForBirth = {
  commentsOrNotes: 'comments',
  registrationCertificateLanguage: ['en'],
  informantType: {
    value: 'MOTHER',
    nestedFields: { otherInformantType: '' }
  },
  contactPoint: {
    value: 'OTHER',
    nestedFields: { registrationPhone: '0787878787' }
  }
}

export const birthDraftData = {
  child: childDetails,
  father: fatherDetailsForBirth,
  mother: motherDetailsForBirth,
  registration: registrationDetailsForBirth,
  documents: { imageUploader: '' }
}

export const birthReviewDraftData = {
  _fhirIDMap: {
    composition: '11'
  },
  child: {
    ...childDetails,
    _fhirID: '1'
  },
  father: {
    ...fatherDetailsForBirth,
    _fhirID: '2'
  },
  mother: {
    ...motherDetailsForBirth,
    _fhirID: '3'
  },
  registration: {
    ...registrationDetailsForBirth,
    _fhirID: '4'
  },
  documents: {
    imageUploader: [
      {
        data: 'base64-data',
        type: 'image/jpeg',
        optionValues: ['Mother', 'National ID (front)'],
        title: 'Mother',
        description: 'National ID (front)'
      }
    ]
  }
}

const deceasedDetails = {
  iD: '987987987',
  socialSecurityNo: 'dstgsgs',
  nationality: 'FAR',
  firstNamesEng: 'Harry',
  familyNameEng: 'Kane',
  birthDate: '1990-02-02',
  gender: 'male',
  seperator: '',
  maritalStatus: 'MARRIED',
  occupation: 'Teacher',
  permanentAddress: '',
  countryPermanent: 'FAR',
  statePermanent: '169981c1-89af-44f9-906a-bf783028ed14',
  districtPermanent: '871f290e-8c7c-4643-b79b-2465af5f3303',
  ruralOrUrbanPermanent: 'URBAN',
  addressChiefPermanent: '',
  addressLine4CityOptionPermanent: 'My town',
  addressLine3CityOptionPermanent: 'My residential area',
  addressLine2CityOptionPermanent: 'My street',
  numberOptionPermanent: 19,
  addressLine1Permanent: '',
  internationalStatePermanent: '',
  internationalDistrictPermanent: '',
  internationalCityPermanent: '',
  internationalAddressLine1Permanent: '',
  internationalAddressLine2Permanent: '',
  internationalAddressLine3Permanent: '',
  internationalPostcodePermanent: '',
  _fhirID: '50fbd713-c86d-49fe-bc6a-52094b40d8dd'
}

const informantDetailsForDeath = {
  nationality: 'FAR',
  informantID: '654654654',
  firstNamesEng: 'Sally',
  familyNameEng: 'Kane',
  relationship: '',
  permanentAddress: '',
  countryPermanent: 'FAR',
  statePermanent: 'ef97aebc-2461-473f-bf6e-456ed1e1a217',
  districtPermanent: '901a5fc1-456e-4f9c-9d3e-1859ad321837',
  ruralOrUrbanPermanent: 'URBAN',
  addressChiefPermanent: '',
  addressLine4CityOptionPermanent: 'My Town',
  addressLine3CityOptionPermanent: 'My area',
  addressLine2CityOptionPermanent: 'My street',
  numberOptionPermanent: 12,
  addressLine1Permanent: '',
  internationalState: '',
  internationalDistrict: '',
  internationalCity: '',
  internationalAddressLine1: '',
  internationalAddressLine2: '',
  internationalAddressLine3: '',
  internationalPostcode: '',
  _fhirIDMap: {
    relatedPerson: 'c9e3e5cb-d483-4db4-afaa-625161826f00',
    individual: 'cabeeea7-0f7d-41c3-84ed-8f88e4d617e1'
  }
}

const fatherDetailsForDeath = {
  fatherFirstNamesEng: 'Bill',
  fatherFamilyNameEng: 'Kane'
}

const motherDetailsForDeath = {
  motherFirstNamesEng: 'Francis',
  motherFamilyNameEng: 'Kane'
}

const spouseDetailsForDeath = {
  hasDetails: {
    value: 'Yes',
    nestedFields: {
      spouseFirstNamesEng: 'Sally',
      spouseFamilyNameEng: 'Kane'
    }
  }
}

const deathEventDetails = {
  deathDate: '2022-04-10',
  manner: 'NATURAL_CAUSES',
  deathPlaceAddress: 'PERMANENT'
}
const causeOfDeathDetails = {
  causeOfDeathEstablished: true,
  paragraph: '',
  causeOfDeathCode: 'Natural causes'
}

const registrationDetailsForDeath = {
  _fhirID: 'fccf6eac-4dae-43d3-af33-2c977d1daf08',
  trackingId: 'DS8QZ0Z',
  type: 'death',
  informantType: {
    value: 'SPOUSE',
    nestedFields: { otherInformantType: '' }
  },
  contactPoint: {
    value: 'SPOUSE',
    nestedFields: { registrationPhone: '0787877877' }
  }
}

export const deathReviewDraftData = {
  _fhirIDMap: {
    composition: '11'
  },
  deceased: {
    ...deceasedDetails,
    _fhirID: '1'
  },
  informant: {
    ...informantDetailsForDeath,
    _fhirID: '1'
  },
  father: {
    ...fatherDetailsForDeath,
    _fhirID: '2'
  },
  mother: {
    ...motherDetailsForDeath,
    _fhirID: '3'
  },
  spouse: spouseDetailsForDeath,
  deathEvent: deathEventDetails,
  causeOfDeath: causeOfDeathDetails,
  registration: {
    ...registrationDetailsForDeath,
    _fhirID: '4'
  },
  documents: {
    imageUploader: [
      {
        data: 'base64-data',
        type: 'image/jpeg',
        optionValues: ['Mother', 'National ID (front)'],
        title: 'Mother',
        description: 'National ID (front)'
      }
    ]
  }
}
