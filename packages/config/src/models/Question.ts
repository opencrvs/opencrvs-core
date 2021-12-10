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

export enum FieldType {
  Input = 'input',
  Select = 'select',
  Date = 'date'
}

export const validFieldType = Object.values(FieldType)

export const messageDescriptor = new Schema({
  id: { type: String, required: true },
  description: { type: String },
  defaultMessage: { type: String }
})
export interface IQuestion {
  label: typeof messageDescriptor
  placeholder: string
  maxLength?: number
  required: boolean
  fieldName: string
  fieldType: FieldType
  fieldId: string
  sectionPositionForField: number
  fhirSchema: string
  enabled: boolean
  custom: boolean
}

export interface IQuestionModel extends IQuestion, Document {}

const questionSchema = new Schema({
  label: { type: messageDescriptor, required: true },
  placeholder: { type: String, required: false },
  maxLength: { type: String, required: false },
  fieldName: { type: String, required: true },
  fieldType: {
    type: String,
    required: true,
    enum: validFieldType,
    default: FieldType.Input
  },
  fieldId: { type: String, unique: true, required: true },
  sectionPositionForField: { type: Number, required: true },
  fhirSchema: { type: String, required: true },
  enabled: { type: Boolean, required: true },
  custom: { type: Boolean }
})

export default model<IQuestionModel>('Question', questionSchema)
