import * as actions from './actions'
import { initialState } from './reducer'
import { createStore, AppStore } from 'src/store'

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
})
