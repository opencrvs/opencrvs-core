import * as moxios from 'moxios'
import * as actions from './actions'
import { initialState } from './reducer'
import { createStore, AppStore } from '../store'
import { resolve } from 'url'
import { config } from '../config'
import { client } from '../utils/authApi'

import {
  getSubmissionError,
  getResentSMS,
  getStepSubmitting
} from './selectors'
import { mockState } from '../tests/util'

describe('actions', () => {
  it('startStepOne should clean mobile number by locale and dispatch START_STEP_ONE action', () => {
    const action = {
      type: actions.START_STEP_ONE,
      payload: {
        mobile: '+447111111111',
        password: 'test'
      }
    }
    expect(
      actions.startStepOne({ mobile: '07111111111', password: 'test' })
    ).toEqual(action)
  })
  it('submitStepOneSuccess should dispatch', () => {
    const action = {
      type: actions.STEP_ONE_SUCCESS,
      payload: {
        nonce: '1234'
      }
    }
    expect(
      actions.submitStepOneSuccess({
        nonce: '1234'
      })
    ).toEqual(action)
  })
  it('submitStepOneFailed should dispatch', () => {
    const err = {
      name: '',
      config: {},
      message: ''
    }
    const action = {
      type: actions.STEP_ONE_FAILED,
      payload: err
    }
    expect(actions.submitStepOneFailed(err)).toEqual(action)
  })

  it('startStepTwo should join 6 separate code numbers and dispatch a START_STEP_TWO action', () => {
    const action = {
      type: actions.START_STEP_TWO,
      payload: {
        code: '123456'
      }
    }
    expect(
      actions.startStepTwo({
        code1: '1',
        code2: '2',
        code3: '3',
        code4: '4',
        code5: '5',
        code6: '6'
      })
    ).toEqual(action)
  })
  it('submitStepTwoSuccess should dispatch', () => {
    const action = {
      type: actions.STEP_TWO_SUCCESS,
      payload: {
        nonce: '1234'
      }
    }
    expect(
      actions.submitStepTwoSuccess({
        nonce: '1234'
      })
    ).toEqual(action)
  })
  it('submitStepTwoFailed should dispatch', () => {
    const err = {
      name: '',
      config: {},
      message: ''
    }
    const action = {
      type: actions.STEP_TWO_FAILED,
      payload: err
    }
    expect(actions.submitStepTwoFailed(err)).toEqual(action)
  })
  it('resendSMS should dispatch', () => {
    const action = {
      type: actions.RESEND_SMS
    }
    expect(actions.resendSMS()).toEqual(action)
  })
  it('resendSMSSuccess should dispatch', () => {
    const action = {
      type: actions.RESEND_SMS_SUCCESS,
      payload: {
        nonce: '123456'
      }
    }
    expect(
      actions.resendSMSSuccess({
        nonce: '123456'
      })
    ).toEqual(action)
  })
  it('resendSMSFailed should dispatch', () => {
    const err = {
      name: '',
      config: {},
      message: ''
    }
    const action = {
      type: actions.RESEND_SMS_FAILED,
      payload: err
    }
    expect(actions.resendSMSFailed(err)).toEqual(action)
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
      stepSubmitting: true,
      submissionError: false,
      resentSMS: false,
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
      stepSubmitting: false,
      submissionError: false,
      resentSMS: false,
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
      stepSubmitting: false,
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
      stepSubmitting: false,
      submissionError: false,
      resentSMS: true,
      stepTwoDetails: {
        nonce: '1234'
      }
    }
    const action = {
      type: actions.RESEND_SMS_SUCCESS,
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
      stepSubmitting: true,
      submissionError: false,
      resentSMS: false
    }

    const action = {
      type: actions.START_STEP_TWO,
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
  it('returns stepSubmitting boolean', () => {
    const stepSubmitting = false
    expect(getStepSubmitting(mockState)).toEqual(stepSubmitting)
  })
})
