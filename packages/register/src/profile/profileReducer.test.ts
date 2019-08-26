import * as actions from '@register/profile/profileActions'
import { initialState } from '@register/profile/profileReducer'
import { createStore, AppStore } from '@register/store'
import {
  mockUserResponse,
  getItem,
  mockUserSignature,
  mockRegAgentUserResponse
} from '@register/tests/util'
import { storage } from '@register/storage'

storage.removeItem = jest.fn()

const removeItem = window.localStorage.removeItem as jest.Mock

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

  it('sets user signature', async () => {
    store.dispatch({
      type: actions.SET_USER_DETAILS,
      payload: mockRegAgentUserResponse
    })

    const action = {
      type: actions.SET_USER_SIGNATURE,
      payload: mockUserSignature
    }
    store.dispatch(action)

    const userDetails = store.getState().profile.userDetails
    let signatureData = ''

    if (userDetails) {
      signatureData = userDetails.signatureData as string
    }

    expect(signatureData).toEqual(mockUserSignature.data.getSignature.data)
  })

  it('removes details, tike and logs out a user', async () => {
    const action = {
      type: actions.REDIRECT_TO_AUTHENTICATION
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
