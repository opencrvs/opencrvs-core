import { getAuthenticated } from './profileSelectors'
import { mockState } from '../tests/util'

describe('profileSelectors', () => {
  describe('selectors', () => {
    it('should return authenticated boolean', () => {
      const authenticated = false
      expect(getAuthenticated(mockState)).toEqual(authenticated)
    })
  })
})
