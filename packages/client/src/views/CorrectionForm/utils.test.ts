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

import { IDeclaration, SUBMISSION_STATUS } from '@client/declarations'
import { Event } from '@client/utils/gateway'
import { isCorrection } from './utils'

let declaration: IDeclaration = {
  id: '72c18939-70c1-40b4-9b80-b162c4871160',
  data: {},
  event: Event.Birth
}

describe('isCorrection()', () => {
  it('should return false if there is no registration status', () => {
    expect(isCorrection(declaration)).toBeFalsy()
  })

  it('should return true if an declaration is registered', () => {
    declaration = {
      ...declaration,
      registrationStatus: SUBMISSION_STATUS.REGISTERED
    }
    expect(isCorrection(declaration)).toBeTruthy()
  })

  it('should return false if an declaration is not registered', () => {
    declaration = {
      ...declaration,
      registrationStatus: SUBMISSION_STATUS.DRAFT
    }
    expect(isCorrection(declaration)).toBeFalsy()
  })
})
