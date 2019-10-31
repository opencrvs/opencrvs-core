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
import { getUserDetails, getUserLocation } from '@performance/utils/userUtils'
import { user, userDetails } from '@performance/tests/util'
import { cloneDeep } from 'lodash'
import { GQLUser } from '@opencrvs/gateway/src/graphql/schema'

describe('getUserDetails', () => {
  it('returns the correctly formatted user details', () => {
    expect(getUserDetails((user as unknown) as GQLUser)).toEqual(userDetails)
  })
})

describe('getUserLocation', () => {
  it('returns the correct location', () => {
    expect(getUserLocation(userDetails)).toEqual({
      id: '0627c48a-c721-4ff9-bc6e-1fba59a2332a'
    })
  })

  it('Throws error if primaryOffice is missing for loggedin user', () => {
    const clonedDetails = cloneDeep(userDetails)
    delete clonedDetails.primaryOffice
    expect(() => getUserLocation(clonedDetails)).toThrowError(
      'The user has no primary office'
    )
  })
})
