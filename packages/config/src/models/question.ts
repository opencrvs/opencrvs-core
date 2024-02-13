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

// keeping these models to migrate from v1.2 to v1.3

export enum FieldType {
  TEXT = 'TEXT',
  TEL = 'TEL',
  NUMBER = 'NUMBER',
  TEXTAREA = 'TEXTAREA',
  SUBSECTION_HEADER = 'SUBSECTION_HEADER',
  PARAGRAPH = 'PARAGRAPH',
  SELECT_WITH_OPTIONS = 'SELECT_WITH_OPTIONS'
}

export const validFieldType = Object.values(FieldType)

export interface IMessage {
  lang: string
  descriptor: {
    id: string
    description?: string
    defaultMessage: string
  }
}
export interface ICondition {
  fieldId: string
  regexp: string
}
export interface ISelectOption {
  value: string
  label: IMessage[]
}

export interface IValidate {
  operation: string
  parameters: number[]
}

export interface IQuestion {
  // fieldId is in the format:
  // event.sectionId.groupId.fieldName
  fieldId: string
  label?: IMessage[]
  placeholder?: IMessage[]
  description?: IMessage[]
  tooltip?: IMessage[]
  unit?: IMessage[]
  errorMessage?: IMessage[]
  maxLength?: number
  inputWidth?: number
  fieldName?: string
  fieldType?: FieldType
  // must be the fieldId for the field vertically above this one in the form or the string "TOP"
  precedingFieldId: string
  required?: boolean
  // enabled should be a string "DISABLED" or "" or undefined because existing default fields will be ""
  // wanted to use disabled, but this prop is already in use in IFormField
  enabled?: string
  custom?: boolean
  conditionals?: ICondition[]
  datasetId?: string
  options?: ISelectOption[]
  validator?: IValidate[]
}

export interface IQuestionModel extends IQuestion, Document {}

export const messageDescriptor = new Schema(
  {
    id: { type: String, required: true },
    description: { type: String },
    defaultMessage: { type: String, required: true }
  },
  { _id: false }
)

export const message = new Schema(
  {
    lang: { type: String, required: true },
    descriptor: { type: messageDescriptor, required: true }
  },
  { _id: false }
)

export const validator = new Schema(
  {
    operation: { type: String, required: true },
    parameters: {
      type: [{ type: Schema.Types.Mixed, required: false }],
      default: undefined
    }
  },
  { _id: false }
)

export const conditionals = new Schema(
  {
    fieldId: { type: String },
    regexp: { type: String }
  },
  { _id: false }
)

const questionSchema = new Schema({
  fieldId: { type: String, unique: true, required: true },
  label: [
    {
      type: message
    }
  ],
  placeholder: [
    {
      type: message
    }
  ],
  description: [
    {
      type: message
    }
  ],
  unit: [
    {
      type: message
    }
  ],
  tooltip: [
    {
      type: message
    }
  ],
  errorMessage: [
    {
      type: message
    }
  ],
  maxLength: { type: Number, default: 280 },
  inputWidth: { type: Number, default: 0 },
  fieldName: { type: String },
  fieldType: {
    type: String,
    enum: validFieldType,
    default: FieldType.TEXT
  },
  precedingFieldId: { type: String, required: true },
  required: { type: Boolean },
  enabled: { type: String },
  custom: { type: Boolean, default: false },
  conditionals: {
    type: [conditionals],
    default: undefined
  },
  validator: [
    {
      type: validator
    }
  ],
  datasetId: { type: Schema.Types.ObjectId, ref: 'FormDataset' }
})

export default model<IQuestionModel>('Question', questionSchema)
