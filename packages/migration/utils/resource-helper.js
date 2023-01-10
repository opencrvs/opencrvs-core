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

export const INFORMANT_SMS_NOTIFICATION_COLLECTION = 'informantsmsnotifications'

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

export function getNotificationContent() {
  return Object.keys(NOTIFICATION_NAME_MAPPING_WITH_RESOURCE).map((key) => ({
    name: key,
    enabled: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }))
}
