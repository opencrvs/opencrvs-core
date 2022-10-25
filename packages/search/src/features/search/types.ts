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
export interface ISearchQuery {
  query?: string
  trackingId?: string
  nationalId?: string
  contactNumber?: string
  registrationNumber?: string
  name?: string
  ageCheck?: string
  nameCombinations?: INameCombination[]
  eventLocationId?: string
  gender?: string
  event?: string
  type?: string[]
  status?: string[]
  declarationLocationId?: string | string[]
  declarationLocationHirarchyId?: string
  createdBy?: string
  from?: number
  size?: number
  sort?: SortOrder
  sortColumn?: string
}

export interface INameCombination {
  name: string
  fields: string
}

export interface IFilter {
  event?: string
  status?: string[]
  type?: string[]
}

export interface IAdvancedSearchParam {
  event: string
  eventLocationId: string
  childFirstNames: string
  childLastName: string
  childDoB: string
  deceasedFirstNames: string
  deceasedFamilyName: string
  deathDate: string
  dateOfEventStart: string
  dateOfEventEnd: string
  motherFirstNames: string
  motherFamilyName: string
  motherDoB: string
  motherIdentifier: string
  fatherFirstNames: string
  fatherFamilyName: string
  fatherDoB: string
  fatherIdentifier: string
  informantFirstNames: string
  informantFamilyName: string
  contactNumber: string
  registrationNumber: string
  trackingId: string
  dateOfRegistration: string
  dateOfRegistrationStart: string
  dateOfRegistrationEnd: string
}
