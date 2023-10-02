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
import {
  generateVerificationCode,
  getVerificationCodeDetails,
  generateNonce,
  checkVerificationCode,
  deleteUsedVerificationCode
} from '@auth/features/verifyCode/service'

import { CONFIG_SMS_CODE_EXPIRY_SECONDS } from '@auth/constants'

const nonce = '12345'

describe('verifyCode service', () => {
  describe('generateVerificationCode', () => {
    it('generates a pseudo random 6 digit code', async () => {
      const code = expect.stringMatching(/^\d{6}$/)
      return generateVerificationCode(nonce).then((data) => {
        expect(data).toEqual(code)
      })
    })
  })

  describe('getVerificationCodeDetails', () => {
    it('stores and returns a valid code object', async () => {
      Date.now = jest.fn(() => 1487076708000)
      const codeDetails = {
        code: expect.stringMatching(/^\d{6}$/),
        createdAt: 1487076708000
      }
      await generateVerificationCode(nonce)
      const data = await getVerificationCodeDetails(nonce)
      expect(data).toEqual(codeDetails)
    })
  })

  describe('generateNonce', () => {
    it('generates a valid cryptographic nonce', () => {
      const cryptoString = expect.stringMatching(/^\S{24}$/)
      expect(generateNonce()).toEqual(cryptoString)
    })
  })

  describe('checkVerificationCode', () => {
    it('throws error if verification code does not match', async () => {
      const codeCreationTime = 1487076708000
      Date.now = jest.fn(() => codeCreationTime + 60 * 1000)

      await generateVerificationCode(nonce)
      return expect(checkVerificationCode(nonce, 'abcdef')).rejects.toThrow(
        'Auth code invalid'
      )
    })

    it('throws error if verification code expired', async () => {
      const codeCreationTime = 1487076708000

      Date.now = jest.fn(() => codeCreationTime)
      const code = await generateVerificationCode(nonce)

      Date.now = jest.fn(
        () => codeCreationTime + (CONFIG_SMS_CODE_EXPIRY_SECONDS + 60) * 1000
      )
      return expect(checkVerificationCode(nonce, code)).rejects.toThrow(
        'Auth code expired'
      )
    })

    it('throws error if no verification code was generated', () =>
      expect(
        checkVerificationCode('abracaDabra7210', 'abcdef')
      ).rejects.toThrow('Auth code not found'))

    it('does not throw any error if verification code is ok', async () => {
      const codeCreationTime = 1487076708000
      Date.now = jest.fn(() => codeCreationTime + 60 * 1000)

      const code = await generateVerificationCode(nonce)
      return expect(checkVerificationCode(nonce, code)).resolves.toBeUndefined()
    })
  })

  describe('deleteUsedVerificationCode', () => {
    it('deletes a code without error', async () => {
      await generateVerificationCode(nonce)
      return expect(deleteUsedVerificationCode(nonce)).resolves.toBe(true)
    })
  })
})
