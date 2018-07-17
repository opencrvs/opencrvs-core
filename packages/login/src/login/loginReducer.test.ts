import * as moxios from 'moxios'
import * as actions from './loginActions'
import { initialState } from './loginReducer'
import { createStore, AppStore } from '../store'
import { resolve } from 'url'
import { config } from '../config'
import { client } from '../utils/authApi'

describe('loginReducer tests', () => {
  let store: AppStore
  beforeEach(() => {
    store = createStore()

    moxios.install(client)
    moxios.stubRequest(resolve(config.AUTH_API_URL, 'authenticate'), {
      status: 200,
      responseText: "{ nonce: '12345' }"
    })
  })

  afterEach(() => {
    moxios.uninstall(client)
  })

  it('updates the state with data ready to send to authorise service', async () => {
    const expectedState = {
      ...initialState,
      stepOneSubmitting: true,
      submissionError: false,
      stepOneDetails: {
        mobile: '+447111111111',
        password: 'test'
      }
    }

    const action = {
      type: actions.START_STEP_ONE,
      payload: {
        mobile: '+447111111111',
        password: 'test'
      }
    }
    store.dispatch(action)
    expect(store.getState().login).toEqual(expectedState)
  })
  it('updates the state when nonce is returned from the authorise service', () => {
    const expectedState = {
      ...initialState,
      stepOneSubmitting: false,
      submissionError: false,
      stepTwoDetails: {
        nonce: '1234'
      }
    }
    const action = {
      type: actions.STEP_ONE_SUCCESS,
      payload: {
        nonce: '1234'
      }
    }
    store.dispatch(action)
    expect(store.getState().login).toEqual(expectedState)
  })

  it('updates the state when resend SMS is requested', () => {
    const expectedState = {
      ...initialState,
      stepOneSubmitting: false,
      submissionError: false
    }
    const action = {
      type: actions.RESEND_SMS
    }
    store.dispatch(action)
    expect(store.getState().login).toEqual(expectedState)
  })
})
