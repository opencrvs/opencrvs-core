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
import { getDeathMutationMappings } from '@client/views/DataProvider/death/mutations'
import { Action } from '@client/forms'

describe('When calling getDeathQueryMappings', () => {
  it('Should return the Query for certification', () => {
    const query = getDeathMutationMappings(Action.COLLECT_CERTIFICATE)
    expect(query).not.toBe(null)
    if (query && query.dataKey) {
      expect(query.dataKey).toEqual('markDeathAsCertified')
    } else {
      throw new Error('Failed')
    }
  })

  it('Should return null', () => {
    const query = getDeathMutationMappings(Action.LOAD_REVIEW_DECLARATION)
    expect(query).toBe(null)
  })
})
