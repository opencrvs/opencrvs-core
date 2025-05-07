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
import { UUID } from '@opencrvs/commons'
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

type EventPayload = {
  eventName: string
  jurisdictionId?: string
}

export interface IAdvancedSearchParam {
  event?: EventPayload[]
  name?: string
  registrationStatuses?: string[]
  dateOfEvent?: string
  dateOfEventStart?: string
  dateOfEventEnd?: string
  timePeriodFrom?: string
  contactNumber?: string
  contactEmail?: string
  nationalId?: string
  registrationNumber?: string
  trackingId?: string
  recordId?: string
  dateOfRegistration?: string
  dateOfRegistrationStart?: string
  dateOfRegistrationEnd?: string
  declarationLocationId?: UUID
  declarationJurisdictionId?: UUID
  eventLocationId?: UUID
  eventJurisdictionId?: UUID
  eventCountry?: string
  /** @deprecated The specific event location level's will get deleted in the future in favor of directly using `eventJurisdictionId` */
  eventLocationLevel1?: UUID
  /** @deprecated The specific event location level's will get deleted in the future in favor of directly using `eventJurisdictionId` */
  eventLocationLevel2?: UUID
  /** @deprecated The specific event location level's will get deleted in the future in favor of directly using `eventJurisdictionId` */
  eventLocationLevel3?: UUID
  /** @deprecated The specific event location level's will get deleted in the future in favor of directly using `eventJurisdictionId` */
  eventLocationLevel4?: UUID
  /** @deprecated The specific event location level's will get deleted in the future in favor of directly using `eventJurisdictionId` */
  eventLocationLevel5?: UUID
  /** @deprecated The specific event location level's will get deleted in the future in favor of directly using `eventJurisdictionId` */
  eventLocationLevel6?: UUID
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
  spouseIdentifier?: string
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
  /** Sort direction */
  sort?: SortOrder
  /** Column to be sorted by */
  sortColumn?: string
  /** Overrides sort & sortColumn if sorting by multiple attributes is requested */
  sortBy?: Array<Record<string, SortOrder>>
  size?: number
  from?: number
  createdBy?: string
}
