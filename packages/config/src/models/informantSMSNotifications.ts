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
import { model, Schema, Document } from 'mongoose'

export interface IInformantSMSNotificationsModel extends Document {
  name: string
  enabled: boolean
  updatedAt: number
  createdAt: number
}

const informantSMSNotificationsSchema = new Schema({
  name: { type: String, unique: true, required: true },
  enabled: {
    type: Boolean,
    required: true,
    default: false
  },
  updatedAt: { type: Number, default: Date.now, required: true },
  createdAt: { type: Number, default: Date.now, required: true }
})

export default model<IInformantSMSNotificationsModel>(
  'InformantSMSNotifications',
  informantSMSNotificationsSchema
)
