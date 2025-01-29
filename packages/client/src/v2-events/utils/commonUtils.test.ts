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
import { isMobileDevice } from '@client/utils/commonUtils'
import { Mock } from 'vitest'

describe('Common Utils Test', () => {
  beforeEach(() => {
    ;(isMobileDevice as Mock).mockRestore()
  })

  it('Should simulate Mobile Devise', () => {
    const mobileDevise = isMobileDevice()
    expect(mobileDevise).toBe(true)
  })

  it('Should Simulate Desktop Devise', () => {
    // @ts-ignore
    global.window.outerWidth = 1920
    const mobileDevise = isMobileDevice()
    expect(mobileDevise).toBe(false)
  })
})
