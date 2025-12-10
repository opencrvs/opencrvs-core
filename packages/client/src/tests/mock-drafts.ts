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
