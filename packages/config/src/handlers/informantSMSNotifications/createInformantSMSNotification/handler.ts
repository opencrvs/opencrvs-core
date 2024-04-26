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
import InformantSMSNotification, {
  IInformantSMSNotificationsModel
} from '@config/models/informantSMSNotifications'
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import getInformantSMSNotificationsHandler from '@config/handlers/informantSMSNotifications/getInformantSMSNotification/handler'

export default async function createInformantSMSNotification(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const informantSMSNotificationPayload =
    request.payload as IInformantSMSNotificationsModel[]

  await InformantSMSNotification.insertMany(informantSMSNotificationPayload)

  const informantSMSNotifications = await getInformantSMSNotificationsHandler()

  return h.response(informantSMSNotifications).code(201)
}

export const requestSchema = Joi.array().items({
  name: Joi.string().required(),
  enabled: Joi.boolean()
})
