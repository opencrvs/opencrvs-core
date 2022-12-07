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
import { Document, model, Schema } from 'mongoose'
import { ISelectOption, message } from '@config/models/question'

export interface IDataset {
  fileName: string
  options: ISelectOption[]
  createdAt: string
  createdBy?: string
  resource?: string
}

export interface IDataSetModel extends IDataset, Document {}

export const optionSchema = new Schema(
  {
    value: { type: String, required: true },
    label: [{ type: message, required: true }]
  },
  { _id: false }
)

const FormDatasetSchema = new Schema({
  options: [
    {
      type: optionSchema,
      required: true
    }
  ],
  resource: { type: String },
  fileName: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, required: true }
})

export default model<IDataSetModel>('FormDataset', FormDatasetSchema)
