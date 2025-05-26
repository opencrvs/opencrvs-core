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

import { convertToLocal } from './registration-mappings'
describe('convertToLocal', () => {
  describe('given number in international format', () => {
    it('replaces country code and returns local format', async () => {
      expect(convertToLocal('+260211000000', 'ZMB')).toBe('0211000000')
      expect(convertToLocal('+358504700715', 'FIN')).toBe('0504700715')
      expect(convertToLocal('+237666666666', 'CMR')).toBe('666666666')
      expect(convertToLocal('+8801700000000', 'BGD')).toBe('01700000000')
      expect(convertToLocal('+260211000000')).toBe('0211000000')
      expect(convertToLocal('+358504700715')).toBe('0504700715')
      expect(convertToLocal('+237666666666')).toBe('666666666')
      expect(convertToLocal('+8801700000000')).toBe('01700000000')
    })
  })

  describe('given number in local format with country code', () => {
    it('returns the local number', async () => {
      expect(convertToLocal('0835114899', 'ZAF')).toBe('0835114899')
      expect(convertToLocal('0650310707', 'SOM')).toBe('0650310707')
      expect(convertToLocal('650310707', 'SOM')).toBe('0650310707')
    })
  })
})
