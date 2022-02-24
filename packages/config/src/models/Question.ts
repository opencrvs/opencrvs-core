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

export interface IOptions {
  label: string
  value: string
}

export interface IMessageDescriptor {
  id: string
  description: string
  defaultMessage: string
}

export interface IQuestion {
  fieldId: string
  fhirSectionCode?: string
  fhirResource?: IFhirResource
  label: IMessageDescriptor
  placeholder?: IMessageDescriptor
  maxLength?: number
  options?: IOptions[]
  fieldName: string
  fieldType: FieldType
  sectionPositionForField?: number
  enabled: boolean
  required: boolean
  custom: boolean
  initialValue?: string
  nestedFieldParentRadioId?: string
  sectionPositionForNestedRadioField?: number
}

export interface IQuestionModel extends IQuestion, Document {}

export const messageDescriptor = new Schema({
  id: { type: String, required: true },
  description: { type: String },
  defaultMessage: { type: String }
})

export const dropdownOption = new Schema({
  label: { type: messageDescriptor, required: true },
  value: { type: String, required: true }
})

export interface IFhirResource {
  type: string
  observationCode?: string
  observationDescription?: string
  categoryCode?: string
  categoryDescription?: string
  fhirRepresentation: string
  customFhirFunction?: string
}

const fhirResourceSchema = new Schema({
  type: { type: String, required: true },
  observationCode: { type: String },
  observationDescription: { type: String },
  categoryCode: { type: String },
  categoryDescription: { type: String },
  fhirRepresentation: { type: String, required: true },
  customFhirFunction: { type: String }
})

const questionSchema = new Schema({
  fieldId: { type: String, unique: true, required: true },
  fhirSectionCode: { type: String }, // "birth-encounter",
  fhirResource: { type: fhirResourceSchema },
  label: { type: messageDescriptor, required: true },
  placeholder: { type: messageDescriptor, required: false },
  maxLength: { type: Number, required: false },
  options: { type: [dropdownOption], required: false },
  fieldName: { type: String, required: true },
  fieldType: {
    type: String,
    required: true,
    enum: validFieldType,
    default: FieldType.TEXT
  },
  sectionPositionForField: { type: Number },
  required: { type: Boolean, required: true },
  readonly: { type: Boolean, required: true },
  enabled: { type: Boolean, required: true },
  custom: { type: Boolean },
  initialValue: { type: String },
  nestedFieldParentRadioId: { type: String },
  sectionPositionForNestedRadioField: { type: Number }
})

export default model<IQuestionModel>('Question', questionSchema)
