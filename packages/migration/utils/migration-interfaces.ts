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

export interface ICertificateTemplateData {
  event: Event
  status: string
  svgCode: string
  svgDateCreated: string
  svgDateUpdated: string
  svgFilename: string
  user: string
  _id: string
}

export interface NotificationContent {
  name: string
  enabled: boolean
  createdAt: number
  updatedAt: number
}

export interface IPoints {
  compositionId: string
  timestamp: string
  startedBy: string
}

export interface IMigrationRegistrationResults {
  total?: number
}

export interface IPoint {
  time: {
    getNanoTime: () => number
  }
}

export interface IRegistrationFields extends IPoint {
  compositionId: string
  ageInYears: number | undefined
  deathDays: number | undefined
}

export interface Identifier {
  type: string
  value: string
}

export interface ICorrectionPoint {
  measurement: string
  tags: {
    eventType: DECLARATION_TYPE
    reason: string
  }
  fields: { compositionId: string }
  timestamp: number | undefined
}

export interface ILocationTags {
  officeLocation?: string
  locationLevel5?: string
  locationLevel4?: string
  locationLevel3?: string
  locationLevel2?: string
}

export type DECLARATION_TYPE = 'BIRTH' | 'DEATH' | 'MARRIAGE'
