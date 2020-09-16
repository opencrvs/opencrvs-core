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
import {
  identityTypeMapper,
  NATIONAL_ID,
  BIRTH_REGISTRATION_NUMBER,
  DEATH_REGISTRATION_NUMBER
} from '@client/forms/identity'
import { BIG_NUMBER } from '.'

describe('identity maps tests', () => {
  describe('identityTypeMapper tests', () => {
    it('returns NUMBER for NID', () => {
      expect(identityTypeMapper(NATIONAL_ID)).toBe(BIG_NUMBER)
    })

    it('returns NUMBER for BRN', () => {
      expect(identityTypeMapper(BIRTH_REGISTRATION_NUMBER)).toBe(BIG_NUMBER)
    })

    it('returns NUMBER for DRN', () => {
      expect(identityTypeMapper(DEATH_REGISTRATION_NUMBER)).toBe(BIG_NUMBER)
    })
  })
})
