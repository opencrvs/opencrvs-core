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
import * as Hapi from '@hapi/hapi'
import InformantSMSNotification, {
  IInformantSMSNotificationsModel
} from '@config/models/informantSMSNotifications'
import { internal } from '@hapi/boom'

export default async function getInformantSMSNotifications(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  let informantSMSNotifications: IInformantSMSNotificationsModel[]
  try {
    informantSMSNotifications = await InformantSMSNotification.find().exec()
  } catch (error) {
    throw internal(error.message)
  }
  return informantSMSNotifications
}
