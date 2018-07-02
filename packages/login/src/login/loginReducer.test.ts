import * as actions from './loginActions'
import { loginReducer, initialState } from './loginReducer'

jest.mock('../utils/authApi')

describe('loginReducer tests', () => {
  it('should update the state with data ready to send to authorise service', () => {
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
    const returnedState = loginReducer(expectedState, action)[0]
    expect(returnedState).toEqual(expectedState)
  })
  it('should update the state when nonce and mobile is returned from the authorise service', () => {
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
        password: 'test'
      }
    }
    const action = {
      type: actions.STEP_ONE_SUCCESS,
      payload: {
        nonce: '1234',
        mobile: '+447111111111'
      }
    }
    const returnedState = loginReducer(expectedState, action)[0]
    expect(returnedState).toEqual(expectedState)
  })
  it('should update the state when step one is completed', () => {
    const expectedState = {
      ...initialState,
      stepOneSubmitting: false,
      submissionError: false
    }
    const action = {
      type: actions.STEP_ONE_COMPLETE
    }
    const returnedState = loginReducer(expectedState, action)
    expect(returnedState).toEqual(expectedState)
  })
  it('should update the state when step two is completed', () => {
    const expectedState = {
      ...initialState,
      stepOneSubmitting: false,
      submissionError: false
    }
    const action = {
      type: actions.STEP_TWO_COMPLETE
    }
    const returnedState = loginReducer(expectedState, action)
    expect(returnedState).toEqual(expectedState)
  })
})
