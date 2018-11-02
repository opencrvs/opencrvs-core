import { getAuthenticated } from './selectors'
import { getInitialState } from 'src/tests/util'

describe('profileSelectors', () => {
  describe('selectors', () => {
    it('should return authenticated boolean', () => {
      const authenticated = false
      expect(getAuthenticated(getInitialState())).toEqual(authenticated)
    })
  })
})
