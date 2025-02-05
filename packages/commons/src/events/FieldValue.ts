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
import { FieldType } from './FieldConfig'

const TextFieldValue = z.string()
export type TextFieldValue = z.infer<typeof TextFieldValue>

const DateFieldValue = z.string().nullable()
export type DateFieldValue = z.infer<typeof DateFieldValue>

const ParagraphFieldValue = z.string()
export type ParagraphFieldValue = z.infer<typeof ParagraphFieldValue>

const PageHeaderFieldValue = z.string()
export type PageHeaderFieldValue = z.infer<typeof PageHeaderFieldValue>

const BulletListFieldValue = z.string()
export type BulletListFieldValue = z.infer<typeof BulletListFieldValue>

export const FileFieldValue = z
  .object({
    filename: z.string(),
    originalFilename: z.string(),
    type: z.string()
  })
  .nullable()

export type FileFieldValue = z.infer<typeof FileFieldValue>

export const FileFieldValueWithOption = z.object({
  filename: z.string(),
  originalFilename: z.string(),
  type: z.string(),
  option: z.string()
})

export type FileFieldValueWithOption = z.infer<typeof FileFieldValueWithOption>

export const FileFieldWithOptionValue = z.array(FileFieldValueWithOption)

export type FileFieldWithOptionValue = z.infer<typeof FileFieldWithOptionValue>

const RadioGroupFieldValue = z.string()
export type RadioGroupFieldValue = z.infer<typeof RadioGroupFieldValue>

const CheckboxFieldValue = z.enum(['true', 'false'])
export type CheckboxFieldValue = z.infer<typeof CheckboxFieldValue>

const LocationFieldValue = z.string()
export type LocationFieldValue = z.infer<typeof LocationFieldValue>

const SelectFieldValue = z.string()
export type SelectFieldValue = z.infer<typeof SelectFieldValue>

const CountryFieldValue = z.string()
export type CountryFieldValue = z.infer<typeof CountryFieldValue>

export type FieldTypeToFieldValue<T extends FieldType> = T extends 'TEXT'
  ? TextFieldValue
  : T extends 'PARAGRAPH'
  ? ParagraphFieldValue
  : T extends 'BULLET_LIST'
  ? BulletListFieldValue
  : T extends 'DATE'
  ? DateFieldValue
  : T extends 'FILE'
  ? FileFieldValue
  : T extends 'FILE_WITH_OPTIONS'
  ? FileFieldWithOptionValue
  : T extends 'RADIO_GROUP'
  ? RadioGroupFieldValue
  : T extends 'CHECKBOX'
  ? CheckboxFieldValue
  : T extends 'LOCATION'
  ? LocationFieldValue
  : T extends 'COUNTRY'
  ? CountryFieldValue
  : T extends 'SELECT'
  ? SelectFieldValue
  : never

export const FieldValue = z.union([
  TextFieldValue,
  DateFieldValue,
  ParagraphFieldValue,
  FileFieldValue,
  RadioGroupFieldValue,
  CheckboxFieldValue,
  LocationFieldValue,
  SelectFieldValue,
  FileFieldWithOptionValue
])

export type FieldValue = z.infer<typeof FieldValue>
