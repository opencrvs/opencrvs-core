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
 * Returns configuration options for the field.
 */
export function createSearchConfig<T extends {}>(baseField: T) {
  return {
    /**
     * Creates a range configuration for the specified field.
     *
     * @returns An object containing the field ID and a configuration object with a type of 'range'.
     *
     * @example event('registeredAt').range()
     * // {
     * //   ...
     * //   config: { type: 'range' }
     * // }
     */
    range: () => ({
      ...baseField,
      config: { type: 'range' as const }
    }),
    /**
     * Creates a configuration for exact matching of the specified field.
     * @returns  An object containing the field ID and a configuration object with a type of 'exact'.
     * @example field('dob').exact()
     * // {
     * //   ...
     * //   config: { type: 'exact' }
     * // }
     */
    exact: () => ({
      ...baseField,
      config: { type: 'exact' as const }
    }),
    /**
     * Creates a configuration for fuzzy matching of the specified field.
     * @returns  An object containing the field ID and a configuration object with a type of 'exact'.
     * @example field('name').fuzzy()
     * // {
     * //   ...
     * //   config: { type: 'fuzzy' }
     * // }
     */
    fuzzy: () => ({
      ...baseField,
      config: { type: 'fuzzy' as const }
    })
  }
}
