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
import * as actions from '@client/profile/profileActions'
import { initialState, profileReducer } from '@client/profile/profileReducer'
import { queries } from '@client/profile/queries'
import { createStore, AppStore } from '@client/store'
import {
  mockUserResponse,
  getItem,
  userDetails,
  mockRegistrarUserResponse
} from '@client/tests/util'
import { storage } from '@client/storage'
import { getCmd, getModel } from 'redux-loop'
import { vi, Mock } from 'vitest'
import type { ITokenPayload } from '@opencrvs/commons/client'

storage.removeItem = vi.fn()

const removeItem = window.localStorage.removeItem as Mock

describe('profileReducer tests', () => {
  let store: AppStore
  beforeEach(() => {
    getItem.mockReset()
    store = createStore().store
  })

  it('sets user as logged out on bad token', async () => {
    const expectedState = {
      ...initialState,
      authenticated: false
    }

    const action = {
      type: actions.CHECK_AUTH,
      payload: {
        badToken: '12345'
      }
    }
    store.dispatch(action)
    expect(store.getState().profile).toEqual(expectedState)
  })

  it('sets user details', async () => {
    const action = {
      type: actions.SET_USER_DETAILS,
      payload: mockUserResponse
    }
    store.dispatch(action)
    expect(store.getState().profile.userDetailsFetched).toEqual(true)
  })

  it('sets user details for registrar', async () => {
    const action = {
      type: actions.SET_USER_DETAILS,
      payload: mockRegistrarUserResponse
    }
    store.dispatch(action)
    expect(store.getState().profile.userDetailsFetched).toEqual(true)
  })

  describe('modify details', () => {
    beforeEach(() => {
      const action = {
        type: actions.SET_USER_DETAILS,
        payload: mockUserResponse
      }
      store.dispatch(action)
    })

    it('modifies the user details', () => {
      const action = {
        type: actions.MODIFY_USER_DETAILS,
        payload: {
          ...userDetails,
          mobile: '2121'
        }
      }
      store.dispatch(action)
      expect(store.getState().profile.userDetails?.mobile).toBe('2121')
    })
  })

  describe('GET_USER_DETAILS_SUCCESS with valid cache hit', () => {
    it('uses cached details immediately and triggers a background re-fetch', () => {
      const tokenPayload: ITokenPayload = {
        sub: userDetails.id,
        exp: '9999999999',
        algorithm: 'RS256',
        scope: [],
        userType: 'user'
      }
      const stateWithToken = { ...initialState, tokenPayload }

      const result = profileReducer(
        stateWithToken,
        actions.getStorageUserDetailsSuccess(JSON.stringify(userDetails))
      )

      expect(getModel(result).userDetails).toEqual(userDetails)

      const cmd = getCmd(result) as { cmds: unknown[] }
      expect(cmd.cmds).toHaveLength(2)
      expect(cmd.cmds[1]).toMatchObject({
        func: queries.fetchUserDetails,
        args: [userDetails.id]
      })
    })
  })

  it('removes details, tike and logs out a user', async () => {
    const action = {
      type: actions.REDIRECT_TO_AUTHENTICATION,
      payload: {
        redirectBack: false
      }
    }
    store.dispatch(action)
    expect(store.getState().profile.authenticated).toEqual(false)
    expect(store.getState().profile.userDetailsFetched).toEqual(false)
    expect(store.getState().profile.tokenPayload).toEqual(null)
    expect(store.getState().profile.userDetails).toEqual(null)
    expect(storage.removeItem).toBeCalled()
    expect(removeItem).toBeCalled()
  })
})
