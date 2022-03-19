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

export enum Event {
  BIRTH = 'birth',
  DEATH = 'death'
}
export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface ICertificateModel extends Document {
  svgCode: string
  svgFilename: string
  svgDateUpdated: number
  svgDateCreated: number
  user: string
  event: Event
  status: Status
}

const certificateSchema = new Schema({
  svgCode: { type: String, required: false },
  svgFilename: { type: String, required: false },
  svgDateUpdated: { type: Number, default: Date.now },
  svgDateCreated: { type: Number, default: Date.now },
  user: { type: String, required: false },
  event: {
    type: String,
    enum: [Event.BIRTH, Event.DEATH],
    required: false
  },
  status: {
    type: String,
    enum: [Status.ACTIVE, Status.INACTIVE],
    required: false
  }
})

export default model<ICertificateModel>('Certificate', certificateSchema)
