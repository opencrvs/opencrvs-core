import * as actions from '@performance/profile/actions'
import { initialState } from '@performance/profile/reducer'
import { createStore, AppStore } from '@performance/store'
import { mockUserResponse } from '@performance/tests/util'

describe('profileReducer tests', () => {
  let store: AppStore
  beforeEach(() => {
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
})
