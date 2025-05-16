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
  RuralAddressValue,
  RuralAddressUpdateValue,
  UrbanAddressValue,
  UrbanAddressUpdateValue,
  GenericAddressValue,
  GenericAddressUpdateValue,
  NameFieldValue,
  NameFieldUpdateValue
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

export const DatetimeValue = z.string().datetime()

export const DateRangeFieldValue = DateValue.or(z.tuple([DateValue, DateValue]))
export type DateRangeFieldValue = z.infer<typeof DateRangeFieldValue>

export const EmailValue = z.string().email()

export const CheckboxFieldValue = z.boolean()
export type CheckboxFieldValue = z.infer<typeof CheckboxFieldValue>
export const NumberFieldValue = z.number()
export type NumberFieldValue = z.infer<typeof NumberFieldValue>
export const DataFieldValue = z.undefined()
export type DataFieldValue = z.infer<typeof DataFieldValue>

export const FieldValue = z.union([
  TextValue,
  DateValue,
  DateRangeFieldValue,
  CheckboxFieldValue,
  NumberFieldValue,
  FileFieldValue,
  FileFieldWithOptionValue,
  UrbanAddressValue,
  RuralAddressValue,
  DataFieldValue,
  GenericAddressValue,
  NameFieldValue,
  NameFieldUpdateValue
])

export type FieldValue = z.infer<typeof FieldValue>

export const FieldUpdateValue = z.union([
  TextValue,
  DateValue,
  DateRangeFieldValue,
  CheckboxFieldValue,
  NumberFieldValue,
  FileFieldValue,
  FileFieldWithOptionValue,
  UrbanAddressUpdateValue,
  RuralAddressUpdateValue,
  DataFieldValue,
  GenericAddressUpdateValue,
  NameFieldUpdateValue
])

export type FieldUpdateValue = z.infer<typeof FieldUpdateValue>

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
  | typeof FileFieldValue
  | typeof FileFieldWithOptionValue
  | typeof CheckboxFieldValue
  | typeof AddressFieldUpdateValue
  | typeof NumberFieldValue
  | typeof DataFieldValue
  | typeof NameFieldValue
  | z.ZodString
  | z.ZodBoolean
