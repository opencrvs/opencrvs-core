import { APPLICATION_STATUS } from '@metrics/features/registration/fhirUtils'

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
export interface IBirthRegistrationFields extends IPoint {
  compositionId: string
  ageInDays: number | undefined
}

export interface IDeathRegistrationFields extends IPoint {
  compositionId: string
  ageInYears: number | undefined
  deathDays: number | undefined
}

export interface IPoint {
  time?: string
}

export interface IPointLocation {
  locationLevel5?: string
  locationLevel4?: string
  locationLevel3?: string
  locationLevel2?: string
}

export interface IAuthHeader {
  Authorization: string
}

export interface IBirthRegistrationTags {
  regStatus: string
  gender: string | undefined
  officeLocation?: string
  locationLevel5?: string
  locationLevel4?: string
  locationLevel3?: string
  locationLevel2?: string
}

export interface IDeathRegistrationTags {
  regStatus: string
  gender: string | undefined
  mannerOfDeath: string
  causeOfDeath: string
  officeLocation?: string
  locationLevel5?: string
  locationLevel4?: string
  locationLevel3?: string
  locationLevel2?: string
}

export interface IInProgressApplicationFields {
  compositionId: string
}

export interface IInProgressApplicationTags {
  regStatus: string
  missingFieldSectionId: string
  missingFieldGroupId: string
  missingFieldId: string
  eventType: string
  officeLocation?: string
  locationLevel5?: string
  locationLevel4?: string
  locationLevel3?: string
  locationLevel2?: string
}

export interface ILocationTags {
  officeLocation?: string
  locationLevel5?: string
  locationLevel4?: string
  locationLevel3?: string
  locationLevel2?: string
}

export interface ITimeLoggedFields {
  timeSpentEditing: number
  compositionId: string
}

export interface ITimeLoggedTags {
  currentStatus: string
  trackingId: string
  eventType: string
  officeLocation?: string
  practitionerId?: string
  locationLevel5?: string
  locationLevel4?: string
  locationLevel3?: string
  locationLevel2?: string
}

export interface IDurationFields {
  durationInSeconds: number
  compositionId: string
  currentTaskId: string
  previousTaskId: string
}
export interface IDurationTags {
  currentStatus: string
  previousStatus: string
  eventType: string
}

export interface IDurationPoints {
  measurement: string
  tags: IDurationTags
  fields: IDurationFields
  timestamp: number | undefined
}

export interface ITimeLoggedPoints {
  measurement: string
  tags: ITimeLoggedTags
  fields: ITimeLoggedFields
  timestamp: number | undefined
}

export interface IInProgressApplicationPoints {
  measurement: string
  tags: IInProgressApplicationTags
  fields: IInProgressApplicationFields
  timestamp: number | undefined
}

export interface IDeathRegistrationPoints {
  measurement: string
  tags: IDeathRegistrationTags
  fields: IDeathRegistrationFields
  timestamp: number | undefined
}

export interface IBirthRegistrationPoints {
  measurement: string
  tags: IBirthRegistrationTags
  fields: IBirthRegistrationFields
  timestamp: number | undefined
}

export interface IPaymentPoints {
  measurement: string
  tags: ILocationTags
  fields: IPaymentFields
  timestamp: number | undefined
}

export interface IPaymentFields {
  total: number
  compositionId: string
}

export interface IApplicationsStartedPoints {
  measurement: string
  tags: ILocationTags
  fields: IApplicationsStartedFields
  timestamp: number | undefined
}

export interface IApplicationsStartedFields {
  role: string
  status?: APPLICATION_STATUS | null
  compositionId: string
}

export interface IRejectedFields {
  compositionId: string
}

export interface IRejectedPoints {
  measurement: string
  tags: ILocationTags
  fields: IRejectedFields
  timestamp: number | undefined
}

export type IPoints =
  | IDurationPoints
  | ITimeLoggedPoints
  | IInProgressApplicationPoints
  | IPaymentPoints
  | IBirthRegistrationPoints
  | IDeathRegistrationPoints
  | IPaymentPoints
  | IApplicationsStartedPoints
  | IRejectedPoints
