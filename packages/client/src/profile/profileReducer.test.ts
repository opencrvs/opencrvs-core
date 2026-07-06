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
    // fieldAgent JWT from testDataGenerator (no exp claim → getTokenPayload still decodes → authenticated:true)
    const token =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXdvcmtxdWV1ZSZpZHM9YWxsLWV2ZW50cyxhc3NpZ25lZC10by15b3UscmVjZW50LHJlcXVpcmVzLXVwZGF0ZXMsc2VudC1mb3ItcmV2aWV3IiwidHlwZT1yZWNvcmQuc2VhcmNoIiwidHlwZT1yZWNvcmQuY3JlYXRlIiwidHlwZT1yZWNvcmQucmVhZCIsInR5cGU9cmVjb3JkLm5vdGlmeSIsInR5cGU9cmVjb3JkLmRlY2xhcmUiLCJ0eXBlPXJlY29yZC5lZGl0Il0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJGSUVMRF9BR0VOVCIsImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiOGY4YjQzMWItZWY0Ny00MDY4LWI2NzgtZWYyZGQ5M2U5MjA4In0.XS7EAFINQTq0wTiRTjed9QUmzKiQhI7Ntv-OjeMtsEi2uij7WhURIToMjfl75_GWz9MWtAFGofqtlpenK51fv3wa-VrXgbD4Ku_C-yceLc81JZhWuM-X_gadwfiGr7A4hfLmFpp7kk0VjCeO9zAAnfnnXDBM_Fujow2Nhq2FY_NV94c-uFJsZTo3bRu5jtRTwh7U6Svpg187k5fKltmCrq3WL5vtktSwKAzagidGeBtbPIJ28U-zlWA9OX_N1Ct4bVAgq69ILQvoh_fvbzOtFp6qOF_zbT_EcJ5vGx85k1M1B7bsr5j6Edusu1XnLx-ZSeUdRPXzVssQNYiw4ZdkduR5Z7Q-29ajt0Rka_LOH3VjiFFbUkUH0_bOwBrilPCrftsrKSF4wBtWp3e0h3mDRACr1pZASYAuJXNi4qFGIGTVNaTfw2fYNCCSEkfLDs2BhM1M71IKH3Q8qtYVG36yzB51l6v3IRrEiLEdsMyiU-NOYIzWb8bLGdzW4M4nw5f-qBLHurI9uzbN7D88UzayU0dSCxylkRC_srHlrjfoGwY9z2U7hpJnbBi5pjwwSQ6nTDrpl_Xey5_kJhmELV-1F8gEwL_ZkFL_IX9sAJ2gHyYYYJshfyrk3W4C_yYktwGg7I1PlMghNhQ-pG9j-idUptxFSG12L6NWb9hnm6fCAgc'
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
