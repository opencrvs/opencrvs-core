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
