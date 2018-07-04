import * as moxios from 'moxios'
import { createBrowserHistory } from 'history'
import * as actions from './loginActions'
import { initialState } from './loginReducer'
import { createStore } from '../store'
import { resolve } from 'url'
import { config } from '../config'
import { client } from '../utils/authApi'

describe('loginReducer tests', () => {
  let store: any
  beforeEach(() => {
    store = createStore(createBrowserHistory())

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
    expect((store.getState() as any).login).toEqual(expectedState)
  })
  it('updates the state when nonce and mobile is returned from the authorise service', () => {
    const expectedState = {
      ...initialState,
      stepOneSubmitting: false,
      submissionError: false,
      stepTwoDetails: {
        code: '',
        nonce: '1234'
      },
      stepOneDetails: {
        mobile: '+447111111111',
        password: ''
      }
    }
    const action = {
      type: actions.STEP_ONE_SUCCESS,
      payload: {
        nonce: '1234',
        mobile: '+447111111111'
      }
    }
    store.dispatch(action)
    expect((store.getState() as any).login).toEqual(expectedState)
  })

  it('updates the state when step one is completed', () => {
    const expectedState = {
      ...initialState,
      stepOneSubmitting: false,
      submissionError: false
    }
    const action = {
      type: actions.STEP_ONE_COMPLETE
    }
    store.dispatch(action)
    expect((store.getState() as any).login).toEqual(expectedState)
  })

  it('updates the state when step two is completed', () => {
    const expectedState = {
      ...initialState,
      stepOneSubmitting: false,
      submissionError: false
    }
    const action = {
      type: actions.STEP_TWO_COMPLETE
    }
    store.dispatch(action)
    expect((store.getState() as any).login).toEqual(expectedState)
  })
})
