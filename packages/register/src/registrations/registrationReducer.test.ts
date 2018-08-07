import * as actions from './registrationActions'
import { initialState } from './registrationReducer'
import { createStore, AppStore } from '../store'

describe('registrationReducer tests', () => {
  let store: AppStore
  beforeEach(() => {
    store = createStore()
  })

  it('sets user as logged out on bad token', async () => {
    const expectedState = {
      ...initialState,
      firstName: 'Euan'
    }

    const action = {
      type: actions.START_SEND_REGISTRATION_DATA,
      payload: {
        firstName: 'Euan'
      }
    }
    store.dispatch(action)
    expect(store.getState().registration).toEqual(expectedState)
  })
})
