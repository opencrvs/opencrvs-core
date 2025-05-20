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

/**
 * Conditionals allow controlling for example the visibility of form fields based on an JavaScript expression.
 */
export interface Conditional {
  description?: string
  action: string
  expression: string
}

export interface BuiltInConditionals {
  informantType: Conditional
  iDType: Conditional
  isOfficePreSelected: Conditional
  fathersDetailsExist: Conditional
  primaryAddressSameAsOtherPrimary: Conditional
  countryPrimary: Conditional
  statePrimary: Conditional
  districtPrimary: Conditional
  addressLine4Primary: Conditional
  addressLine3Primary: Conditional
  country: Conditional
  state: Conditional
  district: Conditional
  addressLine4: Conditional
  addressLine3: Conditional
  uploadDocForWhom: Conditional
  motherCollectsCertificate: Conditional
  fatherCollectsCertificate: Conditional
  informantCollectsCertificate: Conditional
  otherPersonCollectsCertificate: Conditional
  birthCertificateCollectorNotVerified: Conditional
  deathCertificateCollectorNotVerified: Conditional
  placeOfBirthHospital: Conditional
  placeOfDeathTypeHeathInstitue: Conditional
  otherBirthEventLocation: Conditional
  isNotCityLocation: Conditional
  isCityLocation: Conditional
  isDefaultCountry: Conditional
  isNotCityLocationPrimary: Conditional
  isDefaultCountryPrimary: Conditional
  isCityLocationPrimary: Conditional
  informantPrimaryAddressSameAsCurrent: Conditional
  iDAvailable: Conditional
  deathPlaceOther: Conditional
  deathPlaceAtPrivateHome: Conditional
  deathPlaceAtOtherLocation: Conditional
  causeOfDeathEstablished: Conditional
  isMarried: Conditional
  identifierIDSelected: Conditional
  fatherContactDetailsRequired: Conditional
  withInTargetDays: Conditional
  between46daysTo5yrs: Conditional
  after5yrs: Conditional
  deceasedNationIdSelected: Conditional
  isRegistrarRoleSelected: Conditional
  certCollectorOther: Conditional
  userAuditReasonSpecified: Conditional
  userAuditReasonOther: Conditional
  isAuditActionDeactivate: Conditional
  isAuditActionReactivate: Conditional
}
