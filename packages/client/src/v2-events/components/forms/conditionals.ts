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

import { referenceApi } from '@client/utils/referenceApi'

/**
 * Conditionals allow controlling for example the visibility of form fields based on an JavaScript expression.
 */
export interface Conditional {
  description?: string
  action: string
  expression: string
}

export let conditionals: Record<string, Conditional>

export async function initConditionals() {
  const countryConfigConditionals = await referenceApi.importConditionals()
  conditionals = {
    ...builtInConditionals,
    ...countryConfigConditionals
  }
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

// TODO: Edit to `{ ... } satisfies BuiltInConditionals` when updated to TypeScript 4.9
export const builtInConditionals: BuiltInConditionals = {
  informantType: {
    action: 'hide',
    expression:
      '(!draftData || !draftData.registration || draftData.registration.informantType !== "OTHER" || draftData.registration.informantType === "BOTH_PARENTS" )'
  },
  isRegistrarRoleSelected: {
    action: 'hide',
    expression: 'values.systemRole!=="LOCAL_REGISTRAR"'
  },
  isOfficePreSelected: {
    action: 'hide',
    expression: 'values.skippedOfficeSelction && values.registrationOffice'
  },
  iDType: {
    action: 'hide',
    expression: "!values.iDType || (values.iDType !== 'OTHER')"
  },
  fathersDetailsExist: {
    action: 'hide',
    expression: '!values.detailsExist'
  },
  primaryAddressSameAsOtherPrimary: {
    action: 'hide',
    expression: 'values.primaryAddressSameAsOtherPrimary'
  },
  countryPrimary: {
    action: 'hide',
    expression: '!values.countryPrimary'
  },
  isDefaultCountryPrimary: {
    action: 'hide',
    expression: 'isDefaultCountry(values.countryPrimary)'
  },
  statePrimary: {
    action: 'hide',
    expression: '!values.statePrimary'
  },
  districtPrimary: {
    action: 'hide',
    expression: '!values.districtPrimary'
  },
  addressLine4Primary: {
    action: 'hide',
    expression: '!values.addressLine4Primary'
  },
  addressLine3Primary: {
    action: 'hide',
    expression: '!values.addressLine3Primary'
  },
  country: {
    action: 'hide',
    expression: '!values.country'
  },
  isDefaultCountry: {
    action: 'hide',
    expression: 'isDefaultCountry(values.country)'
  },
  state: {
    action: 'hide',
    expression: '!values.state'
  },
  district: {
    action: 'hide',
    expression: '!values.district'
  },
  addressLine4: {
    action: 'hide',
    expression: '!values.addressLine4'
  },
  addressLine3: {
    action: 'hide',
    expression: '!values.addressLine3'
  },
  uploadDocForWhom: {
    action: 'hide',
    expression: '!values.uploadDocForWhom'
  },
  motherCollectsCertificate: {
    action: 'hide',
    expression: 'values.personCollectingCertificate!="MOTHER"'
  },
  fatherCollectsCertificate: {
    action: 'hide',
    expression: 'values.personCollectingCertificate!="FATHER"'
  },
  informantCollectsCertificate: {
    action: 'hide',
    expression: 'values.personCollectingCertificate!="INFORMANT"'
  },
  otherPersonCollectsCertificate: {
    action: 'hide',
    expression: 'values.personCollectingCertificate!="OTHER"'
  },
  birthCertificateCollectorNotVerified: {
    action: 'hide',
    expression:
      '!(values.personCollectingCertificate=="MOTHER" && values.motherDetails===false) && !(values.personCollectingCertificate=="FATHER" && values.fatherDetails===false) && !(values.personCollectingCertificate =="OTHER" && values.otherPersonSignedAffidavit===false)'
  },
  deathCertificateCollectorNotVerified: {
    action: 'hide',
    expression:
      '!(values.personCollectingCertificate=="INFORMANT" && values.informantDetails===false) && !(values.personCollectingCertificate =="OTHER" && values.otherPersonSignedAffidavit===false)'
  },
  placeOfBirthHospital: {
    action: 'hide',
    expression:
      '(values.placeOfBirth!="HOSPITAL" && values.placeOfBirth!="OTHER_HEALTH_INSTITUTION")'
  },
  placeOfDeathTypeHeathInstitue: {
    action: 'hide',
    expression: 'values.placeOfDeath!="HEALTH_FACILITY"'
  },
  otherBirthEventLocation: {
    action: 'hide',
    expression:
      '(values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME")'
  },
  isNotCityLocation: {
    action: 'hide',
    expression:
      '(offlineCountryConfig && offlineCountryConfig.locations && isCityLocation(offlineCountryConfig.locations,values.addressLine4))'
  },
  isCityLocation: {
    action: 'hide',
    expression:
      '!(offlineCountryConfig && offlineCountryConfig.locations && isCityLocation(offlineCountryConfig.locations,values.addressLine4))'
  },
  isNotCityLocationPrimary: {
    action: 'hide',
    expression:
      '(offlineCountryConfig && offlineCountryConfig.locations && isCityLocation(offlineCountryConfig.locations,values.addressLine4Primary))'
  },
  isCityLocationPrimary: {
    action: 'hide',
    expression:
      '!(offlineCountryConfig && offlineCountryConfig.locations && isCityLocation(offlineCountryConfig.locations,values.addressLine4Primary))'
  },
  iDAvailable: {
    action: 'hide',
    expression: '!values.iDType || values.iDType === "NO_ID"'
  },
  informantPrimaryAddressSameAsCurrent: {
    action: 'hide',
    expression: 'values.informantPrimaryAddressSameAsCurrent'
  },
  deathPlaceOther: {
    action: 'hide',
    expression: 'values.placeOfDeath !== "OTHER"'
  },
  deathPlaceAtPrivateHome: {
    action: 'hide',
    expression: 'values.placeOfDeath !== "PRIVATE_HOME"'
  },
  deathPlaceAtOtherLocation: {
    action: 'hide',
    expression: 'values.placeOfDeath !== "OTHER"'
  },
  causeOfDeathEstablished: {
    action: 'hide',
    expression: '!values.causeOfDeathEstablished'
  },
  isMarried: {
    action: 'hide',
    expression: '(!values.maritalStatus || values.maritalStatus !== "MARRIED")'
  },
  identifierIDSelected: {
    action: 'hide',
    expression:
      '(!values.iDType || (values.iDType !== "BIRTH_REGISTRATION_NUMBER" && values.iDType !== "NATIONAL_ID"))'
  },
  fatherContactDetailsRequired: {
    action: 'hide',
    expression:
      '(draftData && draftData.registration && draftData.registration.whoseContactDetails === "FATHER")'
  },
  withInTargetDays: {
    action: 'hide',
    expression:
      '(draftData && draftData.child && draftData.child.childBirthDate && diffDoB(draftData.child.childBirthDate) === "withinTargetdays") || !draftData.child || !draftData.child.childBirthDate'
  },
  between46daysTo5yrs: {
    action: 'hide',
    expression:
      '(draftData && draftData.child && draftData.child.childBirthDate && diffDoB(draftData.child.childBirthDate) === "between46daysTo5yrs") || !draftData.child || !draftData.child.childBirthDate'
  },
  after5yrs: {
    action: 'hide',
    expression:
      '(draftData && draftData.child && draftData.child.childBirthDate && diffDoB(draftData.child.childBirthDate) === "after5yrs")  || !draftData.child || !draftData.child.childBirthDate'
  },
  deceasedNationIdSelected: {
    action: 'hide',
    expression:
      '(values.uploadDocForDeceased && !!values.uploadDocForDeceased.find(a => ["National ID (front)", "National ID (Back)"].indexOf(a.optionValues[1]) > -1))'
  },
  certCollectorOther: {
    action: 'hide',
    expression: 'values.type !== "OTHER"'
  },
  userAuditReasonSpecified: {
    action: 'hide',
    expression: 'values.reason === "OTHER"'
  },
  userAuditReasonOther: {
    action: 'hide',
    expression: 'values.reason !== "OTHER"'
  },
  isAuditActionDeactivate: {
    action: 'hide',
    expression: 'draftData.formValues.action !== "DEACTIVATE"'
  },
  isAuditActionReactivate: {
    action: 'hide',
    expression: 'draftData.formValues.action !== "REACTIVATE"'
  }
}
