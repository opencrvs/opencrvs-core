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
  weightAtBirth: 5,
  placeOfBirthTitle: '',
  placeOfBirth: 'HEALTH_FACILITY',
  birthLocation: 'ecc82ed2-960d-4a92-9c42-67cace118a02',
  country: 'BGD',
  state: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
  district: '852b103f-2fe0-4871-a323-51e51c6d9198',
  ruralOrUrban: 'URBAN',
  cityUrbanOption: 'Birth Town',
  addressLine3UrbanOption: 'Birth residential area',
  addressLine2UrbanOption: 'Birth street',
  numberUrbanOption: 'Flat 10',
  postalCode: 'SW1',
  addressLine5: '',
  internationalState: '',
  internationalDistrict: '',
  internationalCity: '',
  internationalAddressLine1: '',
  internationalAddressLine2: '',
  internationalAddressLine3: '',
  internationalPostcode: ''
}

const fatherDetailsForBirth = {
  detailsExist: true,
  reasonNotApplying: '',
  nationality: 'BGD',
  iD: '321654985',
  firstNamesEng: 'Frank',
  familyNameEng: 'Kane',
  fatherBirthDate: '1990-12-23',
  seperator: '',
  maritalStatus: 'MARRIED',
  occupation: 'Teacher',
  educationalAttainment: 'FIRST_STAGE_TERTIARY_ISCED_5',
  primaryAddress: '',
  primaryAddressSameAsOtherPrimary: true,
  countryPrimary: 'BGD',
  statePrimary: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
  districtPrimary: '852b103f-2fe0-4871-a323-51e51c6d9198',
  ruralOrUrbanPrimary: 'URBAN',
  cityUrbanOptionPrimary: '',
  addressLine3UrbanOptionPrimary: '',
  addressLine2UrbanOptionPrimary: '',
  numberUrbanOptionPrimary: '',
  postcodePrimary: '',
  addressLine5Primary: '',
  internationalStatePrimary: '',
  internationalDistrictPrimary: '',
  internationalCityPrimary: '',
  internationalAddressLine1Primary: '',
  internationalAddressLine2Primary: '',
  internationalAddressLine3Primary: '',
  internationalPostcodePrimary: '',
  secondaryAddress: '',
  countrySecondary: 'BGD',
  stateSecondary: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
  districtSecondary: '852b103f-2fe0-4871-a323-51e51c6d9198',
  ruralOrUrbanSecondary: 'URBAN',
  cityUrbanOptionSecondary: '',
  addressLine3UrbanOptionSecondary: '',
  addressLine2UrbanOptionSecondary: '',
  numberUrbanOptionSecondary: '',
  postcodeSecondary: '',
  addressLine5Secondary: '',
  internationalStateSecondary: '',
  internationalDistrictSecondary: '',
  internationalCitySecondary: '',
  internationalAddressLine1Secondary: '',
  internationalAddressLine2Secondary: '',
  internationalAddressLine3Secondary: '',
  internationalPostcodeSecondary: ''
}

const motherDetailsForBirth = {
  nationality: 'FAR',
  iD: '987987987',
  firstNamesEng: 'Sally',
  familyNameEng: 'Kane',
  motherBirthDate: '1990-02-02',
  exactDateOfBirthUnknown: false,
  seperator: '',
  maritalStatus: 'MARRIED',
  multipleBirth: 1,
  occupation: 'Teacher',
  detailsExist: true,
  reasonNotApplying: '',
  educationalAttainment: 'FIRST_STAGE_TERTIARY_ISCED_5',
  primaryAddress: '',
  countryPrimary: 'BGD',
  statePrimary: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
  districtPrimary: '852b103f-2fe0-4871-a323-51e51c6d9198',
  ruralOrUrbanPrimary: 'RURAL',
  cityUrbanOptionPrimary: '',
  addressLine3UrbanOptionPrimary: '',
  addressLine2UrbanOptionPrimary: '',
  numberUrbanOptionPrimary: '',
  postcodePrimary: '',
  addressLine5Primary: 'Mother village',
  internationalStatePrimary: '',
  internationalDistrictPrimary: '',
  internationalCityPrimary: '',
  internationalAddressLine1Primary: '',
  internationalAddressLine2Primary: '',
  internationalAddressLine3Primary: '',
  internationalPostcodePrimary: '',
  secondaryAddress: '',
  countrySecondary: 'BGD',
  stateSecondary: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
  districtSecondary: '852b103f-2fe0-4871-a323-51e51c6d9198',
  ruralOrUrbanSecondary: 'URBAN',
  cityUrbanOptionSecondary: '',
  addressLine3UrbanOptionSecondary: '',
  addressLine2UrbanOptionSecondary: '',
  numberUrbanOptionSecondary: '',
  postcodeSecondary: '',
  addressLine5Secondary: '',
  internationalStateSecondary: '',
  internationalDistrictSecondary: '',
  internationalCitySecondary: '',
  internationalAddressLine1Secondary: '',
  internationalAddressLine2Secondary: '',
  internationalAddressLine3Secondary: '',
  internationalPostcodeSecondary: ''
}

const registrationDetailsForBirth = {
  commentsOrNotes: 'comments',
  registrationCertificateLanguage: ['en'],
  informantType: {
    value: 'MOTHER',
    nestedFields: { otherInformantType: '' }
  },
  contactPoint: {
    value: 'MOTHER',
    nestedFields: { registrationPhone: '01733333333' }
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
  nationality: 'FAR',
  firstNamesEng: 'Harry',
  familyNameEng: 'Kane',
  birthDate: '1990-02-02',
  exactDateOfBirthUnknown: false,
  gender: 'male',
  seperator: '',
  maritalStatus: 'MARRIED',
  primaryAddress: '',
  countryPrimary: 'BGD',
  statePrimary: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
  districtPrimary: '852b103f-2fe0-4871-a323-51e51c6d9198',
  ruralOrUrbanPrimary: 'URBAN',
  cityUrbanOptionPrimary: "Deceased's town",
  addressLine3UrbanOptionPrimary: 'Deceased area',
  addressLine2UrbanOptionPrimary: 'Deceased street',
  numberUrbanOptionPrimary: 'Flat 10',
  postcodePrimary: 'SW1',
  addressLine5Primary: '',
  internationalStatePrimary: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
  internationalDistrictPrimary: '852b103f-2fe0-4871-a323-51e51c6d9198',
  internationalCityPrimary: "Deceased's town",
  internationalAddressLine1Primary: '',
  internationalAddressLine2Primary: '',
  internationalAddressLine3Primary: '',
  internationalPostcodePrimary: 'SW1',
  secondaryAddress: '',
  countrySecondary: 'BGD',
  stateSecondary: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
  districtSecondary: '852b103f-2fe0-4871-a323-51e51c6d9198',
  ruralOrUrbanSecondary: 'URBAN',
  cityUrbanOptionSecondary: '',
  addressLine3UrbanOptionSecondary: '',
  addressLine2UrbanOptionSecondary: '',
  numberUrbanOptionSecondary: '',
  postcodeSecondary: '',
  addressLine5Secondary: '',
  internationalStateSecondary: '',
  internationalDistrictSecondary: '',
  internationalCitySecondary: '',
  internationalAddressLine1Secondary: '',
  internationalAddressLine2Secondary: '',
  internationalAddressLine3Secondary: '',
  internationalPostcodeSecondary: '',
  _fhirID: '50fbd713-c86d-49fe-bc6a-52094b40d8dd'
}

const informantDetailsForDeath = {
  nationality: 'FAR',
  informantID: '951951951',
  informantBirthDate: '1980-02-02',
  exactDateOfBirthUnknown: false,
  firstNamesEng: 'Lesley',
  familyNameEng: 'Styles',
  primaryAddressSameAsOtherPrimary: true,
  primaryAddress: '',
  countryPrimary: 'FAR',
  statePrimary: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
  districtPrimary: '852b103f-2fe0-4871-a323-51e51c6d9198',
  ruralOrUrbanPrimary: 'URBAN',
  cityUrbanOptionPrimary: '',
  addressLine3UrbanOptionPrimary: '',
  addressLine2UrbanOptionPrimary: '',
  numberUrbanOptionPrimary: '',
  postcodePrimary: '',
  addressLine5Primary: '',
  internationalStatePrimary: '',
  internationalDistrictPrimary: '',
  internationalCityPrimary: '',
  internationalAddressLine1Primary: '',
  internationalAddressLine2Primary: '',
  internationalAddressLine3Primary: '',
  internationalPostcodePrimary: '',
  secondaryAddress: '',
  countrySecondary: 'FAR',
  stateSecondary: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
  districtSecondary: '852b103f-2fe0-4871-a323-51e51c6d9198',
  ruralOrUrbanSecondary: 'URBAN',
  cityUrbanOptionSecondary: '',
  addressLine3UrbanOptionSecondary: '',
  addressLine2UrbanOptionSecondary: '',
  numberUrbanOptionSecondary: '',
  postcodeSecondary: '',
  addressLine5Secondary: '',
  internationalStateSecondary: '',
  internationalDistrictSecondary: '',
  internationalCitySecondary: '',
  internationalAddressLine1Secondary: '',
  internationalAddressLine2Secondary: '',
  internationalAddressLine3Secondary: '',
  internationalPostcodeSecondary: '',
  _fhirIDMap: {
    relatedPerson: 'c9e3e5cb-d483-4db4-afaa-625161826f00',
    individual: 'cabeeea7-0f7d-41c3-84ed-8f88e4d617e1'
  }
}

const deathEventDetails = {
  deathDate: '2017-01-01',
  exactDateOfBirthUnknown: false,
  manner: 'NATURAL_CAUSES',
  causeOfDeathEstablished: 'true',
  causeOfDeathMethod: 'VERBAL_AUTOPSY',
  deathDescription: 'Verbal autopsy description',
  placeOfDeath: 'DECEASED_USUAL_RESIDENCE',
  deathLocation: '',
  country: 'FAR',
  state: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
  district: '852b103f-2fe0-4871-a323-51e51c6d9198',
  ruralOrUrban: 'URBAN',
  cityUrbanOption: '',
  addressLine3UrbanOption: '',
  addressLine2UrbanOption: '',
  numberUrbanOption: '',
  postalCode: '',
  addressLine5: '',
  internationalState: '',
  internationalDistrict: '',
  internationalCity: '',
  internationalAddressLine1: '',
  internationalAddressLine2: '',
  internationalAddressLine3: '',
  internationalPostcode: ''
}

const marriageEventDetails = {
  marriageDate: '2020-12-12',
  typeOfMarriage: 'MONOGAMY',
  country: 'FAR',
  state: '5dd96001-7c94-4eeb-b96e-8a987957f7a2',
  district: 'ab93d5a5-c078-4dfa-b4ca-d54d1e57bca0',
  ruralOrUrban: 'URBAN',
  addressLine3UrbanOption: '',
  addressLine2UrbanOption: '',
  numberUrbanOption: '',
  addressLine5: '',
  internationalState: 'ab93d5a5-c078-4dfa-b4ca-d54d1e57bca0',
  internationalDistrict: 'ab93d5a5-c078-4dfa-b4ca-d54d1e57bca0',
  internationalAddressLine1: '',
  internationalAddressLine2: '',
  internationalAddressLine3: '',
  _fhirID: 'fccf6eac-4dae-43d3-af33-2c977d1daf08'
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
    nestedFields: { registrationPhone: '01733333333' }
  }
}

const groomDetails = {
  nationality: 'FAR',
  iD: '987985987',
  groomBirthDate: '1998-12-12',
  exactDateOfBirthUnknown: false,
  firstNamesEng: 'Sadman',
  familyNameEng: 'Anik',
  marriedLastNameEng: 'Groom Last Name',
  countryPrimary: 'FAR',
  statePrimary: '5dd96001-7c94-4eeb-b96e-8a987957f7a2',
  districtPrimary: 'ab93d5a5-c078-4dfa-b4ca-d54d1e57bca0',
  ruralOrUrbanPrimary: 'URBAN',
  cityUrbanOptionPrimary: '',
  addressLine3UrbanOptionPrimary: '',
  addressLine2UrbanOptionPrimary: '',
  numberUrbanOptionPrimary: '',
  postcodePrimary: '',
  addressLine5Primary: '',
  internationalStatePrimary: '5dd96001-7c94-4eeb-b96e-8a987957f7a2',
  internationalDistrictPrimary: 'ab93d5a5-c078-4dfa-b4ca-d54d1e57bca0',
  internationalCityPrimary: '',
  internationalAddressLine1Primary: '',
  internationalAddressLine2Primary: '',
  internationalAddressLine3Primary: '',
  internationalPostcodePrimary: '',
  _fhirID: '89113c35-1310-4d8f-9352-0269a04a1c4a'
}

const brideDetails = {
  nationality: 'FAR',
  iD: '987987987',
  brideBirthDate: '1998-12-12',
  exactDateOfBirthUnknown: false,
  firstNamesEng: 'Kaitlin',
  familyNameEng: 'Samo',
  marriedLastNameEng: 'Bride Last Name',
  countryPrimary: 'FAR',
  statePrimary: '5dd96001-7c94-4eeb-b96e-8a987957f7a2',
  districtPrimary: 'ab93d5a5-c078-4dfa-b4ca-d54d1e57bca0',
  ruralOrUrbanPrimary: 'URBAN',
  cityUrbanOptionPrimary: '',
  addressLine3UrbanOptionPrimary: '',
  addressLine2UrbanOptionPrimary: '',
  numberUrbanOptionPrimary: '',
  postcodePrimary: '',
  addressLine5Primary: '',
  internationalStatePrimary: '5dd96001-7c94-4eeb-b96e-8a987957f7a2',
  internationalDistrictPrimary: 'ab93d5a5-c078-4dfa-b4ca-d54d1e57bca0',
  internationalCityPrimary: '',
  internationalAddressLine1Primary: '',
  internationalAddressLine2Primary: '',
  internationalAddressLine3Primary: '',
  internationalPostcodePrimary: '',
  _fhirID: '09a68a88-921f-4eaf-8424-7d9d43e5804c'
}

const registrationDetailsForMarriage = {
  informantType: {
    value: 'GROOM',
    nestedFields: {
      otherInformantType: ''
    }
  },
  contactPoint: {
    value: 'GROOM',
    nestedFields: {
      registrationPhone: '0751515152'
    }
  },
  _fhirID: 'a833a452-3472-408f-87e3-ad7c6e2cdcd9',
  trackingId: 'M2LA47X',
  registrationNumber: '2023M2LA47X',
  type: 'marriage',
  groomSignature: 'data:image/png;base64,iVBORw0KGkSuQmCC',
  brideSignature: 'data:image/png;base64,iVBORw0KGkSuQmCC',
  witnessOneSignature: 'data:image/png;base64,iVBORw0KGkSuQmCC',
  witnessTwoSignature: 'data:image/png;base64,iVBORw0KGkSuQmCC',
  commentsOrNotes: '',
  regStatus: {
    type: 'REGISTERED',
    statusDate: '2023-03-09T09:22:12.673Z',
    officeName: 'Ibombo District Office',
    officeAlias: 'Ibombo District Office',
    officeAddressLevel3: '',
    officeAddressLevel4: ''
  }
}

const witnessOneDetails = {
  firstNamesEng: 'Sadman',
  familyNameEng: 'Anik',
  relationship: 'headOfGroomFamily',
  _fhirID: '36972633-1c80-4fb4-a636-17f7dc9c2e14'
}

const witnessTwoDetails = {
  firstNamesEng: 'Edgar',
  familyNameEng: 'Samo',
  relationship: 'headOfGroomFamily',
  _fhirID: '1745b3d2-74fd-4b22-ba62-1c851d632f55'
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
  deathEvent: deathEventDetails,
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

export const marriageReviewDraftData = {
  _fhirIDMap: {
    composition: '76f6a5b6-03fd-4f68-b419-42cb88348a63'
  },
  bride: { ...brideDetails },
  groom: { ...groomDetails },
  witnessOne: { ...witnessOneDetails },
  witnessTwo: { ...witnessTwoDetails },
  marriageEvent: { ...marriageEventDetails },
  registration: {
    ...registrationDetailsForMarriage
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
