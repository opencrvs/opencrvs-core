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
  createTestApp,
  flushPromises,
  generateToken,
  getItem,
  validToken
} from '@client/tests/util'
import { userIds, userScopes } from '@client/tests/test-users'
import { TestUserRole, TokenUserType } from '@opencrvs/commons/client'

import * as actions from '@client/notification/actions'
import { AppStore } from '@client/store'
import { referenceApi } from '@client/utils/referenceApi'
import { ReactWrapper } from 'enzyme'
import { vi } from 'vitest'
import { waitFor } from './tests/wait-for-element'

const expiredToken = generateToken({
  scope: userScopes.fieldAgent,
  subject: userIds.fieldAgent,
  userType: TokenUserType.enum.user,
  role: TestUserRole.enum.FIELD_AGENT,
  exp: Math.floor(new Date('2018-07-05T00:00:00Z').getTime() / 1000)
})

const realLocation = window.location
const assign = vi.fn()

beforeEach(() => {
  getItem.mockReset()
  assign.mockReset()
})

beforeAll(() => {
  vi.stubGlobal('location', {
    ...realLocation,
    assign
  })
})

afterAll(() => {
  window.location = realLocation as string & Location
})

it('renders without crashing', () =>
  createTestApp({ waitUntilOfflineCountryConfigLoaded: false }))

it("redirects user to SSO if user doesn't have a token", async () => {
  await createTestApp({ waitUntilOfflineCountryConfigLoaded: false })
  await waitFor(() => assign.mock.calls[0][0].includes('/login'))
})

describe('when user has a valid token in url but an expired one in localStorage', () => {
  beforeEach(async () => {
    getItem.mockReturnValue(expiredToken)
    window.history.replaceState('', '', '?token=' + validToken)
  })

  it("doesn't redirect user to SSO", async () => {
    await createTestApp({ waitUntilOfflineCountryConfigLoaded: false })
    expect(assign.mock.calls).toHaveLength(0)
  })

  it("doesn't redirect user to SSO if user has a token in their URL", async () => {
    const token = validToken

    window.history.replaceState({}, '', '?token=' + token)

    await createTestApp({ waitUntilOfflineCountryConfigLoaded: false }, [
      '/?token=' + token
    ])

    expect(assign.mock.calls).toHaveLength(0)
  })
})

describe('when user has a valid token in local storage', () => {
  beforeEach(() => {
    vi.unmock('@client/utils/referenceApi')
    getItem.mockReturnValue(validToken)
  })

  it("doesn't redirect user to SSO", async () => {
    createTestApp()
    await flushPromises()
    expect(assign.mock.calls).toHaveLength(0)
  })

  it('loads content on startup', async () => {
    const loadContent = vi.spyOn(referenceApi, 'loadContent')

    createTestApp()
    await flushPromises()
    expect(loadContent).toHaveBeenCalled()
  })
})
