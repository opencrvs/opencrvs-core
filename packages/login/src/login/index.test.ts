import * as moxios from 'moxios'
import * as actions from './actions'
import { initialState } from './reducer'
import { createStore, AppStore } from '../store'
import { resolve } from 'url'
import { config } from '../config'
import { client } from '../utils/authApi'

import { getSubmissionError, getResentSMS, getsubmitting } from './selectors'
import { mockState } from '../tests/util'

describe('actions', () => {
  describe('authenticate', () => {
    it('cleans mobile number by country and dispatch START_STEP_ONE action', () => {
      const action = {
        type: actions.AUTHENTICATE,
        payload: {
          mobile: '+8801711111111',
          password: 'test'
        }
      }
      expect(
        actions.authenticate({ mobile: '01711111111', password: 'test' })
      ).toEqual(action)
    })
  })
  describe('verifyCode', () => {
    it('creates a code string from received code object', () => {
      expect(
        actions.verifyCode({
          code1: '1',
          code2: '2',
          code3: '3',
          code4: '4',
          code5: '5',
          code6: '6'
        })
      ).toEqual({
        type: actions.VERIFY_CODE,
        payload: {
          code: '123456'
        }
      })
    })
  })
})

describe('reducer', () => {
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
      submitting: true,
      submissionError: false,
      resentSMS: false,
      stepOneDetails: {
        mobile: '+447111111111',
        password: 'test'
      }
    }

    const action = {
      type: actions.AUTHENTICATE,
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
      submitting: false,
      submissionError: false,
      resentSMS: false,
      authenticationDetails: {
        nonce: '1234'
      }
    }
    const action = {
      type: actions.AUTHENTICATION_COMPLETED,
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
      submitting: false,
      submissionError: false,
      resentSMS: false
    }
    const action = {
      type: actions.RESEND_SMS
    }
    store.dispatch(action)
    expect(store.getState().login).toEqual(expectedState)
  })
  it('updates the state when nonce is returned from the resendSMS service', () => {
    const expectedState = {
      ...initialState,
      submitting: false,
      submissionError: false,
      resentSMS: true,
      authenticationDetails: {
        nonce: '1234'
      }
    }
    const action = {
      type: actions.RESEND_SMS_COMPLETED,
      payload: {
        nonce: '1234'
      }
    }
    store.dispatch(action)
    expect(store.getState().login).toEqual(expectedState)
  })
  it('updates the state with data ready to send to verify sms code service', async () => {
    const expectedState = {
      ...initialState,
      submitting: true,
      submissionError: false,
      resentSMS: false
    }

    const action = {
      type: actions.VERIFY_CODE,
      payload: {
        code: '123456'
      }
    }
    store.dispatch(action)
    expect(store.getState().login).toEqual(expectedState)
  })
})

describe('selectors', () => {
  it('returns submission error boolean', () => {
    const submissionError = false
    expect(getSubmissionError(mockState)).toEqual(submissionError)
  })
  it('returns resentSMS boolean', () => {
    const resentSMS = false
    expect(getResentSMS(mockState)).toEqual(resentSMS)
  })
  it('returns submitting boolean', () => {
    const submitting = false
    expect(getsubmitting(mockState)).toEqual(submitting)
  })
})
