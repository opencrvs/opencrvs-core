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

import { IApplication, SUBMISSION_STATUS } from '@client/applications'
import { Event } from '@client/forms'
import { isCorrection } from './utils'

let application: IApplication = {
  id: '72c18939-70c1-40b4-9b80-b162c4871160',
  data: {},
  event: Event.BIRTH
}

describe('isCorrection()', () => {
  it('should return false if there is no registration status', () => {
    expect(isCorrection(application)).toBeFalsy()
  })

  it('should return true if an application is registered', () => {
    application = {
      ...application,
      registrationStatus: SUBMISSION_STATUS.REGISTERED
    }
    expect(isCorrection(application)).toBeTruthy()
  })

  it('should return false if an application is not registered', () => {
    application = {
      ...application,
      registrationStatus: SUBMISSION_STATUS.DRAFT
    }
    expect(isCorrection(application)).toBeFalsy()
  })
})
