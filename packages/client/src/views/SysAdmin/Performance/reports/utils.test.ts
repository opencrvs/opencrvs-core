/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { getValueWithPercentageString } from './utils'

describe('reports utils tests', () => {
  describe('getValueWithPercentage tests', () => {
    it('returns value with percentage string', () => {
      const total = 8
      const value = 3
      const expectedResult = '3 (37%)'

      expect(getValueWithPercentageString(value, total)).toBe(expectedResult)
    })

    it('handles the case when total equals 0', () => {
      const total = 0
      const value = 0
      const expectedResult = '0 (0%)'

      expect(getValueWithPercentageString(value, total)).toBe(expectedResult)
    })
  })
})
