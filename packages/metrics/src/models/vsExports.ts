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
import { model, Schema, Document } from 'mongoose'

export enum Event {
  BIRTH = 'birth',
  DEATH = 'death'
}

export interface IVSExportModel extends IVSExport, Document {}
export interface IVSExport {
  event: Event
  startDate: Date
  endDate: Date
  fileSize: string
  url: string
  createdOn: Date
}

const vsExportSchema = new Schema({
  event: {
    type: String,
    enum: [Event.BIRTH, Event.DEATH]
  },
  startDate: { type: Date },
  endDate: { type: Date },
  fileSize: { type: String },
  url: { type: String },
  createdOn: { type: Date, default: Date.now }
})

export default model<IVSExportModel>('vsexports', vsExportSchema)
