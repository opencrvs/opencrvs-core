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

export const helpers = {
  /**
   * InfluxDB doesn't natively support a "IN" query: `officeLocation IN ('a', 'b')`
   *
   * Usage:
   * ```
   * in('officeLocation', ['a', 'b'])
   * ```
   *
   * Returns:
   * ```
   * [
   *   'officeLocation = $officeLocation0 OR officeLocation = $officeLocation1',
   *   {
   *     officeLocation0: 'a',
   *     officeLocation1: 'b'
   *   }
   * ]
   * ```
   */
  in: (array: string[], fieldKey: string) => {
    const placeholders: Record<string, string> = {}
    const queryParts = []

    for (let i = 0; i < array.length; i++) {
      const placeholderKey = `${fieldKey}${i}`
      placeholders[placeholderKey] = array[i]
      queryParts.push(`${fieldKey} = $${placeholderKey}`)
    }

    return [queryParts.join(' OR '), placeholders] as const
  }
}
