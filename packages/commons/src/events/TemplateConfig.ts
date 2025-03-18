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

/**
 * TemplateConfig defines configuration rules for system-based variables (e.g. $user.province).
 * They are currently used for providing default values in FieldConfig.
 */

import { FieldValue } from './FieldValue'

/**
 * Available system variables for configuration.
 */
export interface MetaFields {
  $user: {
    province: string
    district: string
  }
}

/**
 * Recursively flatten the keys of an object. Used to limit types when configuring default values in country config.
 * @example
 * type Test = FlattenedKeyStrings<{ a: { b: string, c: { d: string } } }>
 * // 'a.b' | 'a.c.d' but not 'a' or 'a.c'
 */
type FlattenedKeyStrings<T, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends Record<string, any>
    ? FlattenedKeyStrings<T[K], `${Prefix}${K & string}.`>
    : `${Prefix}${K & string}`
}[keyof T]

export type FlattenedMetaFields = FlattenedKeyStrings<MetaFields>

/**
 * Default value for a field when configuring a form.
 */
export type FieldConfigDefaultValue =
  | FieldValue
  | FlattenedMetaFields
  | Record<string, FlattenedMetaFields | FieldValue>

export function isTemplateVariable(
  value: FieldConfigDefaultValue
): value is FlattenedMetaFields {
  return typeof value === 'string' && (value as string).startsWith('$')
}

export function isFieldValue(
  value: FieldConfigDefaultValue
): value is FieldValue {
  return FieldValue.safeParse(value).success
}

/**
 * Checks if given value is valid for a field, and known template variables are already resolved.
 * @todo: Extend functionality to arbitrary depth objects. Currently only checks first level since our compoosite fields are only 1 level deep.
 */
export function isFieldValueWithoutTemplates(
  value: FieldConfigDefaultValue
): value is FieldValue {
  if (isTemplateVariable(value)) {
    return false
  }

  if (
    typeof value === 'object' &&
    Object.values(value).some((val) => isTemplateVariable(val))
  ) {
    return false
  }

  return true
}

export function isFieldConfigDefaultValue(
  value: any
): value is FieldConfigDefaultValue {
  if (!value) return false

  if (isFieldValue(value)) {
    return true
  }

  if (isTemplateVariable(value)) {
    return true
  }

  if (
    typeof value === 'object' &&
    Object.values(value).every((v) => typeof v === 'object' && v !== null)
  ) {
    return Object.values(value).every((v) => isFieldConfigDefaultValue(v))
  }

  return false
}
