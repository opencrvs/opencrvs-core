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
export function createFieldConfigs(fieldId: string) {
  const baseField = {
    fieldId,
    fieldType: 'field' as const
  }

  return {
    /**
     * Creates a range configuration for the specified field.
     *
     * @returns An object containing the field ID and a configuration object with a type of 'RANGE'.
     *
     * @example field('age').range()
     * // {
     * //   fieldId: 'age',
     * //   config: { type: 'RANGE' }
     * // }
     */
    range: () => ({
      ...baseField,
      config: { type: 'RANGE' as const }
    }),
    /**
     * Creates a configuration for exact matching of the specified field.
     * @returns  An object containing the field ID and a configuration object with a type of 'EXACT'.
     * @example field('dob').exact()
     * // {
     * //   fieldId: 'dob',
     * //   config: { type: 'EXACT' }
     * // }
     */
    exact: () => ({
      ...baseField,
      config: { type: 'EXACT' as const }
    }),
    /**
     * Creates a configuration for fuzzy matching of the specified field.
     * @returns  An object containing the field ID and a configuration object with a type of 'EXACT'.
     * @example field('name').fuzzy()
     * // {
     * //   fieldId: 'name',
     * //   config: { type: 'FUZZY' }
     * // }
     */
    fuzzy: () => ({
      ...baseField,
      config: { type: 'FUZZY' as const }
    })
  }
}
