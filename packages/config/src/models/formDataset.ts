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
import { Document, model, Schema } from 'mongoose'
import { ISelectOption, message } from '@config/models/question'

// keeping these models to migrate from v1.2 to v1.3

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
