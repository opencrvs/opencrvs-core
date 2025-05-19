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

import { z } from 'zod'
import {
  AddressField,
  AdministrativeArea,
  BulletList,
  Checkbox,
  Country,
  DateField,
  Divider,
  Facility,
  EmailField,
  FieldConfig,
  File,
  FileUploadWithOptions,
  Location,
  Office,
  PageHeader,
  Paragraph,
  RadioGroup,
  SelectField,
  SignatureField,
  TextAreaField,
  TextField,
  NumberField,
  DataField,
  NameField,
  PhoneField,
  IdField
} from './FieldConfig'
import { FieldType } from './FieldType'
import {
  CheckboxFieldValue,
  DateValue,
  EmailValue,
  FieldValue,
  FieldUpdateValueSchema,
  NumberFieldValue,
  NonEmptyTextValue,
  TextValue,
  DataFieldValue,
  DateRangeFieldValue
} from './FieldValue'
import {
  AddressFieldValue,
  AddressFieldUpdateValue,
  FileFieldValue,
  FileFieldWithOptionValue,
  AddressType,
  NameFieldValue
} from './CompositeFieldValue'

/**
 * FieldTypeMapping.ts should include functions that map field types to different formats dynamically.
 * File is separated from FieldType and FieldConfig to avoid circular dependencies.
 *
 * We can move the specific mapFieldTypeTo* functions where they are used once the core fields are implemented.
 */

/**
 * Optionality of a field is defined in FieldConfig, not in FieldValue.
 * Allows for nullishness of a field value during validations based on FieldConfig.
 */
type NullishFieldValueSchema = z.ZodOptional<
  z.ZodNullable<FieldUpdateValueSchema>
>

/**
 * Mapping of field types to Zod schema.
 * Useful for building dynamic validations against FieldConfig
 */
export function mapFieldTypeToZod(type: FieldType, required?: boolean) {
  let schema: FieldUpdateValueSchema | NullishFieldValueSchema
  switch (type) {
    case FieldType.DATE:
      schema = DateValue
      break
    case FieldType.EMAIL:
      schema = EmailValue
      break
    case FieldType.DATE_RANGE:
      schema = DateRangeFieldValue
      break
    case FieldType.TEXT:
    case FieldType.TEXTAREA:
    case FieldType.DIVIDER:
    case FieldType.BULLET_LIST:
    case FieldType.PAGE_HEADER:
    case FieldType.LOCATION:
    case FieldType.SELECT:
    case FieldType.COUNTRY:
    case FieldType.RADIO_GROUP:
    case FieldType.PARAGRAPH:
    case FieldType.ADMINISTRATIVE_AREA:
    case FieldType.FACILITY:
    case FieldType.OFFICE:
    case FieldType.SIGNATURE:
    case FieldType.PHONE:
    case FieldType.ID:
      schema = required ? NonEmptyTextValue : TextValue
      break
    case FieldType.NUMBER:
      schema = NumberFieldValue
      break
    case FieldType.CHECKBOX:
      schema = CheckboxFieldValue
      break
    case FieldType.FILE:
      schema = FileFieldValue
      break
    case FieldType.FILE_WITH_OPTIONS:
      schema = FileFieldWithOptionValue
      break
    case FieldType.ADDRESS:
      schema = AddressFieldUpdateValue
      break
    case FieldType.DATA:
      schema = DataFieldValue
      break
    case FieldType.NAME:
      schema = NameFieldValue
      break
  }

  return required ? schema : schema.nullish()
}

export function createValidationSchema(config: FieldConfig[]) {
  const shape: Record<
    string,
    NullishFieldValueSchema | FieldUpdateValueSchema
  > = {}

  for (const field of config) {
    shape[field.id] = mapFieldTypeToZod(field.type, field.required)
  }

  return z.object(shape)
}

/**
 * Quick-and-dirty mock data generator for event actions.
 */
export function mapFieldTypeToMockValue(field: FieldConfig, i: number) {
  switch (field.type) {
    case FieldType.DIVIDER:
    case FieldType.TEXT:
    case FieldType.TEXTAREA:
    case FieldType.BULLET_LIST:
    case FieldType.PAGE_HEADER:
    case FieldType.LOCATION:
    case FieldType.SELECT:
    case FieldType.COUNTRY:
    case FieldType.RADIO_GROUP:
    case FieldType.SIGNATURE:
    case FieldType.PARAGRAPH:
    case FieldType.ADMINISTRATIVE_AREA:
    case FieldType.FACILITY:
    case FieldType.NAME:
    case FieldType.PHONE:
    case FieldType.ID:
    case FieldType.OFFICE:
      return `${field.id}-${field.type}-${i}`
    case FieldType.NUMBER:
      return 19
    case FieldType.EMAIL:
      return 'test@opencrvs.org'
    case FieldType.ADDRESS:
      return {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
        district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
        urbanOrRural: 'URBAN',
        town: 'Example Town',
        residentialArea: 'Example Residential Area',
        street: 'Example Street',
        number: '55',
        zipCode: '123456'
      }
    case FieldType.DATE:
      return '2021-01-01'
    case FieldType.DATE_RANGE:
      return ['2021-01-01', '2021-01-02']
    case FieldType.CHECKBOX:
      return true
    case FieldType.FILE:
      return {
        filename: '4f095fc4-4312-4de2-aa38-86dcc0f71044.png',
        originalFilename: 'abcd.png',
        type: 'image/png'
      } satisfies FileFieldValue
    case FieldType.FILE_WITH_OPTIONS:
      return null
    case FieldType.DATA:
      return {}
  }
}

/**
 * Maps complex or nested field types, such as Address fields, to their corresponding empty values.
 */
export function mapFieldTypeToEmptyValue(field: FieldConfig) {
  switch (field.type) {
    case FieldType.DIVIDER:
    case FieldType.TEXT:
    case FieldType.TEXTAREA:
    case FieldType.BULLET_LIST:
    case FieldType.PAGE_HEADER:
    case FieldType.LOCATION:
    case FieldType.SELECT:
    case FieldType.COUNTRY:
    case FieldType.RADIO_GROUP:
    case FieldType.SIGNATURE:
    case FieldType.PARAGRAPH:
    case FieldType.ADMINISTRATIVE_AREA:
    case FieldType.FACILITY:
    case FieldType.OFFICE:
    case FieldType.NUMBER:
    case FieldType.EMAIL:
    case FieldType.DATE:
    case FieldType.CHECKBOX:
    case FieldType.DATE_RANGE:
    case FieldType.DATA:
    case FieldType.NAME:
    case FieldType.PHONE:
    case FieldType.ID:
      return null
    case FieldType.ADDRESS:
      return {
        country: null,
        addressType: AddressType.DOMESTIC,
        province: null,
        district: null,
        urbanOrRural: 'URBAN', // Default to urban needed for validation
        town: null,
        residentialArea: null,
        street: null,
        number: null,
        zipCode: null
      }
    case FieldType.FILE:
      return {
        filename: '',
        originalFilename: '',
        type: ''
      } satisfies FileFieldValue
    case FieldType.FILE_WITH_OPTIONS:
      return [] satisfies FileFieldWithOptionValue
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

export const isDateRangeFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: DateField } => {
  return field.config.type === FieldType.DATE_RANGE
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

export const isNumberFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: number; config: NumberField } => {
  return field.config.type === FieldType.NUMBER
}

export const isNameFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: NameFieldValue; config: NameField } => {
  return field.config.type === FieldType.NAME
}

export const isPhoneFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: PhoneField } => {
  return field.config.type === FieldType.PHONE
}

export const isIdFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: IdField } => {
  return field.config.type === FieldType.ID
}

export const isTextAreaFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: TextAreaField } => {
  return field.config.type === FieldType.TEXTAREA
}

export const isSignatureFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: SignatureField } => {
  return field.config.type === FieldType.SIGNATURE
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

export const isFileFieldWithOptionType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is {
  value: FileFieldWithOptionValue
  config: FileUploadWithOptions
} => {
  // @TODO? (same as FILE?)
  return field.config.type === FieldType.FILE_WITH_OPTIONS
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

export const isAddressFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: AddressFieldValue; config: AddressField } => {
  return field.config.type === FieldType.ADDRESS
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

export const isAdministrativeAreaFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: AdministrativeArea } => {
  return field.config.type === FieldType.ADMINISTRATIVE_AREA
}

export const isFacilityFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: Facility } => {
  return field.config.type === FieldType.FACILITY
}

export const isOfficeFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: Office } => {
  return field.config.type === FieldType.OFFICE
}

export const isDataFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: undefined; config: DataField } => {
  return field.config.type === FieldType.DATA
}
