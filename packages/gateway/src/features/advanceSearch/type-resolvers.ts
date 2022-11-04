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

import { GQLEvent } from '@gateway/graphql/schema'

export interface ISearch extends IAdvancedSearchParameters {
  name: string
}
export interface IAdvancedSearchParameters {
  event?: GQLEvent
  registrationStatuses?: string[]
  dateOfEvent?: string
  dateOfEventStart?: string
  dateOfEventEnd?: string
  registrationNumber?: string
  trackingId?: string
  dateOfRegistration?: string
  dateOfRegistrationStart?: string
  dateOfRegistrationEnd?: string
  declarationLocationId?: string
  declarationJurisdictionId?: string
  eventLocationId?: string
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
  deceasedFirstNames?: string
  deceasedFamilyName?: string
  deceasedGender?: string
  deceasedDoB?: string
  deceasedDoBStart?: string
  deceasedDoBEnd?: string
  motherFirstNames?: string
  motherFamilyName?: string
  motherDoB?: string
  motherDoBStart?: string
  motherDoBEnd?: string
  fatherFirstNames?: string
  fatherFamilyName?: string
  fatherDoB?: string
  fatherDoBStart?: string
  fatherDoBEnd?: string
  informantFirstNames?: string
  informantFamilyName?: string
  informantDoB?: string
  informantDoBStart?: string
  informantDoBEnd?: string
}

export interface IBookmarkAdvancedSearchPayload {
  userId: string
  search: ISearch
}
