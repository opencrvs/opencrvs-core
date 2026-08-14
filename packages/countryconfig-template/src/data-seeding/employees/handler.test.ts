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
import { describe, expect, test } from 'vitest'
import { employeesCsvForEnvironment } from './handler'

describe('employeesCsvForEnvironment', () => {
  test('picks production-employees.csv for the production environment', () => {
    expect(employeesCsvForEnvironment('production')).toBe(
      'production-employees.csv'
    )
  })

  test('falls back to default-employees.csv for any other environment', () => {
    expect(employeesCsvForEnvironment('staging')).toBe('default-employees.csv')
    expect(employeesCsvForEnvironment('development')).toBe(
      'default-employees.csv'
    )
    expect(employeesCsvForEnvironment('')).toBe('default-employees.csv')
  })
})
