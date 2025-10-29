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
  AddressFieldValue,
  AddressFieldUpdateValue,
  FileFieldValue,
  FileFieldWithOptionValue,
  NameFieldValue,
  NameFieldUpdateValue,
  HttpFieldUpdateValue,
  HttpFieldValue,
  QueryParamReaderFieldValue,
  QueryParamReaderFieldUpdateValue,
  QrReaderFieldValue,
  IdReaderFieldValue
} from './CompositeFieldValue'
/**
 * FieldValues defined in this file are primitive field values.
 * FieldValues defined in CompositeFieldValue.ts are composed of multiple primitive field values (Address, File etc).
 *
 * FieldValue is a union of primitive and composite field values.
 * FieldValue can never be null.
 *
 * FieldUpdateValue accepts null values for primitive field values when they are optional.
 * API is build assuming partial (PATCH) updates. In order to edit and remove optional value, we need to accept null values.
 * Omitting a field value in partial updates leaves it untouched.
 *
 */

export const TextValue = z.string()
export const NonEmptyTextValue = TextValue.min(1)

export const DateValue = z
  .string()
  .date()
  .describe('Date in the format YYYY-MM-DD')

export type DateValue = z.infer<typeof DateValue>

export const AgeValue = z.object({
  age: z.number(),
  asOfDateRef: z.string()
})
export type AgeValue = z.infer<typeof AgeValue>
export const AgeUpdateValue = AgeValue.optional().nullable()

export const TimeValue = z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/)

export const DatetimeValue = z.string().datetime()

export const SelectDateRangeValue = z.enum([
  'last7Days',
  'last30Days',
  'last90Days',
  'last365Days'
])

export const DateRangeFieldValue = z
  .object({
    start: DateValue,
    end: DateValue
  })
  .or(DateValue)
  .describe(
    'Date range with start and end dates in the format YYYY-MM-DD. Inclusive start, exclusive end.'
  )

export type DateRangeFieldValue = z.infer<typeof DateRangeFieldValue>
export type SelectDateRangeValue = z.infer<typeof SelectDateRangeValue>

export const EmailValue = z.string().email()

export const CheckboxFieldValue = z.boolean()
export type CheckboxFieldValue = z.infer<typeof CheckboxFieldValue>
export const NumberFieldValue = z.number()
export type NumberFieldValue = z.infer<typeof NumberFieldValue>

export const SignatureFieldValue = z.string()
export type SignatureFieldValue = z.infer<typeof SignatureFieldValue>

export const ButtonFieldValue = z.number()
export type ButtonFieldValue = z.infer<typeof ButtonFieldValue>
export const VerificationStatusValue = z.enum([
  'verified',
  'authenticated',
  'failed',
  'pending'
])
export type VerificationStatusValue = z.infer<typeof VerificationStatusValue>

// We need to create a separate union of all field types excluding the DataFieldValue,
// because otherwise the DataFieldValue would need to refer to itself.
const FieldValuesWithoutDataField = z.union([
  AddressFieldValue,
  TextValue,
  DateValue,
  AgeValue,
  TimeValue,
  DateRangeFieldValue,
  SelectDateRangeValue,
  CheckboxFieldValue,
  NumberFieldValue,
  FileFieldValue,
  FileFieldWithOptionValue,
  NameFieldValue,
  NameFieldUpdateValue,
  ButtonFieldValue,
  HttpFieldValue,
  VerificationStatusValue,
  QueryParamReaderFieldValue,
  QrReaderFieldValue,
  IdReaderFieldValue
])
type FieldValuesWithoutDataField = z.infer<typeof FieldValuesWithoutDataField>

// As data field value can refer to other field values, it can contain any other field value types
export const DataFieldValue = z
  .object({
    data: z.record(z.string(), FieldValuesWithoutDataField)
  })
  .nullish()
export type DataFieldValue = z.infer<typeof DataFieldValue>

export type FieldValue = FieldValuesWithoutDataField | DataFieldValue
export const FieldValue: z.ZodType<FieldValue> = z.union([
  FieldValuesWithoutDataField,
  DataFieldValue
])

export type FieldUpdateValue =
  | z.infer<typeof TextValue>
  | z.infer<typeof DateValue>
  | z.infer<typeof TimeValue>
  | z.infer<typeof AgeUpdateValue>
  | z.infer<typeof AddressFieldUpdateValue>
  | z.infer<typeof DateRangeFieldValue>
  | z.infer<typeof SelectDateRangeValue>
  | z.infer<typeof CheckboxFieldValue>
  | z.infer<typeof NumberFieldValue>
  | z.infer<typeof FileFieldValue>
  | z.infer<typeof FileFieldWithOptionValue>
  | z.infer<typeof DataFieldValue>
  | z.infer<typeof NameFieldUpdateValue>
  | z.infer<typeof HttpFieldUpdateValue>
  | z.infer<typeof QueryParamReaderFieldUpdateValue>

export const FieldUpdateValue: z.ZodType<FieldUpdateValue> = z.union([
  TextValue,
  DateValue,
  TimeValue,
  AgeUpdateValue,
  AddressFieldUpdateValue,
  DateRangeFieldValue,
  SelectDateRangeValue,
  CheckboxFieldValue,
  NumberFieldValue,
  FileFieldValue,
  FileFieldWithOptionValue,
  DataFieldValue,
  NameFieldUpdateValue,
  HttpFieldUpdateValue,
  QueryParamReaderFieldUpdateValue
])

/**
 * NOTE: This is an exception. We need schema as a type in order to generate schema dynamically.
 * */
export type FieldValueSchema =
  | typeof FileFieldValue
  | typeof FileFieldWithOptionValue
  | typeof CheckboxFieldValue
  | typeof AddressFieldValue
  | typeof NumberFieldValue
  | typeof DataFieldValue
  | typeof NameFieldValue
  | z.ZodString
  | z.ZodBoolean
/**
 * NOTE: This is an exception. We need schema as a type in order to generate schema dynamically.
 *
 * FieldValueInputSchema uses Input types which have set optional values as nullish
 * */
export type FieldUpdateValueSchema =
  | typeof DateRangeFieldValue
  | typeof AgeValue
  | typeof SelectDateRangeValue
  | typeof FileFieldValue
  | typeof FileFieldWithOptionValue
  | typeof CheckboxFieldValue
  | typeof AddressFieldUpdateValue
  | typeof NumberFieldValue
  | typeof DataFieldValue
  | typeof NameFieldValue
  | typeof NameFieldUpdateValue
  | typeof HttpFieldUpdateValue
  | typeof QueryParamReaderFieldUpdateValue
  | typeof ButtonFieldValue
  | typeof QrReaderFieldValue
  | typeof IdReaderFieldValue
  | z.ZodString
  | z.ZodBoolean
