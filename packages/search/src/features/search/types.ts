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
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}
export interface IAdvancedSearchParam {
  event?: string
  name?: string
  registrationStatuses?: string[]
  dateOfEvent?: string
  dateOfEventStart?: string
  dateOfEventEnd?: string
  contactNumber?: string
  nationalId?: string
  registrationNumber?: string
  trackingId?: string
  recordId?: string
  dateOfRegistration?: string
  dateOfRegistrationStart?: string
  dateOfRegistrationEnd?: string
  declarationLocationId?: string
  declarationJurisdictionId?: string
  eventLocationId?: string
  eventCountry?: string
  eventLocationLevel1?: string
  eventLocationLevel2?: string
  eventLocationLevel3?: string
  eventLocationLevel4?: string
  eventLocationLevel5?: string
  childFirstNames?: string
  childLastName?: string
  childDoB?: string
  childDoBStart?: string
  childDoBEnd?: string
  childGender?: string
  childIdentifier?: string
  deceasedFirstNames?: string
  deceasedFamilyName?: string
  deceasedGender?: string
  deceasedDoB?: string
  deceasedDoBStart?: string
  deceasedDoBEnd?: string
  deceasedIdentifier?: string
  motherFirstNames?: string
  motherFamilyName?: string
  motherDoB?: string
  motherDoBStart?: string
  motherDoBEnd?: string
  motherIdentifier?: string
  fatherFirstNames?: string
  fatherFamilyName?: string
  fatherDoB?: string
  fatherDoBStart?: string
  fatherDoBEnd?: string
  fatherIdentifier?: string
  informantFirstNames?: string
  informantFamilyName?: string
  informantDoB?: string
  informantDoBStart?: string
  informantDoBEnd?: string
  informantIdentifier?: string
  compositionType?: string[]
  groomFirstNames?: string
  groomFamilyName?: string
  groomDoB?: string
  groomDoBStart?: string
  groomDoBEnd?: string
  groomIdentifier?: string
  brideFirstNames?: string
  brideFamilyName?: string
  brideDoB?: string
  brideDoBStart?: string
  brideDoBEnd?: string
  brideIdentifier?: string
  dateOfMarriage?: string
}

export interface ISearchCriteria {
  parameters: IAdvancedSearchParam
  sort?: string
  sortColumn?: string
  size?: number
  from?: number
  createdBy?: string
}
