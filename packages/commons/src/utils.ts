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

import { NameFieldValue } from './events/CompositeFieldValue'
import * as z from 'zod'
import * as _ from 'lodash'

export function getOrThrow<T>(x: T, message: string) {
  if (x === undefined || x === null) {
    throw new Error(message)
  }

  return x
}

/**
 *
 * Joins defined values using a separator and trims the result
 */
export function joinValues(
  values: Array<string | undefined | null>,
  separator = ' '
) {
  return values
    .filter((value) => !!value)
    .join(separator)
    .trim()
}

export const FullNameV1 = z.array(
  z.object({
    use: z.string(),
    family: z.string(),
    given: z.array(z.string())
  })
)

export type FullNameV1 = z.infer<typeof FullNameV1>

export function personNameFromV1ToV2([name]: FullNameV1): NameFieldValue {
  return {
    firstname: name.given[0],
    middlename: name.given.slice(1).join(' '),
    surname: name.family
  }
}

export function omitKeyDeep(obj: any, keyToRemove: string): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => omitKeyDeep(item, keyToRemove))
  }
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  const newObj: any = {}
  for (const key of Object.keys(obj)) {
    if (key !== keyToRemove) {
      newObj[key] = omitKeyDeep(obj[key], keyToRemove)
    }
  }
  return newObj
}

function isObject(value: unknown): value is Record<string, unknown> {
  return _.isPlainObject(value)
}

/**
 * Flattens an object into a list of [key, value] pairs using dot/bracket notation.
 */
export function flattenEntries<T>(
  obj: T,
  path: string = ''
): [string, unknown][] {
  if (Array.isArray(obj)) {
    return obj.flatMap((value, index) =>
      flattenEntries(value, `${path}[${index}]`)
    )
  }

  if (isObject(obj)) {
    return Object.entries(obj).flatMap(([key, value]) =>
      flattenEntries(value, path ? `${path}.${key}` : key)
    )
  }

  return obj === undefined ? [] : [[path, obj]]
}
