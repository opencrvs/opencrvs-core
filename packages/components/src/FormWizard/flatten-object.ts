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
 * Flattens an object with nested objects into a single level object.
 *
 * @example
 * flatten({ foo: { bar: { baz: 'value' } } })
 * // { "foo.bar.baz": "value" }
 */
export const flatten = <T extends Record<string, unknown>>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  data: object,
  prefix = ''
) => {
  const result: { [key: string]: string | number | null } = {}

  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'object') {
      Object.assign(result, flatten(value, `${prefix}${key}.`))
    } else {
      result[`${prefix}${key}`] = value
    }
  })

  return result as T
}
