import {
  DECLARATION_STATUS,
  DECLARATION_TYPE,
  USER_ACTION
} from '@metrics/features/registration/fhirUtils'

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
export interface IBirthRegistrationFields extends IPoint {
  compositionId: string
  ageInDays: number | undefined
}

export interface IDeathRegistrationFields extends IPoint {
  compositionId: string
  ageInYears: number | undefined
  deathDays: number | undefined
}

export interface IUserAuditFields extends IPoint {
  data: string | undefined
  userAgent: string
  ipAddress: string
}

export interface IMarriageRegistrationFields extends IPoint {
  compositionId: string
  daysAfterEvent: number | undefined
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

export type IAuthHeader =
  | {
      Authorization: string
      'x-correlation-id': string
    }
  | {
      Authorization: string
    }

export interface IBirthRegistrationTags {
  regStatus: string
  registrarPractitionerId: string
  practitionerRole: string
  eventLocationType: string
  gender: string | undefined
  timeLabel: string | undefined
  ageLabel: string | undefined
  dateLabel: string | undefined
  officeLocation?: string
  locationLevel5?: string
  locationLevel4?: string
  locationLevel3?: string
  locationLevel2?: string
}

export interface IMarriageRegistrationTags {
  regStatus: string
  timeLabel: string | undefined
  dateLabel: string | undefined
  registrarPractitionerId: string
  practitionerRole: string
  officeLocation?: string
  locationLevel5?: string
  locationLevel4?: string
  locationLevel3?: string
  locationLevel2?: string
  locationLevel1?: string
}

export interface IUserAuditTags {
  action: string | USER_ACTION
  practitionerId: string | undefined
}

export interface IDeathRegistrationTags {
  regStatus: string
  registrarPractitionerId: string
  practitionerRole: string
  eventLocationType: string
  gender: string | undefined
  timeLabel: string | undefined
  ageLabel: string | undefined
  dateLabel: string | undefined
  mannerOfDeath: string
  causeOfDeath: string
  officeLocation?: string
  locationLevel5?: string
  locationLevel4?: string
  locationLevel3?: string
  locationLevel2?: string
}

export interface IInProgressDeclarationFields {
  compositionId: string
}

export interface IInProgressDeclarationTags {
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
export interface ICertifiedTags {
  eventType: DECLARATION_TYPE
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
export interface ICertifiedFields {
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
export interface ICertifiedPoints {
  measurement: string
  tags: ICertifiedTags
  fields: ICertifiedFields
  timestamp: number | undefined
}

export interface ITimeLoggedPoints {
  measurement: string
  tags: ITimeLoggedTags
  fields: ITimeLoggedFields
  timestamp: number | undefined
}

export interface IInProgressDeclarationPoints {
  measurement: string
  tags: IInProgressDeclarationTags
  fields: IInProgressDeclarationFields
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

export interface IUserAuditPoints {
  measurement: string
  tags: IUserAuditTags
  fields: IUserAuditFields
  timestamp: number | undefined
}

export interface IUserAuditBody {
  practitionerId?: string
  action: USER_ACTION | string
  additionalData?: Record<string, any>
}
export interface IPaymentPoints {
  measurement: string
  tags: ILocationTags & {
    eventType: DECLARATION_TYPE
    paymentType: 'certification' | 'correction'
  }
  fields: IPaymentFields
  timestamp: number | undefined
}
export interface ICorrectionPoint {
  measurement: string
  tags: ILocationTags & {
    eventType: DECLARATION_TYPE
    // CLERICAL_ERROR, MATERIAL_ERROR, MATERIAL_OMISSION, JUDICIAL_ORDER, OTHER
    reason: string
  }
  fields: { compositionId: string }
  timestamp: number | undefined
}

export interface IPaymentFields {
  total: number
  compositionId: string
}

export interface IDeclarationsStartedPoints {
  measurement: string
  tags: ILocationTags
  fields: IDeclarationsStartedFields
  timestamp: number | undefined
}

export interface IDeclarationsStartedFields {
  role: string
  status?: DECLARATION_STATUS | null
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

export interface IAdvancedSearchFields {
  clientId: string
}

export interface IAdvancedSearchTags {
  ipAddress: string
}

export interface IAdvancedSearchPoints {
  measurement: string
  tags: IAdvancedSearchTags
  fields: IAdvancedSearchFields
  timestamp: number | undefined
}

export type IPoints =
  | IDurationPoints
  | ICertifiedPoints
  | ITimeLoggedPoints
  | IInProgressDeclarationPoints
  | IPaymentPoints
  | IBirthRegistrationPoints
  | IDeathRegistrationPoints
  | IDeclarationsStartedPoints
  | IRejectedPoints
  | IUserAuditPoints
  | IAdvancedSearchPoints
