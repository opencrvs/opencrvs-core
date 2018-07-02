import { getSubmissionError } from './loginSelectors'
import { mockState } from '../tests/util'

describe('intlSelectors', () => {
  describe('getSubmissionError', () => {
    it('should return submission error boolean', () => {
      const submissionError = false
      expect(getSubmissionError(mockState)).toEqual(submissionError)
    })
  })
})
