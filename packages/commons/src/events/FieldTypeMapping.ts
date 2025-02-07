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

import { ErrorMapCtx, z, ZodIssueOptionalMessage } from 'zod'
import {
  BulletList,
  Checkbox,
  Country,
  DateField,
  Divider,
  EmailField,
  FieldConfig,
  File,
  Location,
  PageHeader,
  Paragraph,
  RadioGroup,
  SelectField,
  TextField
} from './FieldConfig'
import { FieldType } from './FieldType'
import {
  CheckboxFieldValue,
  DateValue,
  EmailValue,
  FieldValue,
  FieldValueSchema,
  FileFieldValue,
  OptionalFieldValueSchema,
  TextValue
} from './FieldValue'

/**
 * FieldTypeMapping.ts should include functions that map field types to different formats dynamically.
 * File is separated from FieldType and FieldConfig to avoid circular dependencies.
 *
 * We can move the specific mapFieldTypeTo* functions where they are used once the core fields are implemented.
 */

/**
 * Mapping of field types to Zod schema.
 * Useful for building dynamic validations against FieldConfig
 */
export function mapFieldTypeToZod(type: FieldType, required?: boolean) {
  let schema: FieldValueSchema
  switch (type) {
    case FieldType.DATE:
      schema = DateValue
      break
    case FieldType.EMAIL:
      schema = EmailValue
      break
    case FieldType.TEXT:
    case FieldType.DIVIDER:
    case FieldType.BULLET_LIST:
    case FieldType.PAGE_HEADER:
    case FieldType.LOCATION:
    case FieldType.SELECT:
    case FieldType.COUNTRY:
    case FieldType.RADIO_GROUP:
    case FieldType.PARAGRAPH:
    case FieldType.HIDDEN:
      schema = required ? TextValue.min(1) : TextValue
      break
    case FieldType.CHECKBOX:
      schema = CheckboxFieldValue

      break
    case FieldType.FILE:
      schema = FileFieldValue

      break
  }

  return required ? schema : schema.optional()
}

/**
 * Form error message definitions for Zod validation errors.
 * Overrides zod internal type error messages (string) to match the OpenCRVS error messages (TranslationConfig).
 */
export const zodTranslatioConfigErrorMap = (
  issue: ZodIssueOptionalMessage,
  _ctx: ErrorMapCtx
) => {
  if (issue.code === 'too_small' && issue.type === 'string') {
    return {
      message: {
        message: {
          defaultMessage: 'Required for registration',
          description: 'This is the error message for required fields',
          id: 'v2.error.required'
        }
      }
    }
  }

  return {
    message: {
      message: {
        defaultMessage: 'Required for registration',
        description: 'This is the error message for required fields',
        id: 'v2.error.required'
      }
    }
  }
}

export function createValidationSchema(config: FieldConfig[]) {
  const shape: Record<string, FieldValueSchema | OptionalFieldValueSchema> = {}

  for (const field of config) {
    shape[field.id] = mapFieldTypeToZod(field.type, field.required)
  }

  return z.object(shape)
}

export function mapFieldTypeToElasticsearch(field: FieldConfig) {
  switch (field.type) {
    case FieldType.DATE:
      // @TODO: This should be changed back to 'date'
      // When we have proper validation of custom fields.
      return { type: 'text' }
    case FieldType.EMAIL:
    case FieldType.TEXT:
    case FieldType.PARAGRAPH:
    case FieldType.BULLET_LIST:
    case FieldType.PAGE_HEADER:
      return { type: 'text' }
    case FieldType.DIVIDER:
    case FieldType.RADIO_GROUP:
    case FieldType.SELECT:
    case FieldType.COUNTRY:
    case FieldType.CHECKBOX:
    case FieldType.LOCATION:
      return { type: 'keyword' }
    case FieldType.FILE:
      return {
        type: 'object',
        properties: {
          filename: { type: 'keyword' },
          originalFilename: { type: 'keyword' },
          type: { type: 'keyword' }
        }
      }
  }
}

/**
 * Quick-and-dirty mock data generator for event actions.
 */
export function mapFieldTypeToMockValue(field: FieldConfig, i: number) {
  switch (field.type) {
    case FieldType.DIVIDER:
    case FieldType.TEXT:
    case FieldType.BULLET_LIST:
    case FieldType.PAGE_HEADER:
    case FieldType.LOCATION:
    case FieldType.SELECT:
    case FieldType.COUNTRY:
    case FieldType.RADIO_GROUP:
    case FieldType.PARAGRAPH:
      return `${field.id}-${field.type}-${i}`
    case FieldType.EMAIL:
      return 'test@opencrvs.org'
    case FieldType.DATE:
      return '2021-01-01'
    case FieldType.CHECKBOX:
      return true
    case FieldType.FILE:
      return null
  }
}

export const isParagraphFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: Paragraph } => {
  return field.config.type === FieldType.PARAGRAPH
}

export const isDateFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: DateField } => {
  return field.config.type === FieldType.DATE
}

export const isPageHeaderFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: PageHeader } => {
  return field.config.type === FieldType.PAGE_HEADER
}

export const isTextFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: TextField } => {
  return field.config.type === FieldType.TEXT
}

export const isEmailFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: EmailField } => {
  return field.config.type === FieldType.EMAIL
}

export const isFileFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: FileFieldValue; config: File } => {
  // @TODO?
  return field.config.type === FieldType.FILE
}

export const isBulletListFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: BulletList } => {
  return field.config.type === FieldType.BULLET_LIST
}

export const isSelectFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: SelectField } => {
  return field.config.type === FieldType.SELECT
}

export const isCountryFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: Country } => {
  return field.config.type === FieldType.COUNTRY
}

export const isCheckboxFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: boolean; config: Checkbox } => {
  return field.config.type === FieldType.CHECKBOX
}

export const isRadioGroupFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: RadioGroup } => {
  return field.config.type === FieldType.RADIO_GROUP
}

export const isLocationFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: Location } => {
  return field.config.type === FieldType.LOCATION
}

export const isDividerFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: Divider } => {
  return field.config.type === FieldType.DIVIDER
}
