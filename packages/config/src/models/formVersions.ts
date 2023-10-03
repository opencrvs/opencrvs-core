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

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface IFormVersionModel extends Document {
  version: string
  birthForm: string
  deathForm: string
  marriageForm: string
  formVersionDateCreated: number
  event: Event
  status: Status
}

const formVersionSchema = new Schema({
  version: { type: String, required: true, unique: true },
  birthForm: { type: String, required: true },
  deathForm: { type: String, required: true },
  marriageForm: { type: String, required: true },
  formVersionDateCreated: { type: Number, default: Date.now },
  status: {
    type: String,
    enum: [Status.ACTIVE, Status.INACTIVE],
    required: false
  }
})

export default model<IFormVersionModel>('FormVersions', formVersionSchema)
