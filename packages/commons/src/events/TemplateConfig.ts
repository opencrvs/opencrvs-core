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

import { FieldValue } from './FieldValue'

export type DefaultValue =
  | FieldValue
  | MetaFieldsDotted
  | Record<string, MetaFieldsDotted | FieldValue>

export function isTemplateVariable(
  value: DefaultValue
): value is MetaFieldsDotted {
  return typeof value === 'string' && (value as string).startsWith('$')
}

export function isFieldValue(value: DefaultValue): value is FieldValue {
  return FieldValue.safeParse(value).success
}

export function isFieldValueWithoutTemplates(
  value: DefaultValue
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

export function isDefaultValue(value: any): value is DefaultValue {
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
    return Object.values(value).every((v) => isDefaultValue(v))
  }

  return false
}

export interface MetaFields {
  $user: {
    province: string
    district: string
  }
}

type DottedKeys<T, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends Record<string, string>
    ? DottedKeys<T[K], `${Prefix}${K & string}.`>
    : `${Prefix}${K & string}`
}[keyof T]

export type MetaFieldsDotted = DottedKeys<MetaFields>
