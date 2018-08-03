import { getSubmissionError } from './registrationSelectors'
import { mockState } from '../tests/util'

describe('registrationSelectors', () => {
  describe('selectors', () => {
    it('should return submission error boolean', () => {
      const submissionError = false
      expect(getSubmissionError(mockState)).toEqual(submissionError)
    })
  })
})
