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
  TEXT = 'TEXT',
  TEL = 'TEL',
  NUMBER = 'NUMBER',
  BIG_NUMBER = 'BIG_NUMBER',
  RADIO_GROUP = 'RADIO_GROUP',
  RADIO_GROUP_WITH_NESTED_FIELDS = 'RADIO_GROUP_WITH_NESTED_FIELDS',
  INFORMATIVE_RADIO_GROUP = 'INFORMATIVE_RADIO_GROUP',
  CHECKBOX_GROUP = 'CHECKBOX_GROUP',
  DATE = 'DATE',
  TEXTAREA = 'TEXTAREA',
  SUBSECTION = 'SUBSECTION',
  FIELD_GROUP_TITLE = 'FIELD_GROUP_TITLE',
  LIST = 'LIST',
  PARAGRAPH = 'PARAGRAPH',
  DOCUMENTS = 'DOCUMENTS',
  SELECT_WITH_OPTIONS = 'SELECT_WITH_OPTIONS',
  SELECT_WITH_DYNAMIC_OPTIONS = 'SELECT_WITH_DYNAMIC_OPTIONS',
  FIELD_WITH_DYNAMIC_DEFINITIONS = 'FIELD_WITH_DYNAMIC_DEFINITIONS',
  IMAGE_UPLOADER_WITH_OPTIONS = 'IMAGE_UPLOADER_WITH_OPTIONS',
  DOCUMENT_UPLOADER_WITH_OPTION = 'DOCUMENT_UPLOADER_WITH_OPTION',
  SIMPLE_DOCUMENT_UPLOADER = 'SIMPLE_DOCUMENT_UPLOADER',
  WARNING = 'WARNING',
  LINK = 'LINK',
  PDF_DOCUMENT_VIEWER = 'PDF_DOCUMENT_VIEWER',
  DYNAMIC_LIST = 'DYNAMIC_LIST',
  FETCH_BUTTON = 'FETCH_BUTTON',
  LOCATION_SEARCH_INPUT = 'LOCATION_SEARCH_INPUT'
}

export const validFieldType = Object.values(FieldType)

export const messageDescriptor = new Schema({
  id: { type: String, required: true },
  description: { type: String },
  defaultMessage: { type: String }
})

export const dropdownOption = new Schema({
  label: { type: messageDescriptor, required: true },
  value: { type: String, required: true }
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
  maxLength: { type: Number, required: false },
  options: { type: [dropdownOption], required: false },
  fieldName: { type: String, required: true },
  fieldType: {
    type: String,
    required: true,
    enum: validFieldType,
    default: FieldType.TEXT
  },
  fieldId: { type: String, unique: true, required: true },
  sectionPositionForField: { type: Number, required: true },
  fhirSchema: { type: String, required: true },
  enabled: { type: Boolean, required: true },
  custom: { type: Boolean }
})

export default model<IQuestionModel>('Question', questionSchema)
