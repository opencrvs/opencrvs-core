import { getAuthenticated, getScope } from '@register/profile/profileSelectors'
import { getInitialState } from '@register/tests/util'

describe('profileSelectors', () => {
  describe('selectors', () => {
    it('should return authenticated boolean', () => {
      const authenticated = false
      expect(getAuthenticated(getInitialState())).toEqual(authenticated)
    })
    it('should return scope', () => {
      const scope = null
      expect(getScope(getInitialState())).toEqual(scope)
    })
  })
})
