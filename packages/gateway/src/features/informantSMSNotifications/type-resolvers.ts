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
import { GQLResolver } from '@gateway/graphql/schema'

export interface IInformantSMSNotification {
  _id: string
  name: string
  enabled: boolean
  message?: string
  updatedAt: string
  createdAt: string
}

export interface INotificationMessages {
  languages: Array<{
    lang: string
    displayName: string
    messages: Record<string, string>
  }>
}

export const NOTIFICATION_NAME_MAPPING_WITH_RESOURCE = {
  birthInProgressSMS: 'birthInProgressNotification',
  birthDeclarationSMS: 'birthDeclarationNotification',
  birthRegistrationSMS: 'birthRegistrationNotification',
  birthRejectionSMS: 'birthRejectionNotification',
  deathInProgressSMS: 'deathInProgressNotification',
  deathDeclarationSMS: 'deathDeclarationNotification',
  deathRegistrationSMS: 'deathRegistrationNotification',
  deathRejectionSMS: 'deathRejectionNotification'
}

export const informantSMSNotiTypeResolvers: GQLResolver = {
  SMSNotification: {
    id(informantSMSNotification: IInformantSMSNotification) {
      return informantSMSNotification._id
    }
  }
}
