import * as actions from './profileActions'
import { initialState } from './profileReducer'
import { createStore, AppStore } from '../store'

describe('profileReducer tests', () => {
  let store: AppStore
  beforeEach(() => {
    store = createStore()
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
})
