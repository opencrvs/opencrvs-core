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
  mockRegistrarUserResponse,
  flushPromises
} from '@client/tests/util'
import { storage } from '@client/storage'
import { getCmd, getModel } from 'redux-loop'
import { vi, Mock } from 'vitest'
import type { ITokenPayload } from '@opencrvs/commons/client'
import { testDataGenerator } from '@client/tests/test-data-generators'

storage.removeItem = vi.fn()

const removeItem = window.localStorage.removeItem as Mock

describe('profileReducer tests', () => {
  let store: AppStore
  beforeEach(() => {
    getItem.mockReset()
    store = createStore().store
  })

  it('CHECK_AUTH_COMPLETE with an undecodable token redirects to authentication', () => {
    const result = profileReducer(
      initialState,
      actions.checkAuthComplete('bad.token.here')
    )
    expect(getModel(result)).toMatchObject({ authenticated: false })
    expect(getCmd(result)).toMatchObject({
      actionToDispatch: { type: actions.REDIRECT_TO_AUTHENTICATION }
    })
  })

  it('CHECK_AUTH_COMPLETE with a decodable token sets authenticated and schedules setInitialUserDetails', () => {
    const token = testDataGenerator().user.token.fieldAgent
    const result = profileReducer(
      initialState,
      actions.checkAuthComplete(token)
    )
    expect(getModel(result)).toMatchObject({ authenticated: true })
    expect(getModel(result).tokenPayload).not.toBeNull()
    const cmd = getCmd(result) as {
      cmds: Array<{ actionToDispatch?: { type: string } }>
    }
    expect(
      cmd.cmds.some(
        (c) => c.actionToDispatch?.type === actions.SET_INITIAL_USER_DETAILS
      )
    ).toBe(true)
  })

  it('CHECK_AUTH schedules an async Cmd.run', () => {
    const result = profileReducer(initialState, actions.checkAuth())
    const cmd = getCmd(result) as { func?: unknown }
    expect(typeof cmd.func).toBe('function')
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
    await flushPromises()
    expect(store.getState().profile.authenticated).toEqual(false)
    expect(store.getState().profile.userDetailsFetched).toEqual(false)
    expect(store.getState().profile.tokenPayload).toEqual(null)
    expect(store.getState().profile.userDetails).toEqual(null)
    expect(storage.removeItem).toBeCalled()
    expect(removeItem).toBeCalled()
  })
})
