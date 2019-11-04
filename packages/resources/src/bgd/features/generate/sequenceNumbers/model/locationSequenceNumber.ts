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
import { MIN_SEQ_NUMBER, MAX_SEQ_NUMBER } from '@resources/bgd/constants'

interface ILocationSequenceNumber {
  locationId: string
  lastUsedSequenceNumber: number
}
export interface ILocationSequenceNumberModel
  extends ILocationSequenceNumber,
    Document {}

const locationSequenceNumberSchema = new Schema(
  {
    locationId: {
      type: String,
      unique: true,
      required: true
    },
    lastUsedSequenceNumber: {
      type: Number,
      required: true,
      min: MIN_SEQ_NUMBER,
      max: MAX_SEQ_NUMBER
    }
  },
  { strict: true }
)

export default model<ILocationSequenceNumberModel>(
  'LocationSequenceNumber',
  locationSequenceNumberSchema
)
