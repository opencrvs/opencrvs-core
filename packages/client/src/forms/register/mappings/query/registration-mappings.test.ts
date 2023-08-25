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

import { convertToLocal } from './registration-mappings'

describe('phone number conversion from international format back to local format', () => {
  it('replaces country code', async () => {
    expect(convertToLocal('+260211000000', 'ZMB')).toBe('0211000000')
    expect(convertToLocal('+358504700715', 'FIN')).toBe('0504700715')
    expect(convertToLocal('+237666666666', 'CMR')).toBe('666666666')
  })
})
