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

import { formatDateFieldValue } from './utils'

describe('Verify formatDateFieldValue', () => {
  it('Formats date properly', () => {
    const cases = [
      {
        input: '--',
        expectedOutput: '00-00-00'
      },
      {
        input: '01-02-',
        expectedOutput: '01-02-00'
      },
      {
        input: '1-2-3',
        expectedOutput: '01-02-03'
      },
      {
        input: '01-2-32',
        expectedOutput: '01-02-32'
      },
      {
        input: '2025-2-3',
        expectedOutput: '2025-02-03'
      }
    ]

    cases.forEach(({ input, expectedOutput }) =>
      expect(formatDateFieldValue(input)).toBe(expectedOutput)
    )
  })
})
