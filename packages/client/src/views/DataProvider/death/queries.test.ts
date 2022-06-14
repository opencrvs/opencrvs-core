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
  GET_DEATH_REGISTRATION_FOR_CERTIFICATION,
  getDeathQueryMappings
} from '@client/views/DataProvider/death/queries'
import { Action } from '@client/forms'

describe('When calling getDeathQueryMappings', () => {
  it('Should return the Query for certification', () => {
    const query = getDeathQueryMappings(Action.LOAD_CERTIFICATE_DECLARATION)
    expect(query).not.toBe(null)
    if (query && query.query) {
      expect(query.query).toEqual(GET_DEATH_REGISTRATION_FOR_CERTIFICATION)
    } else {
      throw new Error('Failed')
    }
  })

  it('Should return null', () => {
    const query = getDeathQueryMappings(Action.SUBMIT_FOR_REVIEW)
    expect(query).toBe(null)
  })
})
