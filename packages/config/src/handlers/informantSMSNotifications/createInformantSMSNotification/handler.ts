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
import InformantSMSNotification, {
  IInformantSMSNotificationsModel
} from '@config/models/informantSMSNotifications'
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import { internal } from '@hapi/boom'
import getInformantSMSNotificationsHandler from '@config/handlers/informantSMSNotifications/getInformantSMSNotification/handler'

export default async function createInformantSMSNotification(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const informantSMSNotificationPayload =
    request.payload as IInformantSMSNotificationsModel
  try {
    await InformantSMSNotification.create(informantSMSNotificationPayload)
  } catch (e) {
    throw internal(e.message)
  }
  const informantSMSNotifications = await getInformantSMSNotificationsHandler(
    request,
    h
  )

  return h.response(informantSMSNotifications).code(201)
}

export const requestSchema = Joi.object({
  name: Joi.string().required(),
  enabled: Joi.boolean()
})
