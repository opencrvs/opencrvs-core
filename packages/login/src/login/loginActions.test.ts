import * as actions from './loginActions'

describe('loginActions tests', () => {
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
})
