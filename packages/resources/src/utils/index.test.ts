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
import { convertToMSISDN, generateRandomPassword } from '@resources/utils'

describe('Check password generator', () => {
  it('generates a hardcoded password for demo user', () => {
    expect(generateRandomPassword(true)).toEqual('test')
  })
  it('generates a 6 chars length password for other users', () => {
    expect(generateRandomPassword(false)).toHaveLength(6)
  })
})

describe('converToMSISDN', () => {
  it('should send the phone number as it is when it has country code as prefix', () => {
    const phone = '+8801711111111'
    expect(convertToMSISDN(phone, 'bgd')).toEqual(phone)
  })

  it('should attach country code by replacing the starting 0, when the phone number does not have the country code as prefix and starts with 0', async () => {
    const phone = '01711111111'
    expect(convertToMSISDN(phone, 'bgd')).toEqual(`+88${phone}`)
  })

  it('should attach country code when the phone number does not have the country code as prefix and does not start with 0', async () => {
    const phone = '1711111111'
    expect(convertToMSISDN(phone, 'bgd')).toEqual(`+880${phone}`)
  })
})
