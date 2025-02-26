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
import { InferSchemaType, model, Schema, Types } from 'mongoose'

const errorSchema = {
  statusCode: { type: Number },
  message: { type: String, required: true },
  error: { type: String }
}
const notificationQueueSchema = new Schema({
  subject: { type: String, required: true },
  body: { type: String, required: true },
  recipientEmail: { type: String },
  bcc: { type: [String], required: true },
  status: {
    type: String,
    enum: ['success', 'failed']
  },
  locale: { type: String, required: true },
  createdAt: { type: Number, default: Date.now },
  error: { type: errorSchema },
  requestId: { type: String, required: true }
})

export type NotificationQueueRecord = { _id: Types.ObjectId } & InferSchemaType<
  typeof notificationQueueSchema
>
export default model('NotificationQueue', notificationQueueSchema)
