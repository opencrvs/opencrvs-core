/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

const childDetails = {
  firstNamesEng: 'EUan',
  familyNameEng: 'Millar',
  gender: 'male',
  childBirthDate: '2023-02-02',
  placeOfBirth: 'PRIVATE_HOME',
  birthLocation: 'ebe37b9d-6125-4f42-9e44-c584f579be12',
  countryPlaceofbirth: 'FAR',
  statePlaceofbirth: '8f172823-797c-4926-930f-f1896b49ac57',
  districtPlaceofbirth: 'dc1eae5f-f89e-483c-9d19-977fa0febc23',
  ruralOrUrbanPlaceofbirth: 'URBAN',
  addressLine1UrbanOptionPlaceofbirth: 'Birth res area',
  addressLine2UrbanOptionPlaceofbirth: 'Birth street',
  addressLine3UrbanOptionPlaceofbirth: 'Birth number',
  addressLine1RuralOptionPlaceofbirth: '',
  internationalCityPlaceofbirth: 'Birth town',
  internationalAddressLine1Placeofbirth: '',
  internationalAddressLine2Placeofbirth: '',
  internationalAddressLine3Placeofbirth: ''
}

const fatherDetailsForBirth = {
  detailsExist: true,
  fatherBirthDate: '1984-09-19',
  firstNamesEng: 'dydtyjdtyj',
  exactDateOfBirthUnknown: false,
  familyNameEng: 'dydtyhdtj',
  nationality: 'FAR',
  primaryAddressSameAsOtherPrimary: false,
  countryPrimaryFather: 'SLV',
  statePrimaryFather: 'Father intl state',
  districtPrimaryFather: 'Father intl district',
  ruralOrUrbanPrimaryFather: '',
  cityPrimaryFather: 'Father intl town',
  addressLine1UrbanOptionPrimaryFather: '',
  addressLine2UrbanOptionPrimaryFather: '',
  postalCodePrimaryFather: 'Father intl post code',
  addressLine1RuralOptionPrimaryFather: '',
  internationalStatePrimaryFather: 'Father intl state',
  internationalDistrictPrimaryFather: 'Father intl district',
  internationalCityPrimaryFather: 'Father intl town',
  internationalAddressLine1PrimaryFather: 'Father intl addline 1',
  internationalAddressLine2PrimaryFather: 'Father intl addline 2',
  internationalAddressLine3PrimaryFather: 'Father intl addline 3',
  internationalPostalCodePrimaryFather: 'Father intl post code'
}

const motherDetailsForBirth = {
  detailsExist: true,
  motherBirthDate: '1990-05-05',
  exactDateOfBirthUnknown: false,
  firstNamesEng: 'rdhdthynj',
  familyNameEng: 'dtdtyj',
  nationality: 'FAR',
  countryPrimaryMother: 'FAR',
  statePrimaryMother: '8f172823-797c-4926-930f-f1896b49ac57',
  districtPrimaryMother: 'dc1eae5f-f89e-483c-9d19-977fa0febc23',
  ruralOrUrbanPrimaryMother: 'URBAN',
  cityPrimaryMother: 'Mother town',
  addressLine1UrbanOptionPrimaryMother: 'Mother res area',
  addressLine2UrbanOptionPrimaryMother: 'Mother street',
  postalCodePrimaryMother: 'Mother postcode',
  addressLine1RuralOptionPrimaryMother: '',
  internationalStatePrimaryMother: '8f172823-797c-4926-930f-f1896b49ac57',
  internationalDistrictPrimaryMother: 'dc1eae5f-f89e-483c-9d19-977fa0febc23',
  internationalCityPrimaryMother: 'Mother town',
  internationalAddressLine1PrimaryMother: '',
  internationalAddressLine2PrimaryMother: '',
  internationalAddressLine3PrimaryMother: '',
  internationalPostalCodePrimaryMother: 'Mother postcode'
}

const informantDetailsForBirth = {
  informantType: 'MOTHER',
  otherInformantType: '',
  registrationPhone: '01733333333',
  registrationEmail: 'sdfsbg@hgh.com',
  firstNamesEng: 'rdhdthynj',
  familyNameEng: 'dtdtyj',
  informantBirthDate: '1990-05-05',
  exactDateOfBirthUnknown: false,
  nationality: 'FAR',
  countryPrimaryInformant: 'FAR',
  statePrimaryInformant: '8f172823-797c-4926-930f-f1896b49ac57',
  districtPrimaryInformant: 'dc1eae5f-f89e-483c-9d19-977fa0febc23',
  ruralOrUrbanPrimaryInformant: 'URBAN',
  cityPrimaryInformant: 'Mother town',
  addressLine1UrbanOptionPrimaryInformant: 'Mother res area',
  addressLine2UrbanOptionPrimaryInformant: 'Mother street',
  postalCodePrimaryInformant: 'Mother postcode',
  addressLine1RuralOptionPrimaryInformant: '',
  internationalStatePrimaryInformant: '8f172823-797c-4926-930f-f1896b49ac57',
  internationalDistrictPrimaryInformant: 'dc1eae5f-f89e-483c-9d19-977fa0febc23',
  internationalCityPrimaryInformant: 'Mother town',
  internationalAddressLine1PrimaryInformant: '',
  internationalAddressLine2PrimaryInformant: '',
  internationalAddressLine3PrimaryInformant: '',
  internationalPostalCodePrimaryInformant: 'Mother postcode'
}

const registrationDetailsForBirth = {
  trackingId: 'BGOJ3OQ',
  type: 'birth',
  commentsOrNotes: ''
}

export const birthDraftData = {
  child: childDetails,
  father: fatherDetailsForBirth,
  mother: motherDetailsForBirth,
  informant: informantDetailsForBirth,
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
  informant: {
    ...informantDetailsForBirth
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
  firstNamesEng: 'Jeff',
  familyNameEng: 'Caoes',
  gender: 'female',
  deceasedBirthDate: '1990-02-02',
  nationality: 'FAR',
  exactDateOfBirthUnknown: false,
  countryPrimaryDeceased: 'FAR',
  statePrimaryDeceased: '8f172823-797c-4926-930f-f1896b49ac57',
  districtPrimaryDeceased: 'dc1eae5f-f89e-483c-9d19-977fa0febc23',
  ruralOrUrbanPrimaryDeceased: 'URBAN',
  cityPrimaryDeceased: "Deceased's town",
  addressLine1UrbanOptionPrimaryDeceased: "Deceased's res area",
  addressLine2UrbanOptionPrimaryDeceased: "Deceased's street",
  postalCodePrimaryDeceased: "Deceased's postcode",
  addressLine1RuralOptionPrimaryDeceased: '',
  internationalStatePrimaryDeceased: '8f172823-797c-4926-930f-f1896b49ac57',
  internationalDistrictPrimaryDeceased: 'dc1eae5f-f89e-483c-9d19-977fa0febc23',
  internationalCityPrimaryDeceased: "Deceased's town",
  internationalAddressLine1PrimaryDeceased: '',
  internationalAddressLine2PrimaryDeceased: '',
  internationalAddressLine3PrimaryDeceased: '',
  internationalPostalCodePrimaryDeceased: "Deceased's postcode",
  _fhirID: '50fbd713-c86d-49fe-bc6a-52094b40d8dd'
}

const informantDetailsForDeath = {
  informantType: 'SPOUSE',
  firstNamesEng: 'segst',
  familyNameEng: 'sbsrtgsr',
  informantBirthDate: '1990-12-12',
  exactDateOfBirthUnknown: false,
  nationality: 'FAR',
  primaryAddressSameAsOtherPrimary: true,
  countryPrimaryInformant: 'FAR',
  statePrimaryInformant: '8f172823-797c-4926-930f-f1896b49ac57',
  districtPrimaryInformant: 'dc1eae5f-f89e-483c-9d19-977fa0febc23',
  ruralOrUrbanPrimaryInformant: 'URBAN',
  cityPrimaryInformant: "Deceased's town",
  addressLine1UrbanOptionPrimaryInformant: "Deceased's res area",
  addressLine2UrbanOptionPrimaryInformant: "Deceased's street",
  postalCodePrimaryInformant: "Deceased's postcode",
  addressLine1RuralOptionPrimaryInformant: '',
  internationalStatePrimaryInformant: '8f172823-797c-4926-930f-f1896b49ac57',
  internationalDistrictPrimaryInformant: 'dc1eae5f-f89e-483c-9d19-977fa0febc23',
  internationalCityPrimaryInformant: "Deceased's town",
  internationalAddressLine1PrimaryInformant: '',
  internationalAddressLine2PrimaryInformant: '',
  internationalAddressLine3PrimaryInformant: '',
  internationalPostalCodePrimaryInformant: "Deceased's postcode",
  registrationPhone: '01733333333',
  registrationEmail: 'sesrthsthsr@sdfsgt.com',
  _fhirIDMap: {
    relatedPerson: 'c9e3e5cb-d483-4db4-afaa-625161826f00',
    individual: 'cabeeea7-0f7d-41c3-84ed-8f88e4d617e1'
  }
}

const deathEventDetails = {
  deathDate: '2023-07-02',
  causeOfDeathEstablished: 'false',
  placeOfDeath: 'OTHER',
  deathLocation: '4558d280-7b34-45eb-a8b2-c7e98d7328b0',
  countryPlaceofdeath: 'FAR',
  statePlaceofdeath: '8f172823-797c-4926-930f-f1896b49ac57',
  districtPlaceofdeath: 'dc1eae5f-f89e-483c-9d19-977fa0febc23',
  ruralOrUrbanPlaceofdeath: 'URBAN',
  addressLine1UrbanOptionPlaceofdeath: 'Death res are',
  addressLine2UrbanOptionPlaceofdeath: 'Death street',
  addressLine3UrbanOptionPlaceofdeath: 'Death number',
  addressLine1RuralOptionPlaceofdeath: '',
  internationalCityPlaceofdeath: 'Death town',
  internationalAddressLine1Placeofdeath: '',
  internationalAddressLine2Placeofdeath: '',
  internationalAddressLine3Placeofdeath: ''
}

const marriageEventDetails = {
  marriageDate: '2023-07-23',
  countryPlaceofmarriage: 'FAR',
  statePlaceofmarriage: '8f172823-797c-4926-930f-f1896b49ac57',
  districtPlaceofmarriage: 'dc1eae5f-f89e-483c-9d19-977fa0febc23',
  ruralOrUrbanPlaceofmarriage: 'URBAN',
  addressLine1UrbanOptionPlaceofmarriage: 'Marriage place res area',
  addressLine2UrbanOptionPlaceofmarriage: 'Marriage place street',
  addressLine3UrbanOptionPlaceofmarriage: 'Marriage place number',
  addressLine1RuralOptionPlaceofmarriage: '',
  internationalCityPlaceofmarriage: 'Marriage place town',
  internationalAddressLine1Placeofmarriage: '',
  internationalAddressLine2Placeofmarriage: '',
  internationalAddressLine3Placeofmarriage: '',
  _fhirID: 'fccf6eac-4dae-43d3-af33-2c977d1daf08'
}

const registrationDetailsForDeath = {
  _fhirID: 'fccf6eac-4dae-43d3-af33-2c977d1daf08',
  trackingId: 'DJDTKUQ',
  type: 'death',
  commentsOrNotes: ''
}

const groomDetails = {
  firstNamesEng: 'sebsrth',
  familyNameEng: 'rdryhdryt',
  groomBirthDate: '1980-12-23',
  nationality: 'FAR',
  countryPrimaryGroom: 'FAR',
  exactDateOfBirthUnknown: false,
  statePrimaryGroom: '8f172823-797c-4926-930f-f1896b49ac57',
  districtPrimaryGroom: 'dc1eae5f-f89e-483c-9d19-977fa0febc23',
  ruralOrUrbanPrimaryGroom: 'URBAN',
  cityPrimaryGroom: 'Groom town',
  addressLine1UrbanOptionPrimaryGroom: 'Groom res area',
  addressLine2UrbanOptionPrimaryGroom: 'Groom street',
  postalCodePrimaryGroom: 'Groom popstco',
  addressLine1RuralOptionPrimaryGroom: '',
  internationalStatePrimaryGroom: '8f172823-797c-4926-930f-f1896b49ac57',
  internationalDistrictPrimaryGroom: 'dc1eae5f-f89e-483c-9d19-977fa0febc23',
  internationalCityPrimaryGroom: 'Groom town',
  internationalAddressLine1PrimaryGroom: '',
  internationalAddressLine2PrimaryGroom: '',
  internationalAddressLine3PrimaryGroom: '',
  internationalPostalCodePrimaryGroom: 'Groom popstco',
  _fhirID: '89113c35-1310-4d8f-9352-0269a04a1c4a'
}

const brideDetails = {
  firstNamesEng: 'srhdyrj',
  familyNameEng: 'ftjfyuj',
  brideBirthDate: '1990-03-03',
  nationality: 'FAR',
  countryPrimaryBride: 'FAR',
  exactDateOfBirthUnknown: false,
  statePrimaryBride: '8f172823-797c-4926-930f-f1896b49ac57',
  districtPrimaryBride: 'dc1eae5f-f89e-483c-9d19-977fa0febc23',
  ruralOrUrbanPrimaryBride: 'RURAL',
  cityPrimaryBride: '',
  addressLine1UrbanOptionPrimaryBride: '',
  addressLine2UrbanOptionPrimaryBride: '',
  postalCodePrimaryBride: '',
  addressLine1RuralOptionPrimaryBride: 'Bride village',
  internationalStatePrimaryBride: '8f172823-797c-4926-930f-f1896b49ac57',
  internationalDistrictPrimaryBride: 'dc1eae5f-f89e-483c-9d19-977fa0febc23',
  internationalCityPrimaryBride: '',
  internationalAddressLine1PrimaryBride: '',
  internationalAddressLine2PrimaryBride: '',
  internationalAddressLine3PrimaryBride: '',
  internationalPostalCodePrimaryBride: '',
  _fhirID: '09a68a88-921f-4eaf-8424-7d9d43e5804c'
}

const informantDetailsForMarriage = {
  informantType: 'GROOM',
  otherInformantType: '',
  exactDateOfBirthUnknown: '',
  registrationPhone: '01733333333',
  registrationEmail: 'stheyhyj@segstg.com',
  _fhirID: '429445a4-f87c-467f-9d3c-f17f595a1143'
}

const registrationDetailsForMarriage = {
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
  informant: {
    ...informantDetailsForMarriage
  },
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
