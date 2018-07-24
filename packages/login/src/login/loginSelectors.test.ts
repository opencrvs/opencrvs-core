import {
  getSubmissionError,
  getResentSMS,
  getStepSubmitting,
  getFieldToFocus
} from './loginSelectors'
import { mockState } from '../tests/util'

describe('loginSelectors', () => {
  describe('selectors', () => {
    it('should return submission error boolean', () => {
      const submissionError = false
      expect(getSubmissionError(mockState)).toEqual(submissionError)
    })
    it('should return resentSMS boolean', () => {
      const resentSMS = false
      expect(getResentSMS(mockState)).toEqual(resentSMS)
    })
    it('should return stepSubmitting boolean', () => {
      const stepSubmitting = false
      expect(getStepSubmitting(mockState)).toEqual(stepSubmitting)
    })
    it('should return the field to focus', () => {
      const nextField = 'code2'
      expect(getFieldToFocus(mockState)).toEqual(nextField)
    })
  })
})
