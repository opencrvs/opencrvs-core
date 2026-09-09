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
  test('uses <environment>-employees.csv when that file exists', () => {
    // `default-employees.csv` ships in the source directory, so 'default'
    // resolves to it through the environment-file branch.
    expect(employeesCsvForEnvironment('default')).toBe('default-employees.csv')
  })

  test('falls back to default-employees.csv when no environment file exists', () => {
    expect(employeesCsvForEnvironment('no-such-environment')).toBe(
      'default-employees.csv'
    )
  })
})
