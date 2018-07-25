import { getFieldToFocus } from './stepTwoFormUtils'
import { mockState } from '../../tests/util'

describe('loginSelectors', () => {
  it('should return the field to focus', () => {
    const nextField = 'code2'
    expect(getFieldToFocus(mockState.form.STEP_TWO)).toEqual(nextField)
  })
})
