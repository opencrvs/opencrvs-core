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
import { pinOps } from '@client/views/Unlock/ComparePINs'
import * as bcrypt from 'bcryptjs'

describe('Compare two PINs', () => {
  const pin = '1212'
  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(pin, salt)

  it('should return true when PINs match', async () => {
    const result = await pinOps.comparePins(pin, hash)
    expect(result).toBe(true)
  })

  it('should return false when PINs do not match', async () => {
    const pin2 = '2121'
    const result = await pinOps.comparePins(pin2, hash)
    expect(result).toBe(false)
  })
})
